// internalAuthService.ts - Service d'authentification pour l'interface d'administration

import { api } from "@/lib/api";

export interface InternalUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'support' | 'partner_manager' | 'analyst';
  permissions: string[];
  avatar?: string;
  created_at: string;
  last_login?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: InternalUser;
  token: string;
  message: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
}

/**
 * Service d'authentification pour les administrateurs internes FlotteQ
 */
export const internalAuthService = {
  /**
   * Connexion d'un administrateur
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Utiliser l'endpoint d'authentification interne spécifique
      const response = await api.post('/internal/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      
      // Stocker les données d'authentification
      if (response.data.token) {
        localStorage.setItem("internal_token", response.data.token);
        localStorage.setItem("internal_user", JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la connexion admin:", error);
      throw new Error(error.response?.data?.message || "Erreur de connexion");
    }
  },

  /**
   * Vérifier si l'API et la base de données sont accessibles
   */
  async checkDatabaseConnection(): Promise<boolean> {
    try {
      const response = await api.get('/internal/auth/health/database');
      return response.status === 200 && response.data.status === 'ok';
    } catch (error) {
      console.warn("Base de données non accessible:", error);
      return false;
    }
  },


  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await api.post('/internal/auth/logout');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Nettoyer le stockage local même en cas d'erreur
      localStorage.removeItem("internal_token");
      localStorage.removeItem("internal_user");
    }
  },

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile(): Promise<InternalUser> {
    try {
      const response = await api.get('/internal/auth/me');
      
      // Mettre à jour les données stockées
      localStorage.setItem("internal_user", JSON.stringify(response.data.user));
      
      return response.data.user;
    } catch (error: any) {
      console.error("Erreur lors de la récupération du profil:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de la récupération du profil");
    }
  },

  /**
   * Mettre à jour le profil
   */
  async updateProfile(data: Partial<InternalUser>): Promise<InternalUser> {
    try {
      const response = await api.put('/internal/auth/profile', data);
      
      // Mettre à jour les données stockées
      localStorage.setItem("internal_user", JSON.stringify(response.data.user));
      
      return response.data.user;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
  },

  /**
   * Changer le mot de passe
   */
  async changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> {
    try {
      const response = await api.put('/internal/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors du changement de mot de passe:", error);
      throw new Error(error.response?.data?.message || "Erreur lors du changement de mot de passe");
    }
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("internal_token");
    const user = localStorage.getItem("internal_user");
    return !!(token && user);
  },

  /**
   * Récupérer l'utilisateur depuis le stockage local
   */
  getCurrentUser(): InternalUser | null {
    try {
      const userString = localStorage.getItem("internal_user");
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return null;
    }
  },

  /**
   * Vérifier si l'utilisateur a une permission spécifique
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Super admin a toutes les permissions
    if (user.role === 'super_admin') return true;
    
    return user.permissions.includes(permission);
  },

  /**
   * Vérifier si l'utilisateur a un rôle spécifique ou supérieur
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const roleHierarchy = ['analyst', 'partner_manager', 'support', 'admin', 'super_admin'];
    const userRoleIndex = roleHierarchy.indexOf(user.role);
    const requiredRoleIndex = roleHierarchy.indexOf(role);
    
    return userRoleIndex >= requiredRoleIndex;
  }
}; 