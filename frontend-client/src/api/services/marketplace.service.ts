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
    const response = await api.post<SearchPartnersResponse>('/partners/search', params);
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
    serviceId: string,
    date: string,
  ): Promise<AvailableSlotsResponse> {
    const response = await api.get<AvailableSlotsResponse>(
      `/availabilities/${partnerId}/slots`,
      {
        params: {
          serviceId,
          date,
        },
      },
    );
    return response.data;
  },
};
