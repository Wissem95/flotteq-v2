import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { subscriptionsService } from '@/api/services/subscriptions.service';

vi.mock('@/api/services/subscriptions.service');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(subscriptionsService.getPlans).mockResolvedValue([
      { id: 1, name: 'Starter', price: 0, maxVehicles: 5, maxUsers: 2, maxDrivers: 5, trialDays: 0, isActive: true },
      { id: 2, name: 'Professional', price: 79, maxVehicles: 50, maxUsers: 10, maxDrivers: 20, trialDays: 0, isActive: true },
      { id: 3, name: 'Enterprise', price: 199, maxVehicles: -1, maxUsers: -1, maxDrivers: -1, trialDays: 0, isActive: true },
    ]);
  });

  it('should render plan selection on step 1', async () => {
    render(<RegisterPage />, { wrapper });

    expect(await screen.findByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('should move to step 2 when plan is selected', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    const starterPlan = await screen.findByText('Choisir Starter');
    await user.click(starterPlan.closest('button')!);

    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nom de l'entreprise/i)).toBeInTheDocument();
  });

  it('should allow going back to plan selection', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    // Select plan
    await user.click(await screen.findByText('Choisir Starter'));

    // Go back
    await user.click(screen.getByText(/changer de plan/i));

    expect(await screen.findByText('Starter')).toBeInTheDocument();
  });

  it('should display selected plan info on step 2', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    await user.click(await screen.findByText('Choisir Professional'));

    expect(screen.getByText(/professional/i)).toBeInTheDocument();
    expect(screen.getByText(/79.00€\/mois/i)).toBeInTheDocument();
  });
});
