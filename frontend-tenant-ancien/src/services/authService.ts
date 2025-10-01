// client/src/services/authService.ts
import { api } from "@/lib/api";

export const login = async (email: string, password: string) => {
  const loginData = {
    email: email,
    password: password,
  };

  const response = await api.post("/auth/login", loginData, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
  return response.data;
};

// Fonction pour rafraîchir les tokens
export const refreshTokens = async (refreshToken: string) => {
  try {
    const response = await api.post("/auth/refresh", { refreshToken }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors du refresh des tokens:", error);
    throw error;
  }
};

// Fonction pour gérer la connexion réussie
export const handleLoginSuccess = (userData: unknown, accessToken: string, refreshToken?: string) => {
  try {
    // Stocker les données utilisateur et les tokens
    localStorage.setItem("token", accessToken);
    localStorage.setItem("access_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Vérifier que le stockage a réussi
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (!storedToken || !storedUser) {
      throw new Error("Impossible de stocker les données d'authentification");
    }
    
    // Attendre un petit délai pour la synchronisation puis rediriger
    setTimeout(() => {
      // Nettoyage des sessions de callback Google pour éviter les boucles
      sessionStorage.removeItem('google_callback_processed');
      
      // Redirection vers le dashboard
      window.location.href = "/dashboard";
    }, 100);
    
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    
    // En cas d'erreur, rediriger vers login
    setTimeout(() => {
      window.location.href = "/login?error=storage_failed";
    }, 100);
  }
};

// Fonction pour vérifier l'authentification
export const checkAuthentication = () => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return {
      isAuthenticated: !!token,
      user: user ? JSON.parse(user) : null,
      token
    };
  } catch (error) {
    console.error("Erreur lors de la vérification de l'authentification:", error);
    return {
      isAuthenticated: false,
      user: null,
      token: null
    };
  }
};

// Fonction pour résoudre le tenant depuis le domaine
export const resolveTenantFromDomain = async () => {
  try {
    const response = await api.get("/auth/tenant-from-host");
    return response.data.tenant;
  } catch (error) {
    console.error("Erreur lors de la résolution du tenant:", error);
    throw new Error("Impossible de déterminer le tenant pour ce domaine");
  }
};

// Fonction d'inscription pour les utilisateurs tenant
export const registerTenantUser = async (userData: {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirmation: string;
  company_name?: string;
  phone?: string;
}) => {
  try {
    // Résoudre le tenant depuis le domaine
    const tenant = await resolveTenantFromDomain();
    
    if (!tenant?.id) {
      throw new Error("Impossible de déterminer le tenant pour ce domaine");
    }

    // Préparer les données d'inscription avec le tenant_id
    const registrationData = {
      ...userData,
      tenant_id: tenant.id,
    };

    const response = await api.post("/auth/register-tenant-user", registrationData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    throw error;
  }
};

// Fonction pour l'inscription classique (création d'un nouveau tenant - admin)
export const register = async (userData: {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirmation: string;
  company_name: string;
  domain?: string;
}) => {
  try {
    const response = await api.post("/auth/register", userData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'inscription admin:", error);
    throw error;
  }
};

// Interface pour les données de setup du tenant
export interface TenantSetupData {
  company_name: string;
  industry: string;
  company_size: string;
  phone?: string;
  address?: string;
  description?: string;
}

// Fonction pour compléter la configuration du tenant
export const completeTenantSetup = async (data: TenantSetupData) => {
  try {
    const response = await api.put("/tenant/complete-setup", data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Mettre à jour les données utilisateur dans le localStorage si nécessaire
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (currentUser && response.data.tenant) {
      currentUser.tenant = response.data.tenant;
      currentUser.needs_setup = false;
      localStorage.setItem("user", JSON.stringify(currentUser));
    }

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la configuration du tenant:", error);
    throw error;
  }
};

// Fonction pour vérifier si l'utilisateur a besoin du setup
export const needsTenantSetup = (): boolean => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.needs_setup === true;
  } catch (error) {
    console.error("Erreur lors de la vérification du setup:", error);
    return false;
  }
};

// Fonction pour obtenir les données utilisateur actuelles
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
};


