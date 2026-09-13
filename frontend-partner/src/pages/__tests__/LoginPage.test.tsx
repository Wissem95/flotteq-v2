import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import axiosInstance from '../../lib/axios';

const mockNavigate = vi.fn();

vi.mock('../../lib/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('conserve les informations du partenaire avec l’utilisateur connecté', async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: {
        accessToken: 'partner-token',
        partnerUser: {
          id: 'partner-user-1',
          email: 'garage@example.test',
          firstName: 'Ada',
          lastName: 'Lovelace',
          partnerId: 'partner-1',
          role: 'owner',
        },
        partner: {
          id: 'partner-1',
          companyName: 'Garage FlotteQ',
          type: 'garage',
          status: 'approved',
        },
      },
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'garage@example.test' },
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    expect(JSON.parse(localStorage.getItem('partner_user') ?? '{}')).toMatchObject({
      id: 'partner-user-1',
      partner: {
        companyName: 'Garage FlotteQ',
        status: 'approved',
      },
    });
  });
});
