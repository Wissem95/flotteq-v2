import api from '@/config/api';
import type {
  CreateBookingDto,
  Booking,
  BookingFilterDto,
  BookingListResponse,
} from '@/types/booking.types';

export const bookingsService = {
  /**
   * Create a new booking (Tenant creates booking with a partner)
   */
  async createBooking(data: CreateBookingDto): Promise<{ message: string; booking: Booking }> {
    const response = await api.post<{ message: string; booking: Booking }>('/bookings', data);
    return response.data;
  },

  /**
   * Get all bookings for the authenticated tenant with filters
   * Alias: GET /bookings/my-bookings
   */
  async getMyBookings(filters?: BookingFilterDto): Promise<BookingListResponse> {
    const response = await api.get<BookingListResponse>('/bookings/my-bookings', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get booking details by ID
   */
  async getBookingDetails(id: string): Promise<Booking> {
    const response = await api.get<{ message: string; booking: Booking }>(`/bookings/${id}`);
    return response.data.booking;
  },

  /**
   * Cancel a booking (Tenant only)
   */
  async cancelBooking(id: string, reason: string): Promise<{ message: string; booking: Booking }> {
    const response = await api.patch<{ message: string; booking: Booking }>(
      `/bookings/${id}/cancel`,
      { reason },
    );
    return response.data;
  },

  /**
   * Get upcoming bookings (next 7 days)
   */
  async getUpcomingBookings(): Promise<{ message: string; count: number; bookings: Booking[] }> {
    const response = await api.get<{ message: string; count: number; bookings: Booking[] }>(
      '/bookings/upcoming',
    );
    return response.data;
  },
};
