import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DriverCard from './DriverCard';
import { DriverStatus } from '@/types/driver.types';

const mockDriver = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  phone: '+33612345678',
  licenseNumber: 'FR123456789',
  licenseExpiryDate: '2026-12-31',
  status: DriverStatus.ACTIVE,
  tenantId: 1,
  vehicles: [
    {
      id: 'v1',
      registration: 'AB-123-CD',
      brand: 'Renault',
      model: 'Kangoo',
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('DriverCard', () => {
  it('should render driver information', () => {
    renderWithRouter(<DriverCard driver={mockDriver} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@test.com')).toBeInTheDocument();
    expect(screen.getByText('+33612345678')).toBeInTheDocument();
    expect(screen.getByText('FR123456789')).toBeInTheDocument();
  });

  it('should display active status badge', () => {
    renderWithRouter(<DriverCard driver={mockDriver} />);

    expect(screen.getByText('Actif')).toBeInTheDocument();
  });

  it('should display vehicle count', () => {
    renderWithRouter(<DriverCard driver={mockDriver} />);

    expect(screen.getByText('1 véhicule')).toBeInTheDocument();
  });

  it('should display "Aucun" when no vehicles', () => {
    const driverWithoutVehicles = { ...mockDriver, vehicles: [] };
    renderWithRouter(<DriverCard driver={driverWithoutVehicles} />);

    expect(screen.getByText('Aucun')).toBeInTheDocument();
  });

  it('should display suspended status correctly', () => {
    const suspendedDriver = { ...mockDriver, status: DriverStatus.SUSPENDED };
    renderWithRouter(<DriverCard driver={suspendedDriver} />);

    expect(screen.getByText('Suspendu')).toBeInTheDocument();
  });

  it('should display initials avatar', () => {
    renderWithRouter(<DriverCard driver={mockDriver} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should link to driver detail page', () => {
    renderWithRouter(<DriverCard driver={mockDriver} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/drivers/1');
  });
});
