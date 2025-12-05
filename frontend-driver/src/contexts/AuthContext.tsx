import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '@/api/services/auth.service';
import type { User, Tenant, LoginCredentials, AuthResponse } from '@/types/auth.types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (credentials: LoginCredentials, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Helper functions pour gérer les deux types de storage
const getStorage = (rememberMe: boolean) => rememberMe ? localStorage : sessionStorage;

const getToken = (key: string): string | null => {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

const setToken = (key: string, value: string, rememberMe: boolean) => {
  const storage = getStorage(rememberMe);
  storage.setItem(key, value);
};

const removeToken = (key: string) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getToken('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();

      // For driver role, no tenant fetching needed
      if (currentUser.role === 'driver') {
        setUser(currentUser);
      } else {
        setUser(currentUser);
        // Optionally fetch tenant for other roles if needed
      }
    } catch (error) {
      removeToken('access_token');
      removeToken('refresh_token');
      removeToken('tenant_id');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials, rememberMe: boolean = false) => {
    const response: AuthResponse = await authService.login(credentials);

    // ✅ VALIDATION: Accepter UNIQUEMENT le rôle driver
    if (response.user.role !== 'driver') {
      if (response.user.role === 'super_admin' || response.user.role === 'support') {
        throw new Error('Accès refusé. Utilisez l\'application administrative interne.');
      }
      if (response.user.role === 'tenant_admin' || response.user.role === 'manager' || response.user.role === 'viewer') {
        throw new Error('Accès refusé. Utilisez l\'application client de votre tenant.');
      }
      throw new Error('Accès refusé. Cette application est réservée aux conducteurs.');
    }

    // Stocker les tokens selon le choix de l'utilisateur
    setToken('access_token', response.access_token, rememberMe);
    setToken('refresh_token', response.refresh_token, rememberMe);

    // Store tenant_id if exists (for compatibility)
    if (response.user.tenantId) {
      setToken('tenant_id', response.user.tenantId.toString(), rememberMe);
    }

    setUser(response.user);

    // No tenant fetching for driver role
    if (response.user.role !== 'driver') {
      // Could fetch tenant for other roles if needed
    }
  };

  const logout = async () => {
    await authService.logout();

    // Nettoyer les deux storages
    removeToken('access_token');
    removeToken('refresh_token');
    removeToken('tenant_id');

    setUser(null);
    setTenant(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
