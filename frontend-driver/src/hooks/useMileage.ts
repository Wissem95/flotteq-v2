import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mileageService, type UpdateMileageData } from '@/api/services/mileage.service';
import { toast } from 'sonner';

export const useUpdateMileage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMileageData) => mileageService.updateMileage(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] });
      queryClient.invalidateQueries({ queryKey: ['mileage-history'] });
      toast.success(`Kilométrage mis à jour : ${data.newMileage.toLocaleString()} km (+${data.difference} km)`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour du kilométrage';
      toast.error(message);
    },
  });
};

export const useMileageHistory = () => {
  return useQuery({
    queryKey: ['mileage-history'],
    queryFn: () => mileageService.getHistory(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
