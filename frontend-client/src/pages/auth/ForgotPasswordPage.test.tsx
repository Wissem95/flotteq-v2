import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ForgotPasswordPage from './ForgotPasswordPage';
import { authService } from '@/api/services/auth.service';

vi.mock('@/api/services/auth.service');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render forgot password form', () => {
    render(<ForgotPasswordPage />, { wrapper });

    expect(screen.getByText(/mot de passe oublié/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  });

  it('should show success message after email sent', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.forgotPassword).mockResolvedValueOnce({ message: 'Email sent' });

    render(<ForgotPasswordPage />, { wrapper });

    await user.type(screen.getByPlaceholderText('Email'), 'test@test.com');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    await waitFor(() => {
      expect(screen.getByText(/email envoyé/i)).toBeInTheDocument();
    });
  });

  it('should show error on failure', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.forgotPassword).mockRejectedValueOnce({
      response: { data: { message: 'Email not found' } },
    });

    render(<ForgotPasswordPage />, { wrapper });

    await user.type(screen.getByPlaceholderText('Email'), 'notfound@test.com');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    await waitFor(() => {
      expect(screen.getByText(/email not found/i)).toBeInTheDocument();
    });
  });
});
