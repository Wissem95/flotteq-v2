import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginPage from './LoginPage';
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

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render login form', () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('should show error on failed login', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    render(<LoginPage />, { wrapper });

    await user.type(screen.getByPlaceholderText('Email'), 'wrong@test.com');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should show the driver identity and forgot-password link', () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByRole('heading', { name: 'FlotteQ Driver' })).toBeInTheDocument();
    expect(screen.getByText(/mot de passe oublié/i)).toBeInTheDocument();
  });
});
