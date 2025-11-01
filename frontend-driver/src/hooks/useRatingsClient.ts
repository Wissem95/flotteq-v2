import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ratingsService } from '@/api/services/ratings.service';
import type { CreateRatingDto } from '@/types/rating.types';

export function useCreateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRatingDto) => ratingsService.createRating(data),
    onSuccess: (response) => {
      toast.success('Avis enregistré avec succès !');
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      return response;
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de l\'enregistrement de l\'avis';
      toast.error(message);
    },
  });
}

export function useMyRatings(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['ratings', 'my-ratings', page, limit],
    queryFn: () => ratingsService.getMyRatings(page, limit),
  });
}

export function usePartnerRatings(partnerId: string | undefined, page = 1, limit = 20, enabled = true) {
  return useQuery({
    queryKey: ['ratings', 'partner', partnerId, page, limit],
    queryFn: () => ratingsService.getPartnerRatings(partnerId!, page, limit),
    enabled: enabled && !!partnerId,
  });
}
