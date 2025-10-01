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
      localStorage.setItem('access_token', loginMutation.data.access_token);
      localStorage.setItem('refresh_token', loginMutation.data.refresh_token);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      navigate('/dashboard');
    }
  }, [loginMutation.isSuccess, loginMutation.data, queryClient, navigate]);

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
