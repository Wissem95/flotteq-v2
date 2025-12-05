import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { authApi } from '@/api/endpoints/auth';
import type { LoginDto } from '@/api/types/auth.types';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query pour récupérer l'utilisateur connecté
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
    enabled: !!localStorage.getItem('access_token'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation pour login
  const loginMutation = useMutation({
    mutationFn: authApi.login,
  });

  // Effect pour gérer le succès du login
  useEffect(() => {
    if (loginMutation.isSuccess && loginMutation.data) {
      const userData = loginMutation.data.user;

      // ✅ VALIDATION: Accepter UNIQUEMENT super_admin et support
      if (userData.role !== 'super_admin' && userData.role !== 'support') {
        loginMutation.reset();

        if (userData.role === 'tenant_admin' || userData.role === 'manager' || userData.role === 'viewer') {
          alert('Accès refusé. Utilisez l\'application client de votre tenant.');
        } else if (userData.role === 'driver') {
          alert('Accès refusé. Utilisez l\'application conducteur.');
        } else {
          alert('Accès refusé. Cette application est réservée aux administrateurs FlotteQ.');
        }
        return;
      }

      // ✅ VALIDATION: Vérifier tenantId = 1 (FlotteQ)
      if (userData.tenantId !== 1) {
        loginMutation.reset();
        alert('Accès refusé. Vous devez être membre de FlotteQ (tenantId=1).');
        return;
      }

      localStorage.setItem('access_token', loginMutation.data.access_token);
      localStorage.setItem('refresh_token', loginMutation.data.refresh_token);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      navigate('/dashboard');
    }
  }, [loginMutation.isSuccess, loginMutation.data, queryClient, navigate, loginMutation]);

  // Mutation pour logout
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
  });

  // Effect pour gérer le succès du logout
  useEffect(() => {
    if (logoutMutation.isSuccess) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      queryClient.clear();
      navigate('/login');
    }
  }, [logoutMutation.isSuccess, queryClient, navigate]);

  const login = (data: LoginDto) => {
    loginMutation.mutate(data);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isError,
    login,
    logout,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    isLoginError: loginMutation.isError,
  };
};
