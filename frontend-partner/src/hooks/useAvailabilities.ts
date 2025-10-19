import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { availabilitiesService } from '../api/availabilities.service';
import type {
  SetAvailabilityDto,
  AddUnavailabilityDto,
  Availability,
  Unavailability
} from '../types/partner';

// Query keys
export const availabilityKeys = {
  all: ['availabilities'] as const,
  myAvailabilities: () => [...availabilityKeys.all, 'me'] as const,
  unavailabilities: (startDate?: string, endDate?: string) =>
    [...availabilityKeys.all, 'unavailabilities', { startDate, endDate }] as const,
};

/**
 * Fetch partner's availability rules
 */
export function useMyAvailabilities() {
  return useQuery({
    queryKey: availabilityKeys.myAvailabilities(),
    queryFn: () => availabilitiesService.getMyAvailabilities(),
  });
}

/**
 * Set multiple availability rules (bulk upsert)
 */
export function useSetWeekAvailabilities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (availabilities: SetAvailabilityDto[]) =>
      availabilitiesService.setWeekAvailabilities(availabilities),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.myAvailabilities() });
      toast.success('Horaires mis à jour avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour des horaires';
      toast.error(message);
    },
  });
}

/**
 * Update a single availability rule
 */
export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SetAvailabilityDto> }) =>
      availabilitiesService.updateAvailability(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.myAvailabilities() });
      toast.success('Horaire mis à jour avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour de l\'horaire';
      toast.error(message);
    },
  });
}

/**
 * Delete an availability rule
 */
export function useDeleteAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => availabilitiesService.deleteAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.myAvailabilities() });
      toast.success('Horaire supprimé avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression de l\'horaire';
      toast.error(message);
    },
  });
}

/**
 * Fetch unavailabilities with optional date range
 */
export function useUnavailabilities(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: availabilityKeys.unavailabilities(startDate, endDate),
    queryFn: () => availabilitiesService.getUnavailabilities(startDate, endDate),
  });
}

/**
 * Add an unavailability
 */
export function useAddUnavailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unavailability: AddUnavailabilityDto) =>
      availabilitiesService.addUnavailability(unavailability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
      toast.success('Jour fermé ajouté avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de l\'ajout du jour fermé';
      toast.error(message);
    },
  });
}

/**
 * Update an unavailability
 */
export function useUpdateUnavailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddUnavailabilityDto }) =>
      availabilitiesService.updateUnavailability(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
      toast.success('Jour fermé modifié avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la modification du jour fermé';
      toast.error(message);
    },
  });
}

/**
 * Remove an unavailability
 */
export function useRemoveUnavailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => availabilitiesService.removeUnavailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
      toast.success('Jour fermé supprimé avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression du jour fermé';
      toast.error(message);
    },
  });
}
