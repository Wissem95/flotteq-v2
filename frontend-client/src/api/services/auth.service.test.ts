import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';
import api from '@/config/api';

vi.mock('@/config/api');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@test.com', tenantId: 1 },
          access_token: 'token',
          refresh_token: 'refresh',
        },
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      const result = await authService.login({ email: 'test@test.com', password: 'pass' });

      expect(result).toEqual(mockResponse.data);
      expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'pass' });
    });
  });

  describe('register', () => {
    it('should return checkout URL', async () => {
      const mockResponse = { data: { checkoutUrl: 'https://stripe.com/checkout' } };
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      const registerData = {
        email: 'test@test.com',
        password: 'pass123',
        firstName: 'John',
        lastName: 'Doe',
        companyName: 'Acme',
        planId: 'starter',
      };

      const result = await authService.register(registerData);

      // checkoutUrl removed from AuthResponse type
      expect(result.access_token).toBeDefined();
      expect(api.post).toHaveBeenCalledWith('/auth/register', registerData);
    });
  });

  describe('logout', () => {
    it('should clear localStorage', async () => {
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('refresh_token', 'refresh');
      localStorage.setItem('tenant_id', '1');

      await authService.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('tenant_id')).toBeNull();
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password request', async () => {
      const mockResponse = { data: { message: 'Email sent' } };
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      const result = await authService.forgotPassword('test@test.com');

      expect(result.message).toBe('Email sent');
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@test.com' });
    });
  });
});
