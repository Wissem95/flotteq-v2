import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsApi } from '@/api/endpoints/tenants';
import type { CreateTenantDto, UpdateTenantDto } from '@/api/types/tenant.types';
import { useToast } from '@/hooks/use-toast';

export const useTenants = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['tenants', params],
    queryFn: () => tenantsApi.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTenant = (id: number) => {
  return useQuery({
    queryKey: ['tenants', id],
    queryFn: () => tenantsApi.getOne(id),
    enabled: !!id,
  });
};

export const useTenantStats = (id: number) => {
  return useQuery({
    queryKey: ['tenants', id, 'stats'],
    queryFn: () => tenantsApi.getStats(id),
    enabled: !!id,
  });
};

export const useCreateTenant = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateTenantDto) => tenantsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({
        title: 'Tenant créé',
        description: 'Le tenant a été créé avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de créer le tenant',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTenantDto }) =>
      tenantsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenants', variables.id] });
      toast({
        title: 'Tenant modifié',
        description: 'Le tenant a été modifié avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de modifier le tenant',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => tenantsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({
        title: 'Tenant supprimé',
        description: 'Le tenant a été supprimé avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de supprimer le tenant',
        variant: 'destructive',
      });
    },
  });
};
