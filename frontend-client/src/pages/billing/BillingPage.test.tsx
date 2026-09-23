import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { billingService } from '@/api/services/billing.service';
import BillingPage from './BillingPage';

vi.mock('@/api/services/billing.service', () => ({
  billingService: {
    getSubscriptionStats: vi.fn(),
    openCustomerPortal: vi.fn(),
  },
}));

vi.mock('@/components/billing/CurrentPlanCard', () => ({
  default: ({ onUpgrade }: { onUpgrade: () => void }) => (
    <button onClick={onUpgrade}>Gérer mon abonnement</button>
  ),
}));
vi.mock('@/components/billing/UsageAlertBanner', () => ({
  default: () => null,
}));
vi.mock('@/components/billing/InvoicesTable', () => ({ default: () => null }));
vi.mock('@/components/billing/PaymentMethodCard', () => ({ default: () => null }));
vi.mock('@/components/billing/UpgradeModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>Choisir un plan payant</div> : null,
}));

const activePlanStats = {
  plan: { name: 'Pro', price: 29, features: [], trialDays: 0 },
  usage: {
    vehicles: { current: 1, limit: 10, percentage: 10 },
    users: { current: 1, limit: 5, percentage: 20 },
    drivers: { current: 0, limit: 10, percentage: 0 },
  },
  status: 'active',
  currentPeriodEnd: '2026-10-23T00:00:00.000Z',
};

describe('BillingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(billingService.getSubscriptionStats).mockResolvedValue(
      activePlanStats,
    );
    vi.mocked(billingService.openCustomerPortal).mockResolvedValue(undefined);
  });

  it('envoie un abonné existant dans le portail Stripe pour changer son offre', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('button', { name: 'Gérer mon abonnement' }));

    await waitFor(() => {
      expect(billingService.openCustomerPortal).toHaveBeenCalledOnce();
    });
  });
});
