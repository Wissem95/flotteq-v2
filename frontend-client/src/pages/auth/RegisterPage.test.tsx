import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { subscriptionsService } from '@/api/services/subscriptions.service';
import RegisterPage from './RegisterPage';

vi.mock('@/api/services/subscriptions.service', () => ({
  subscriptionsService: { getPlans: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
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

  it('affiche une erreur si le catalogue ne peut pas être chargé', async () => {
    vi.mocked(subscriptionsService.getPlans).mockRejectedValueOnce(
      new Error('API indisponible'),
    );
    render(<RegisterPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Erreur lors du chargement des plans')).toBeInTheDocument();
    });
  });
});
