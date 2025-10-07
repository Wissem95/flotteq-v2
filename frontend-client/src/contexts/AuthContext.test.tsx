import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '@/api/services/auth.service';

vi.mock('@/api/services/auth.service');

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with no user when no token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login and set user', async () => {
    const mockUser = { id: '1', email: 'test@test.com', firstName: 'John', lastName: 'Doe', role: 'admin', tenantId: 1 };
    const mockAuthResponse = {
      user: mockUser,
      access_token: 'token',
      refresh_token: 'refresh',
    };

    vi.mocked(authService.login).mockResolvedValueOnce(mockAuthResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await waitFor(async () => {
      await result.current.login({ email: 'test@test.com', password: 'pass' });
    });

    await waitFor(() => {
      expect(localStorage.getItem('access_token')).toBe('token');
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it.skip('should logout and clear user', async () => {
    // First set up a logged in user
    const mockUser = { id: '1', email: 'test@test.com', firstName: 'John', lastName: 'Doe', role: 'admin', tenantId: 1 };
    const mockAuthResponse = {
      user: mockUser,
      access_token: 'token',
      refresh_token: 'refresh',
    };

    vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Login first
    await result.current.login({ email: 'test@test.com', password: 'pass' });

    // Verify logged in
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('access_token')).toBe('token');
    });

    // Now logout
    await act(async () => {
      await result.current.logout();
    });

    // Verify logged out
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
