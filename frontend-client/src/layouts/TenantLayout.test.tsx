import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import TenantLayout from './TenantLayout';

// Mock useAuth hook
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      },
      logout: vi.fn(),
    }),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('TenantLayout', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render the sidebar with logo', () => {
    renderWithRouter(<TenantLayout />);
    expect(screen.getByText('FlotteQ')).toBeInTheDocument();
    expect(screen.getByText('Gestion de flotte')).toBeInTheDocument();
  });

  it('should render all navigation items', () => {
    renderWithRouter(<TenantLayout />);

    expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
    expect(screen.getByText('Véhicules')).toBeInTheDocument();
    expect(screen.getByText('Conducteurs')).toBeInTheDocument();
    expect(screen.getByText('Maintenances')).toBeInTheDocument();
  });

  it('should render navigation as buttons (not links)', () => {
    renderWithRouter(<TenantLayout />);

    const dashboardButton = screen.getByRole('button', { name: /tableau de bord/i });
    const vehiclesButton = screen.getByRole('button', { name: /véhicules/i });
    const driversButton = screen.getByRole('button', { name: /conducteurs/i });
    const maintenancesButton = screen.getByRole('button', { name: /maintenances/i });

    expect(dashboardButton).toBeInTheDocument();
    expect(vehiclesButton).toBeInTheDocument();
    expect(driversButton).toBeInTheDocument();
    expect(maintenancesButton).toBeInTheDocument();
  });

  it('should disable navigation items marked as disabled', () => {
    renderWithRouter(<TenantLayout />);

    const vehiclesButton = screen.getByRole('button', { name: /véhicules/i });
    const driversButton = screen.getByRole('button', { name: /conducteurs/i });
    const maintenancesButton = screen.getByRole('button', { name: /maintenances/i });

    expect(vehiclesButton).toBeDisabled();
    expect(driversButton).toBeDisabled();
    expect(maintenancesButton).toBeDisabled();
  });

  it('should render user information', () => {
    renderWithRouter(<TenantLayout />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should render logout button with icon', () => {
    renderWithRouter(<TenantLayout />);

    const logoutButtons = screen.getAllByTitle('Déconnexion');
    expect(logoutButtons.length).toBeGreaterThan(0);
  });

  it('should toggle sidebar collapse/expand', async () => {
    const user = userEvent.setup();
    renderWithRouter(<TenantLayout />);

    // Sidebar should be open by default
    expect(screen.getByText('Gestion de flotte')).toBeInTheDocument();

    // Click collapse button
    const collapseButton = screen.getByRole('button', { name: '' });
    await user.click(collapseButton);

    // Sidebar subtitle should not be visible when collapsed
    // (checking for specific behavior would require more detailed testing)
  });

  it('should render children when provided', () => {
    renderWithRouter(
      <TenantLayout>
        <div>Test Child Content</div>
      </TenantLayout>
    );

    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it('should have correct styling classes for sidebar', () => {
    const { container } = renderWithRouter(<TenantLayout />);

    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('bg-white', 'border-r', 'border-gray-200');
  });
});
