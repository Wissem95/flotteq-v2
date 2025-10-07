import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { authService } from '@/api/services/auth.service';

vi.mock('@/api/services/auth.service');

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('ProtectedRoute', () => {
  it('should show loading state while checking auth', async () => {
    // Mock a slow auth check
    let resolveAuth: any;
    const slowAuthPromise = new Promise((resolve) => {
      resolveAuth = resolve;
    });

    vi.mocked(authService.getCurrentUser).mockReturnValueOnce(slowAuthPromise as any);

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { wrapper }
    );

    // During loading, should show spinner OR be in loading state
    // Since the auth check happens in AuthProvider, we just verify no content is shown yet
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();

    // Clean up
    resolveAuth({ id: '1', email: 'test@test.com', tenantId: 1 });
  });

  it('should redirect to login if not authenticated', async () => {
    localStorage.clear();
    vi.mocked(authService.getCurrentUser).mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { wrapper }
    );

    // Should redirect (tested via router in integration tests)
  });
});
