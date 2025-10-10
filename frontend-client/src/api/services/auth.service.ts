import api from '@/config/api';
import type { LoginCredentials, AuthResponse, User } from '@/types/auth.types';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  planId: string; // Plan Stripe choisi
}

export interface AcceptInvitationDto {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  async acceptInvitation(data: AcceptInvitationDto): Promise<{ message: string }> {
    const response = await api.post('/auth/accept-invitation', data);
    return response.data;
  },

  async verifyInvitation(token: string): Promise<{ email: string; role: string }> {
    const response = await api.get(`/auth/verify-invitation?token=${token}`);
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('tenant_id');
  },
};
