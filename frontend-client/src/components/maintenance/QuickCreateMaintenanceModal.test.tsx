import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuickCreateMaintenanceModal from './QuickCreateMaintenanceModal';
import { MaintenanceType } from '../../types/maintenance.types';

// Mock hooks
vi.mock('../../hooks/useMaintenance', () => ({
  useCreateMaintenance: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

vi.mock('../../hooks/useVehicles', () => ({
  useVehicles: () => ({
    data: [
      { id: '1', registration: 'AB-123-CD', brand: 'Renault', model: 'Clio' },
      { id: '2', registration: 'EF-456-GH', brand: 'Peugeot', model: '308' },
    ],
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('QuickCreateMaintenanceModal', () => {
  const mockOnClose = vi.fn();
  const testDate = new Date('2025-11-15');

  it('should not render when closed', () => {
    const { container } = render(
      <QuickCreateMaintenanceModal isOpen={false} onClose={mockOnClose} selectedDate={testDate} />,
      { wrapper }
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when open', () => {
    render(
      <QuickCreateMaintenanceModal isOpen={true} onClose={mockOnClose} selectedDate={testDate} />,
      { wrapper }
    );

    expect(screen.getByText('Nouvelle maintenance')).toBeInTheDocument();
    expect(screen.getByText('15/11/2025')).toBeInTheDocument();
  });

  it('should display vehicles in select', () => {
    render(
      <QuickCreateMaintenanceModal isOpen={true} onClose={mockOnClose} selectedDate={testDate} />,
      { wrapper }
    );

    expect(screen.getByText('AB-123-CD - Renault Clio')).toBeInTheDocument();
    expect(screen.getByText('EF-456-GH - Peugeot 308')).toBeInTheDocument();
  });

  it('should close modal on cancel', () => {
    render(
      <QuickCreateMaintenanceModal isOpen={true} onClose={mockOnClose} selectedDate={testDate} />,
      { wrapper }
    );

    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal on X button', () => {
    render(
      <QuickCreateMaintenanceModal isOpen={true} onClose={mockOnClose} selectedDate={testDate} />,
      { wrapper }
    );

    const closeButton = screen.getByRole('button', { name: '' }); // X icon button
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should update form data on input change', () => {
    render(
      <QuickCreateMaintenanceModal isOpen={true} onClose={mockOnClose} selectedDate={testDate} />,
      { wrapper }
    );

    const descriptionInput = screen.getByPlaceholderText('Décrivez la maintenance...');
    fireEvent.change(descriptionInput, { target: { value: 'Test maintenance' } });

    expect(descriptionInput).toHaveValue('Test maintenance');
  });

  it('should have required fields', () => {
    render(
      <QuickCreateMaintenanceModal isOpen={true} onClose={mockOnClose} selectedDate={testDate} />,
      { wrapper }
    );

    const vehicleSelect = screen.getByLabelText(/Véhicule/);
    const typeSelect = screen.getByLabelText(/Type/);
    const descriptionTextarea = screen.getByLabelText(/Description/);
    const costInput = screen.getByLabelText(/Coût estimé/);

    expect(vehicleSelect).toBeRequired();
    expect(typeSelect).toBeRequired();
    expect(descriptionTextarea).toBeRequired();
    expect(costInput).toBeRequired();
  });
});
