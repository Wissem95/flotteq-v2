import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CheckoutSuccessPage from './CheckoutSuccessPage';
import { billingService } from '@/api/services/billing.service';

vi.mock('@/api/services/billing.service', () => ({
  billingService: { getSubscriptionStats: vi.fn() },
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/billing/success']}>
      <Routes>
        <Route path="/billing/success" element={<CheckoutSuccessPage />} />
        <Route path="/billing" element={<div>Facturation</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CheckoutSuccessPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('confirme l’activation uniquement lorsque le statut est renvoyé', async () => {
    vi.mocked(billingService.getSubscriptionStats).mockResolvedValue({
      status: 'active',
    } as any);

    renderPage();

    expect(await screen.findByText('Abonnement activé')).toBeInTheDocument();
    expect(screen.getByText(/Votre abonnement est actif/)).toBeInTheDocument();
  });

  it('ne prétend pas que l’abonnement est actif après dix échecs', async () => {
    vi.mocked(billingService.getSubscriptionStats).mockRejectedValue(
      new Error('API indisponible'),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Activation non confirmée')).toBeInTheDocument();
    }, { timeout: 15000 });
    expect(screen.queryByText('Abonnement activé')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vérifier ma facturation' })).toBeInTheDocument();
  }, 20000);
});
