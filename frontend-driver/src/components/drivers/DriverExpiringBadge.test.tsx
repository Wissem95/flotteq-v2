import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DriverExpiringBadge from './DriverExpiringBadge';

// Mock date-fns
vi.mock('date-fns', () => ({
  differenceInDays: vi.fn(),
  parseISO: vi.fn((date) => new Date(date)),
}));

describe('DriverExpiringBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display expired badge when license is expired', async () => {
    const { differenceInDays } = await import('date-fns');
    (differenceInDays as any).mockReturnValue(-1);

    render(<DriverExpiringBadge licenseExpiryDate="2023-01-01" />);

    expect(screen.getByText('Permis expiré')).toBeInTheDocument();
  });

  it('should display orange badge when expiring in 30 days or less', async () => {
    const { differenceInDays } = await import('date-fns');
    (differenceInDays as any).mockReturnValue(20);

    render(<DriverExpiringBadge licenseExpiryDate="2025-11-26" />);

    expect(screen.getByText('Expire dans 20j')).toBeInTheDocument();
  });

  it('should display yellow badge when expiring in 31-60 days', async () => {
    const { differenceInDays } = await import('date-fns');
    (differenceInDays as any).mockReturnValue(45);

    render(<DriverExpiringBadge licenseExpiryDate="2025-12-21" />);

    expect(screen.getByText('Expire dans 45j')).toBeInTheDocument();
  });

  it('should not render when license expires in more than 60 days', async () => {
    const { differenceInDays } = await import('date-fns');
    (differenceInDays as any).mockReturnValue(90);

    const { container } = render(<DriverExpiringBadge licenseExpiryDate="2026-03-06" />);

    expect(container.firstChild).toBeNull();
  });

  it('should apply custom className', async () => {
    const { differenceInDays } = await import('date-fns');
    (differenceInDays as any).mockReturnValue(15);

    const { container } = render(
      <DriverExpiringBadge licenseExpiryDate="2025-11-21" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
