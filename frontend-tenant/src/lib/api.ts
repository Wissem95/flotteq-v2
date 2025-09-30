// clients/src/lib/api.ts

import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false, // Désactivé pour éviter les problèmes CSRF cross-origin
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Important pour Laravel
  },
});



// Fonction pour récupérer le token CSRF
const getCsrfToken = async () => {
  try {
    const baseURL = import.meta.env.VITE_API_URL;
    const csrfUrl = baseURL.replace('/api', '') + '/sanctum/csrf-cookie';
    await axios.get(csrfUrl, {
      withCredentials: true
    });
  } catch (error) {
    console.warn("Erreur lors de la récupération du token CSRF:", error);
  }
};

// Fonction utilitaire pour extraire un cookie
function getCookieValue(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Fonction pour résoudre le tenant depuis le domaine
const resolveTenantFromDomain = async (): Promise<string | null> => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/tenant-from-host`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    return response.data.tenant?.id?.toString() || null;
  } catch (error) {
    console.warn("Impossible de résoudre le tenant depuis le domaine:", error);
    return null;
  }
};

// Routes qui n'exigent pas de tenant_id (authentification, etc.)
const AUTH_ROUTES_WITHOUT_TENANT = [
  '/auth/login',
  '/auth/register',
  '/auth/register-tenant-user',
  '/auth/resolve-tenant',
  '/auth/tenant-from-host',
  '/auth/password/send-code',
  '/auth/password/verify-code',
  '/auth/verification/send-code',
  '/auth/verification/verify-code',
  '/health',
];

// Intercepteur pour ajouter le token d'authentification
API.interceptors.request.use(async (config) => {
  // Vérifier si cette route nécessite un tenant_id
  const isAuthRoute = AUTH_ROUTES_WITHOUT_TENANT.some(route => 
    config.url?.includes(route)
  );

  if (!isAuthRoute) {
    // Ajouter l'en-tête Tenant ID requis par le backend multitenancy
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    let tenantId = user.tenant?.id || user.tenant_id;
    
    // Si pas de tenant_id, tenter de le résoudre depuis le domaine
    if (!tenantId) {
      console.log("🔍 Aucun tenant_id trouvé, tentative de résolution depuis le domaine...");
      tenantId = await resolveTenantFromDomain();
      
      if (tenantId) {
        console.log(`✅ Tenant résolu depuis le domaine: ${tenantId}`);
      }
    }
    
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId.toString();
    } else {
      console.warn("⚠️ Aucun tenant ID trouvé et impossible de le résoudre depuis le domaine");
      // Ne pas bloquer la requête, laisser le backend gérer l'erreur
    }
  }

  // Ajouter le token d'authentification si disponible
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Intercepteur pour gérer les erreurs de réponse
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si l'erreur est 401 (Unauthorized), rediriger vers la page de connexion
    if (error.response?.status === 401) {
      console.warn("Token expiré ou invalide, redirection vers la page de connexion");
      
      // Nettoyer le localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Rediriger vers la page de connexion seulement si on n'y est pas déjà
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?error=session_expired";
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;
export { API as api };

