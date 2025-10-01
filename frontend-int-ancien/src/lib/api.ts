// internal/src/lib/api.ts - Configuration API pour l'interface d'administration

import axios from "axios";

// Configuration API pour l'interface d'administration FlotteQ
const InternalAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // Utilise le proxy Vite en dev
  withCredentials: false, // Désactivé pour éviter les problèmes CSRF cross-origin
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// CSRF complètement désactivé pour l'authentification cross-origin
// Utilisation exclusive des Bearer tokens pour l'authentification

// Intercepteur pour ajouter le token d'authentification admin
InternalAPI.interceptors.request.use(async (config) => {
  // Ajouter l'en-tête d'authentification admin
  const token = localStorage.getItem("internal_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // En-têtes pour identifier les requêtes internes
  config.headers['X-Internal-Request'] = 'true';
  config.headers['X-Admin-Panel'] = 'true';

  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
InternalAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide, rediriger vers la connexion
      localStorage.removeItem("internal_token");
      localStorage.removeItem("internal_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default InternalAPI;
export { InternalAPI as api };

