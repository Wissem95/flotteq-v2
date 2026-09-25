import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { subscriptionsService } from '@/api/services/subscriptions.service';
import { authService } from '@/api/services/auth.service';
import RegisterPage from './RegisterPage';

vi.mock('@/api/services/subscriptions.service', () => ({
  subscriptionsService: { getPlans: vi.fn() },
}));

vi.mock('@/api/services/auth.service', () => ({
  authService: { register: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/register']}>{children}</MemoryRouter>
);

const plans = [
  {
    id: 1,
    name: 'Starter',
    price: 0,
    maxVehicles: 3,
    maxUsers: 2,
    maxDrivers: 3,
    trialDays: 0,
    isActive: true,
  },
  {
    id: 2,
    name: 'Pro',
    price: 29,
    maxVehicles: 10,
    maxUsers: 5,
    maxDrivers: 10,
    trialDays: 0,
    isActive: true,
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 0,
    maxVehicles: -1,
    maxUsers: -1,
    maxDrivers: -1,
    trialDays: 0,
    isActive: true,
  },
];

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.mocked(subscriptionsService.getPlans).mockResolvedValue(plans);
  });

  it('permet l’inscription au plan Starter gratuit', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    await user.click(await screen.findByRole('button', { name: 'Choisir Starter' }));

    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
  });

  it('renvoie le plan Enterprise sur devis vers le contact commercial', async () => {
    render(<RegisterPage />, { wrapper });

    const contact = await screen.findByRole('link', {
      name: /demander une offre enterprise/i,
    });

    expect(contact).toHaveAttribute(
      'href',
      'mailto:contact@flotteq.fr?subject=Demande%20Enterprise',
    );
    expect(screen.queryByRole('button', { name: 'Choisir Enterprise' })).not.toBeInTheDocument();
  });

  it('préselectionne le plan demandé par le lien commercial', async () => {
    const registerWrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={['/register?plan=pro']}>
        {children}
      </MemoryRouter>
    );

    render(<RegisterPage />, { wrapper: registerWrapper });

    expect(await screen.findByText(/Plan sélectionné:/i)).toHaveTextContent('Pro');
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
  });

  it('affiche une erreur si le catalogue ne peut pas être chargé', async () => {
    vi.mocked(subscriptionsService.getPlans).mockRejectedValueOnce(
      new Error('API indisponible'),
    );
    render(<RegisterPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Erreur lors du chargement des plans')).toBeInTheDocument();
    });
  });

  it('transmet le consentement d’accès immédiat pour un particulier', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.register).mockResolvedValue({
      user: { tenantId: 1 },
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      checkoutUrl: 'https://checkout.stripe.com/c/pay/test',
    } as never);

    render(<RegisterPage />, { wrapper });
    await user.click(await screen.findByRole('button', { name: 'Choisir Starter' }));
    await user.click(screen.getByLabelText('Particulier'));
    await user.type(screen.getByLabelText(/prénom/i), 'Jeanne');
    await user.type(screen.getByLabelText(/^nom$/i), 'Durand');
    await user.type(screen.getByLabelText(/^email$/i), 'jeanne@example.com');
    await user.type(screen.getByLabelText(/^mot de passe$/i), 'Motdepasse1');
    await user.click(screen.getByLabelText(/j’accepte les CGU et les CGV/i));
    await user.click(screen.getByLabelText(/j’ai lu la politique de confidentialité/i));
    await user.click(
      screen.getByLabelText(/je demande expressément l’accès immédiat/i),
    );
    await user.click(screen.getByRole('button', { name: 'Continuer vers le paiement' }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          customerType: 'consumer',
          acceptedTerms: true,
          acceptedPrivacyPolicy: true,
          immediateServiceRequested: true,
          planId: '1',
        }),
      );
    });
  });
});
