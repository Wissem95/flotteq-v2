import api from '@/config/api';
import type { CreateRatingDto, Rating, RatingListResponse } from '@/types/rating.types';

export const ratingsService = {
  /**
   * Create a rating for a completed booking
   */
  async createRating(data: CreateRatingDto): Promise<{ message: string; rating: Rating }> {
    const response = await api.post<{ message: string; rating: Rating }>('/ratings', data);
    return response.data;
  },

  /**
   * Get all ratings created by the authenticated tenant
   */
  async getMyRatings(page = 1, limit = 20): Promise<RatingListResponse> {
    const response = await api.get<RatingListResponse>('/ratings/my-ratings', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get ratings for a specific partner
   */
  async getPartnerRatings(partnerId: string, page = 1, limit = 20): Promise<RatingListResponse> {
    const response = await api.get<RatingListResponse>(`/ratings/partner/${partnerId}`, {
      params: { page, limit },
    });
    return response.data;
  },
};
