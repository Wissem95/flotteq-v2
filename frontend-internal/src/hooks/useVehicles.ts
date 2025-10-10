import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@/api/endpoints/vehicles';
import type { CreateVehicleDto, UpdateVehicleDto, VehiclesQueryParams } from '@/api/types/vehicle.types';
import { useToast } from '@/hooks/use-toast';

export const useVehicles = (params?: VehiclesQueryParams) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => vehiclesApi.getAll(params),
  });

  const createMutation = useMutation({
    mutationFn: vehiclesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({ title: 'Véhicule créé', description: 'Le véhicule a été créé avec succès' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de créer le véhicule',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleDto }) =>
      vehiclesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({ title: 'Véhicule modifié', description: 'Le véhicule a été modifié avec succès' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: vehiclesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({ title: 'Véhicule supprimé', description: 'Le véhicule a été supprimé avec succès' });
    },
  });

  return {
    vehicles: data?.data || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
    createVehicle: createMutation.mutate,
    updateVehicle: updateMutation.mutate,
    deleteVehicle: deleteMutation.mutate,
    isCreating: createMutation.isPending,
  };
};

export const useVehicle = (id: string) => {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => vehiclesApi.getById(id),
    enabled: !!id,
  });
};
