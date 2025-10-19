import { create } from 'zustand';
import type { PartnerUser } from '../types/partner';

interface AuthState {
  user: PartnerUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: PartnerUser) => void;
  logout: () => void;
}

// Load initial state from localStorage BEFORE creating the store
const loadInitialState = () => {
  try {
    const token = localStorage.getItem('partner_token');
    const userStr = localStorage.getItem('partner_user');

    if (token && userStr) {
      const user = JSON.parse(userStr) as PartnerUser;
      return {
        user,
        token,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    // Clear invalid data
    localStorage.removeItem('partner_token');
    localStorage.removeItem('partner_user');
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...loadInitialState(),

  login: (token: string, user: PartnerUser) => {
    localStorage.setItem('partner_token', token);
    localStorage.setItem('partner_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('partner_token');
    localStorage.removeItem('partner_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
