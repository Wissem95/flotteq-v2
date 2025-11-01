import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import { dashboardService } from '@/api/services/dashboard.service';

vi.mock('@/api/services/dashboard.service');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    vi.mocked(dashboardService.getStats).mockImplementation(() => new Promise(() => {}));

    render(<DashboardPage />, { wrapper });

    expect(screen.getByRole('status')).toBeInTheDocument(); // spinner
  });

  it('should display stats after loading', async () => {
    vi.mocked(dashboardService.getStats).mockResolvedValue({
      totalVehicles: 25,
      activeVehicles: 20,
      totalDrivers: 15,
      activeDrivers: 12,
      upcomingMaintenances: 5,
      overdueMaintenances: 2,
    });

    render(<DashboardPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('should show error message on failure', async () => {
    vi.mocked(dashboardService.getStats).mockRejectedValue({
      response: { data: { message: 'Network error' } }
    });

    render(<DashboardPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
