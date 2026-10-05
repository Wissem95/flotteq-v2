import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    isAuthenticated: false,
    isLoginLoading: false,
    loginError: null,
    isLoginError: false,
  }),
}));

afterEach(cleanup);

describe('LoginPage', () => {
  it('ne publie aucun identifiant de démonstration sur la page admin', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/Test:/i)).not.toBeInTheDocument();
    expect(
      screen.getByText('Accès réservé aux administrateurs autorisés.'),
    ).toBeInTheDocument();
  });
});
