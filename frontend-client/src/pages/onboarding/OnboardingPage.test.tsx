import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import OnboardingPage from './OnboardingPage';
import { onboardingService } from '@/api/services/onboarding.service';

vi.mock('@/api/services/onboarding.service');

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render ProfileStep on initial load', () => {
    render(<OnboardingPage />, { wrapper });

    expect(screen.getByText('Profil de votre entreprise')).toBeInTheDocument();
    expect(screen.getByLabelText(/nom de l'entreprise/i)).toBeInTheDocument();
  });

  it('should show stepper with 3 steps', () => {
    render(<OnboardingPage />, { wrapper });

    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('Véhicule')).toBeInTheDocument();
    expect(screen.getByText('Conducteur')).toBeInTheDocument();
  });

  it('should navigate to VehicleStep after ProfileStep completion', async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />, { wrapper });

    await user.type(screen.getByLabelText(/nom de l'entreprise/i), 'Test Company');
    await user.type(screen.getByLabelText(/adresse/i), '123 Test St');
    await user.type(screen.getByLabelText(/code postal/i), '75001');
    await user.type(screen.getByLabelText(/ville/i), 'Paris');
    await user.type(screen.getByLabelText(/taille de la flotte/i), '5');

    await user.click(screen.getByRole('button', { name: /suivant/i }));

    await waitFor(() => {
      expect(screen.getByText('Ajoutez votre premier véhicule')).toBeInTheDocument();
    });
  });

  it('should allow skipping vehicle step', async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />, { wrapper });

    // Complete profile
    await user.type(screen.getByLabelText(/nom de l'entreprise/i), 'Test Company');
    await user.type(screen.getByLabelText(/adresse/i), '123 Test St');
    await user.type(screen.getByLabelText(/code postal/i), '75001');
    await user.type(screen.getByLabelText(/ville/i), 'Paris');
    await user.type(screen.getByLabelText(/taille de la flotte/i), '5');
    await user.click(screen.getByRole('button', { name: /suivant/i }));

    // Skip vehicle
    await waitFor(() => {
      expect(screen.getByText('Ajoutez votre premier véhicule')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /passer/i }));

    await waitFor(() => {
      expect(screen.getByText('Ajoutez votre premier conducteur')).toBeInTheDocument();
    });
  });

  it('should complete onboarding and redirect to dashboard', async () => {
    const user = userEvent.setup();
    vi.mocked(onboardingService.completeOnboarding).mockResolvedValueOnce({ message: 'Success' });

    render(<OnboardingPage />, { wrapper });

    // Complete all steps quickly by skipping vehicle and driver
    await user.type(screen.getByLabelText(/nom de l'entreprise/i), 'Test Company');
    await user.type(screen.getByLabelText(/adresse/i), '123 Test St');
    await user.type(screen.getByLabelText(/code postal/i), '75001');
    await user.type(screen.getByLabelText(/ville/i), 'Paris');
    await user.type(screen.getByLabelText(/taille de la flotte/i), '5');
    await user.click(screen.getByRole('button', { name: /suivant/i }));

    await waitFor(() => screen.getByText('Ajoutez votre premier véhicule'));
    await user.click(screen.getByRole('button', { name: /passer/i }));

    await waitFor(() => screen.getByText('Ajoutez votre premier conducteur'));
    await user.click(screen.getByRole('button', { name: /passer/i }));

    await waitFor(() => {
      expect(onboardingService.completeOnboarding).toHaveBeenCalled();
    });
  });
});
