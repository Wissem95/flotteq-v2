import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnersApi } from '@/api/endpoints/partners';
import type {
  GetPartnersParams,
  UpdateCommissionRateDto,
  RejectPartnerDto,
  SuspendPartnerDto,
  CreatePartnerDto,
  UpdatePartnerDto,
} from '@/api/types/partner.types';
import { useToast } from '@/hooks/use-toast';

export const usePartners = (params?: GetPartnersParams) => {
  return useQuery({
    queryKey: ['partners', params],
    queryFn: () => partnersApi.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePartner = (id: string) => {
  return useQuery({
    queryKey: ['partners', id],
    queryFn: () => partnersApi.getOne(id),
    enabled: !!id,
  });
};

export const usePartnerServices = (id: string) => {
  return useQuery({
    queryKey: ['partners', id, 'services'],
    queryFn: () => partnersApi.getServices(id),
    enabled: !!id,
  });
};

export const useApprovePartner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => partnersApi.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['partners', id] });
      toast({
        title: 'Partenaire approuvé',
        description: 'Le partenaire a été approuvé avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description:
          error.response?.data?.message || "Impossible d'approuver le partenaire",
        variant: 'destructive',
      });
    },
  });
};

export const useRejectPartner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: RejectPartnerDto }) =>
      partnersApi.reject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['partners', id] });
      toast({
        title: 'Partenaire rejeté',
        description: 'Le partenaire a été rejeté',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de rejeter le partenaire',
        variant: 'destructive',
      });
    },
  });
};

export const useSuspendPartner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: SuspendPartnerDto }) =>
      partnersApi.suspend(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['partners', id] });
      toast({
        title: 'Partenaire suspendu',
        description: 'Le partenaire a été suspendu',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description:
          error.response?.data?.message || 'Impossible de suspendre le partenaire',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCommissionRate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommissionRateDto }) =>
      partnersApi.updateCommissionRate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['partners', id] });
      toast({
        title: 'Commission mise à jour',
        description: 'Le taux de commission a été modifié avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description:
          error.response?.data?.message ||
          'Impossible de modifier le taux de commission',
        variant: 'destructive',
      });
    },
  });
};

export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreatePartnerDto) => partnersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({
        title: 'Partenaire créé',
        description: 'Le partenaire a été créé avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de créer le partenaire',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePartner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerDto }) =>
      partnersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['partners', id] });
      toast({
        title: 'Partenaire modifié',
        description: 'Le partenaire a été modifié avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de modifier le partenaire',
        variant: 'destructive',
      });
    },
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => partnersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({
        title: 'Partenaire supprimé',
        description: 'Le partenaire a été supprimé avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de supprimer le partenaire',
        variant: 'destructive',
      });
    },
  });
};
