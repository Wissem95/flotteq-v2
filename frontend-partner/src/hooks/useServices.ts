import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { servicesService } from '../api/services.service';
import type { PartnerService, UpdateServiceDto } from '../types/partner';

// Query keys
export const serviceKeys = {
  all: ['services'] as const,
  myServices: () => [...serviceKeys.all, 'me'] as const,
};

/**
 * Fetch partner's services
 */
export function useMyServices() {
  return useQuery({
    queryKey: serviceKeys.myServices(),
    queryFn: () => servicesService.getMyServices(),
  });
}

/**
 * Update a service
 */
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateServiceDto }) =>
      servicesService.updateService(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.myServices() });
      toast.success('Service mis à jour avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour du service';
      toast.error(message);
    },
  });
}

/**
 * Create a new service
 */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (service: Omit<PartnerService, 'id' | 'partnerId' | 'createdAt' | 'updatedAt'>) =>
      servicesService.createService(service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.myServices() });
      toast.success('Service créé avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la création du service';
      toast.error(message);
    },
  });
}

/**
 * Delete a service
 */
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => servicesService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.myServices() });
      toast.success('Service supprimé avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression du service';
      toast.error(message);
    },
  });
}
