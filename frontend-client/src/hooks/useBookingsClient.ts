import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { bookingsService } from '@/api/services/bookings.service';
import type { CreateBookingDto, BookingFilterDto } from '@/types/booking.types';

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingDto) => bookingsService.createBooking(data),
    onSuccess: (response) => {
      toast.success('Réservation créée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      return response;
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la création de la réservation';
      toast.error(message);
    },
  });
}

export function useMyBookings(filters?: BookingFilterDto) {
  return useQuery({
    queryKey: ['bookings', 'my-bookings', filters],
    queryFn: () => bookingsService.getMyBookings(filters),
  });
}

export function useBookingDetails(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingsService.getBookingDetails(id!),
    enabled: enabled && !!id,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      bookingsService.cancelBooking(id, reason),
    onSuccess: (response) => {
      toast.success('Réservation annulée');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      return response;
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de l\'annulation';
      toast.error(message);
    },
  });
}

export function useUpcomingBookings() {
  return useQuery({
    queryKey: ['bookings', 'upcoming'],
    queryFn: () => bookingsService.getUpcomingBookings(),
  });
}
