import { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_incomplete?: boolean;
  missing_fields?: Record<string, string>;
}

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  hasIncompleteProfile: boolean;
  missingFields: Record<string, string>;
  checkAuth: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (token && userData) {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const hasIncompleteProfile = user?.profile_incomplete || false;
  const missingFields = user?.missing_fields || {};

  return {
    user,
    isAuthenticated,
    hasIncompleteProfile,
    missingFields,
    checkAuth,
  };
};

