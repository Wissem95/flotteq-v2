import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsService } from '../api/services/trips.service';
import type { StartTripData, EndTripData } from '../types/trip.types';
import { toast } from 'react-hot-toast';

/**
 * Hook pour obtenir le trip en cours
 */
export function useCurrentTrip() {
  return useQuery({
    queryKey: ['currentTrip'],
    queryFn: () => tripsService.getCurrentTrip(),
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
}

/**
 * Hook pour démarrer un trip
 */
export function useStartTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartTripData) => tripsService.startTrip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentTrip'] });
      queryClient.invalidateQueries({ queryKey: ['tripHistory'] });
      toast.success('Mission démarrée avec succès !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors du démarrage de la mission';
      toast.error(message);
    },
  });
}

/**
 * Hook pour terminer un trip
 */
export function useEndTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, data }: { tripId: string; data: EndTripData }) =>
      tripsService.endTrip(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentTrip'] });
      queryClient.invalidateQueries({ queryKey: ['tripHistory'] });
      toast.success('Mission terminée avec succès !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la fin de la mission';
      toast.error(message);
    },
  });
}

/**
 * Hook pour obtenir l'historique des trips
 */
export function useTripHistory(params?: {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: ['tripHistory', params],
    queryFn: () => tripsService.getTripHistory(params),
  });
}
