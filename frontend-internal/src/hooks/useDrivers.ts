import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driversApi } from '@/api/endpoints/drivers';
import type { CreateDriverDto, UpdateDriverDto, DriversQueryParams, DriverStatus } from '@/api/types/driver.types';
import { useToast } from '@/hooks/use-toast';

export const useDrivers = (params?: DriversQueryParams) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['drivers', params],
    queryFn: () => driversApi.getAll(params),
  });

  const createMutation = useMutation({
    mutationFn: driversApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast({ title: 'Conducteur créé', description: 'Le conducteur a été créé avec succès' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de créer le conducteur',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDriverDto }) =>
      driversApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast({ title: 'Conducteur modifié', description: 'Le conducteur a été modifié avec succès' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: driversApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast({ title: 'Conducteur supprimé', description: 'Le conducteur a été supprimé avec succès' });
    },
  });

  // Mutation de supervision : changer le statut (désactiver / bannir / réactiver)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DriverStatus }) =>
      driversApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast({ title: 'Statut mis à jour', description: 'Le statut du conducteur a été mis à jour' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de mettre à jour le statut',
      });
    },
  });

  return {
    drivers: data?.data || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
    createDriver: createMutation.mutate,
    updateDriver: updateMutation.mutate,
    deleteDriver: deleteMutation.mutate,
    updateDriverStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    isCreating: createMutation.isPending,
  };
};

export const useDriver = (id: string) => {
  return useQuery({
    queryKey: ['drivers', id],
    queryFn: () => driversApi.getById(id),
    enabled: !!id,
  });
};
