import api from '@/config/api';
import type {
  SearchPartnersParams,
  SearchPartnersResponse,
  MarketplacePartner,
  PartnerService,
  AvailableSlotsResponse,
} from '@/types/marketplace.types';

export const marketplaceService = {
  /**
   * Search partners by geolocation and filters
   */
  async searchPartners(params: SearchPartnersParams): Promise<SearchPartnersResponse> {
    // Map frontend params to backend DTO format
    const backendParams = {
      lat: params.latitude,
      lng: params.longitude,
      radius: params.radius || 10,
      ...(params.type && { type: params.type }),
      ...(params.minRating && { minRating: params.minRating }),
      ...(params.minPrice && { priceMin: params.minPrice }),
      ...(params.maxPrice && { priceMax: params.maxPrice }),
      ...(params.page && { page: params.page }),
      ...(params.limit && { limit: params.limit }),
    };

    const response = await api.post<SearchPartnersResponse>('/partners/search', backendParams);
    return response.data;
  },

  /**
   * Get partner details by ID (public endpoint for marketplace)
   */
  async getPartnerDetails(partnerId: string): Promise<MarketplacePartner> {
    const response = await api.get<MarketplacePartner>(`/partners/${partnerId}`);
    return response.data;
  },

  /**
   * Get partner's services
   */
  async getPartnerServices(partnerId: string): Promise<PartnerService[]> {
    const response = await api.get<PartnerService[]>(`/partners/${partnerId}/services`);
    return response.data;
  },

  /**
   * Get available time slots for a partner service on a specific date
   */
  async getAvailableSlots(
    partnerId: string,
    _serviceId: string,
    date: string,
    duration: number,
  ): Promise<AvailableSlotsResponse> {
    const response = await api.get<AvailableSlotsResponse>(
      `/availabilities/${partnerId}/slots`,
      {
        params: {
          date,
          duration,
        },
      },
    );
    return response.data;
  },
};
