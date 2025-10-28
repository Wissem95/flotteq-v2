import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { API_CONFIG } from '../config/api';
import { useAuthStore } from '../stores/authStore';
import type { Booking, BookingFilters, RescheduleBookingDto, CompleteBookingDto } from '../types/partner';
import { toast } from 'sonner';

export const useBookings = (filters?: BookingFilters) => {
  const user = useAuthStore((state) => state.user);
  const partnerId = user?.partnerId;

  return useQuery({
    queryKey: ['bookings', partnerId, filters],
    queryFn: async (): Promise<{ bookings: Booking[]; total: number; page: number; totalPages: number }> => {
      if (!partnerId) throw new Error('Partner ID not found');

      // Filter out empty string values to avoid sending empty params
      const cleanFilters = filters ? Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>) : {};

      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.BOOKINGS, {
        params: {
          ...cleanFilters,
        },
      });

      return response.data;
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useBooking = (bookingId: string | null) => {
  const user = useAuthStore((state) => state.user);
  const partnerId = user?.partnerId;

  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async (): Promise<Booking> => {
      if (!bookingId) throw new Error('Booking ID is required');

      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.BOOKING_BY_ID(bookingId));
      return response.data.booking;
    },
    enabled: !!bookingId && !!partnerId,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useConfirmBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await axiosInstance.patch(
        API_CONFIG.ENDPOINTS.BOOKING_CONFIRM(bookingId)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Réservation confirmée avec succès');
    },
    onError: (error: any) => {
      const status = error.response?.status;
      if (status === 400) {
        toast.error(error.response?.data?.message || 'Impossible de confirmer cette réservation');
      } else if (status === 403) {
        toast.error('Vous n\'avez pas l\'autorisation pour cette action');
      } else {
        toast.error('Erreur lors de la confirmation');
      }
    },
  });
};

export const useRejectBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason: string }) => {
      const response = await axiosInstance.patch(
        API_CONFIG.ENDPOINTS.BOOKING_REJECT(bookingId),
        { reason }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Réservation refusée');
    },
    onError: (error: any) => {
      const status = error.response?.status;
      if (status === 400) {
        toast.error(error.response?.data?.message || 'Données invalides');
      } else if (status === 403) {
        toast.error('Vous n\'avez pas l\'autorisation pour cette action');
      } else {
        toast.error('Erreur lors du refus');
      }
    },
  });
};

export const useRescheduleBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, data }: { bookingId: string; data: RescheduleBookingDto }) => {
      const response = await axiosInstance.patch(
        API_CONFIG.ENDPOINTS.BOOKING_RESCHEDULE(bookingId),
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Réservation reportée avec succès');
    },
    onError: (error: any) => {
      const status = error.response?.status;
      if (status === 400) {
        toast.error(error.response?.data?.message || 'Date ou heure invalide');
      } else if (status === 409) {
        toast.error('Ce créneau est déjà pris');
      } else {
        toast.error('Erreur lors du report de la réservation');
      }
    },
  });
};

export const useStartBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await axiosInstance.patch(
        API_CONFIG.ENDPOINTS.BOOKING_START(bookingId)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Réservation démarrée');
    },
    onError: (error: any) => {
      const status = error.response?.status;
      if (status === 400) {
        toast.error(error.response?.data?.message || 'Impossible de démarrer cette réservation');
      } else if (status === 403) {
        toast.error('Vous n\'avez pas l\'autorisation pour cette action');
      } else {
        toast.error('Erreur lors du démarrage');
      }
    },
  });
};

export const useCompleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, data }: { bookingId: string; data: CompleteBookingDto }) => {
      // For now, send partnerNotes only. Photo upload can be added later if backend supports it
      const response = await axiosInstance.patch(
        API_CONFIG.ENDPOINTS.BOOKING_COMPLETE(bookingId),
        { partnerNotes: data.partnerNotes }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['commissions'] });

      const commission = data.booking?.commissionAmount;
      if (commission) {
        toast.success(`Réservation terminée ! Commission: ${Number(commission).toFixed(2)}€`);
      } else {
        toast.success('Réservation terminée avec succès');
      }
    },
    onError: (error: any) => {
      const status = error.response?.status;
      if (status === 400) {
        toast.error(error.response?.data?.message || 'Impossible de terminer cette réservation');
      } else if (status === 403) {
        toast.error('Vous n\'avez pas l\'autorisation pour cette action');
      } else {
        toast.error('Erreur lors de la finalisation');
      }
    },
  });
};
