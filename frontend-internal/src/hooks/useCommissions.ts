import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commissionsApi } from '@/api/endpoints/commissions';
import type { CommissionFilterParams, MarkPaidDto } from '@/api/types/commission.types';
import { useToast } from '@/hooks/use-toast';

export const useCommissions = (params?: CommissionFilterParams) => {
  return useQuery({
    queryKey: ['commissions', params],
    queryFn: () => commissionsApi.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCommissionsStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['commissions', 'stats', startDate, endDate],
    queryFn: () => commissionsApi.getStats(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePendingCommissions = () => {
  return useQuery({
    queryKey: ['commissions', 'pending'],
    queryFn: () => commissionsApi.getPending(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCommission = (id: string) => {
  return useQuery({
    queryKey: ['commissions', id],
    queryFn: () => commissionsApi.getOne(id),
    enabled: !!id,
  });
};

export const useMarkAsPaid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarkPaidDto }) =>
      commissionsApi.markAsPaid(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      toast({
        title: 'Commission marquée payée',
        description: 'La commission a été marquée comme payée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description:
          error.response?.data?.message || 'Impossible de marquer la commission comme payée',
        variant: 'destructive',
      });
    },
  });
};

export const useExportCommissions = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params?: CommissionFilterParams) => commissionsApi.exportToExcel(params),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `commissions_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export réussi',
        description: 'Le fichier Excel a été téléchargé',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || "Impossible d'exporter les commissions",
        variant: 'destructive',
      });
    },
  });
};
