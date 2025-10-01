// useInternalAuth.ts - Hook d'authentification pour l'interface d'administration

import { useState, useEffect } from 'react';
import { internalAuthService, InternalUser } from '@/services/internalAuthService';

interface UseInternalAuthReturn {
  user: InternalUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<InternalUser>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  checkAuth: () => void;
}

/**
 * Hook d'authentification pour les administrateurs internes FlotteQ
 */
export const useInternalAuth = (): UseInternalAuthReturn => {
  const [user, setUser] = useState<InternalUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au chargement
  const checkAuth = () => {
    try {
      const isAuth = internalAuthService.isAuthenticated();
      const currentUser = internalAuthService.getCurrentUser();
      
      setIsAuthenticated(isAuth);
      setUser(currentUser);
    } catch (error) {
      console.error("Erreur lors de la vérification d'authentification:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Connexion
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await internalAuthService.login({ email, password });
      
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      setIsLoading(true);
      await internalAuthService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mise à jour du profil
  const updateProfile = async (data: Partial<InternalUser>) => {
    try {
      const updatedUser = await internalAuthService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  };

  // Vérifier les permissions
  const hasPermission = (permission: string): boolean => {
    return internalAuthService.hasPermission(permission);
  };

  // Vérifier les rôles
  const hasRole = (role: string): boolean => {
    return internalAuthService.hasRole(role);
  };

  // Effet pour vérifier l'authentification au montage
  useEffect(() => {
    checkAuth();
  }, []);

  // Actualiser le profil périodiquement si connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      const interval = setInterval(async () => {
        try {
          const updatedUser = await internalAuthService.getProfile();
          setUser(updatedUser);
        } catch (error) {
          // Si l'actualisation échoue, cela peut indiquer que la session a expiré
          console.warn("Échec de l'actualisation du profil:", error);
        }
      }, 300000); // Actualiser toutes les 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateProfile,
    hasPermission,
    hasRole,
    checkAuth,
  };
}; 