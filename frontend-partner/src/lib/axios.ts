import axios from 'axios';
import { API_CONFIG } from '../config/api';

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    // Don't add token to public routes (login/register)
    const publicRoutes = [
      '/api/partners/auth/login',
      '/api/partners/auth/register'
    ];

    const isPublicRoute = publicRoutes.some(route =>
      config.url?.includes(route)
    );

    if (!isPublicRoute) {
      const token = localStorage.getItem('partner_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('🚫 401 Unauthorized:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        response: error.response?.data
      });
      // Clear token and redirect to login
      localStorage.removeItem('partner_token');
      localStorage.removeItem('partner_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
