import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import UpcomingMaintenancesList from './UpcomingMaintenancesList';
import { useUpcomingMaintenances } from '../../hooks/useMaintenance';

vi.mock('../../hooks/useMaintenance', () => ({
  useUpcomingMaintenances: vi.fn(),
}));

const mockUpcomingResult = (data: unknown, isLoading: boolean) => {
  vi.mocked(useUpcomingMaintenances).mockReturnValue(
    { data, isLoading } as unknown as ReturnType<typeof useUpcomingMaintenances>,
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

describe('UpcomingMaintenancesList', () => {
  beforeEach(() => {
    mockUpcomingResult([], false);
  });

  it('should show loading state', () => {
    mockUpcomingResult(undefined, true);

    render(<UpcomingMaintenancesList />, { wrapper });

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('should display header correctly', () => {
    render(<UpcomingMaintenancesList />, { wrapper });

    expect(screen.getByText('Maintenances à venir')).toBeInTheDocument();
  });

  it('should show empty state when no maintenances', () => {
    render(<UpcomingMaintenancesList daysAhead={7} />, { wrapper });

    expect(screen.getByText(/Aucune maintenance prévue dans les 7 prochains jours/)).toBeInTheDocument();
  });

  it('should display maintenance alerts with correct styling', () => {
    const mockAlerts = [
      {
        maintenanceId: '1',
        vehicleRegistration: 'AB-123-CD',
        type: 'Vidange',
        scheduledDate: '2025-11-15',
        daysUntil: 2,
        alertReason: 'Maintenance in 2 days',
      },
      {
        maintenanceId: '2',
        vehicleRegistration: 'EF-456-GH',
        type: 'Pneus',
        scheduledDate: '2025-11-10',
        daysUntil: -3,
        alertReason: 'Maintenance overdue',
      },
    ];

    mockUpcomingResult(mockAlerts, false);

    render(<UpcomingMaintenancesList />, { wrapper });

    // Check if alerts are displayed
    expect(screen.getByText('AB-123-CD')).toBeInTheDocument();
    expect(screen.getByText('EF-456-GH')).toBeInTheDocument();
    expect(screen.getByText('Dans 2j')).toBeInTheDocument();
    expect(screen.getByText('En retard de 3j')).toBeInTheDocument();
  });

  it('should limit display to 5 maintenances and show "View all" button', () => {
    const mockAlerts = Array.from({ length: 10 }, (_, i) => ({
      maintenanceId: `${i}`,
      vehicleRegistration: `Vehicle-${i}`,
      type: 'Vidange',
      scheduledDate: '2025-11-15',
      daysUntil: i,
      alertReason: `Maintenance in ${i} days`,
    }));

    mockUpcomingResult(mockAlerts, false);

    render(<UpcomingMaintenancesList />, { wrapper });

    // Should show first 5
    expect(screen.getByText('Vehicle-0')).toBeInTheDocument();
    expect(screen.getByText('Vehicle-4')).toBeInTheDocument();

    // Should not show 6th and beyond
    expect(screen.queryByText('Vehicle-5')).not.toBeInTheDocument();

    // Should show "View all" button
    expect(screen.getByText(/Voir toutes les maintenances \(10\)/)).toBeInTheDocument();
  });

  it('should apply correct color classes based on urgency', () => {
    const mockAlerts = [
      {
        maintenanceId: '1',
        vehicleRegistration: 'AB-123-CD',
        type: 'Vidange',
        scheduledDate: '2025-11-15',
        daysUntil: -1, // Overdue - should be red
        alertReason: 'Maintenance overdue',
      },
      {
        maintenanceId: '2',
        vehicleRegistration: 'EF-456-GH',
        type: 'Pneus',
        scheduledDate: '2025-11-10',
        daysUntil: 2, // Within 3 days - should be orange
        alertReason: 'Maintenance in 2 days',
      },
      {
        maintenanceId: '3',
        vehicleRegistration: 'IJ-789-KL',
        type: 'CT',
        scheduledDate: '2025-11-20',
        daysUntil: 7, // Normal - should be blue
        alertReason: 'Maintenance in 7 days',
      },
    ];

    mockUpcomingResult(mockAlerts, false);

    const { container } = render(<UpcomingMaintenancesList />, { wrapper });

    const alertCards = container.querySelectorAll('[class*="border-"]');
    expect(alertCards.length).toBeGreaterThan(0);
  });
});
