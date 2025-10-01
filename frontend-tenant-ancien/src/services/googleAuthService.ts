import { api } from "@/lib/api";


export interface GoogleAuthResponse {
  auth_url: string;
  state: string;
}

export interface GoogleCallbackResponse {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  token: string;
  tenant: {
    id: number;
    name: string;
    domain: string;
  };
}

/**
 * Construire l'URL d'authentification Google
 */
export const getGoogleAuthUrl = (tenantDomain?: string): string => {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://flotteq-backend-v2-production.up.railway.app/api';
  const url = new URL(`${baseUrl}/auth/google/redirect`);
  
  if (tenantDomain) {
    url.searchParams.append('tenant_domain', tenantDomain);
  }
  
  return url.toString();
};

/**
 * Rediriger vers Google OAuth
 */
export const redirectToGoogle = (tenantDomain?: string): void => {
  try {
    // Redirection directe vers l'endpoint OAuth
    const authUrl = getGoogleAuthUrl(tenantDomain);
    window.location.href = authUrl;
  } catch (error) {
    console.error("Erreur lors de l'initiation de l'authentification Google:", error);
    throw error;
  }
};

/**
 * Gérer le callback Google (appelé automatiquement par Google)
 */
export const handleGoogleCallback = async (
  code: string, 
  state: string
): Promise<GoogleCallbackResponse> => {
  try {
    const response = await api.get(`/auth/google/callback?code=${code}&state=${state}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du callback Google:', error);
    throw error;
  }
};

/**
 * Lier un compte Google à un utilisateur existant
 */
export const linkGoogleAccount = async (): Promise<void> => {
  await api.post("/auth/google/link");
};

/**
 * Délier un compte Google
 */
export const unlinkGoogleAccount = async (): Promise<void> => {
  await api.post("/auth/google/unlink");
}; 