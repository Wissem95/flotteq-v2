import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PendingBookingsList from '../PendingBookingsList';
import { useBookings } from '../../../hooks/useBookings';

vi.mock('../../../hooks/useBookings', () => ({
  useBookings: vi.fn(),
}));

vi.mock('../PendingBookingCard', () => ({
  default: ({ booking }: { booking: { id: string } }) => <div>Réservation {booking.id}</div>,
}));

describe('PendingBookingsList', () => {
  beforeEach(() => {
    vi.mocked(useBookings).mockReturnValue({
      data: {
        bookings: [{ id: 'booking-1' }],
        total: 1,
        page: 1,
        totalPages: 1,
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useBookings>);
  });

  it('affiche les réservations renvoyées par le contrat bookings de l’API', () => {
    render(<PendingBookingsList />);

    expect(screen.getByText('1 en attente')).toBeInTheDocument();
    expect(screen.getByText('Réservation booking-1')).toBeInTheDocument();
  });
});
