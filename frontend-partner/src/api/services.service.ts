import axiosInstance from '../lib/axios';
import { API_CONFIG } from '../config/api';
import type { PartnerService, UpdateServiceDto } from '../types/partner';

interface ServicesResponse {
  message: string;
  count: number;
  services: PartnerService[];
}

interface ServiceResponse {
  message: string;
  service: PartnerService;
}

export const servicesService = {
  /**
   * Get my services
   */
  getMyServices: async (): Promise<PartnerService[]> => {
    const { data } = await axiosInstance.get<ServicesResponse>(
      API_CONFIG.ENDPOINTS.PARTNER_SERVICES
    );
    return data.services;
  },

  /**
   * Update a service
   */
  updateService: async (id: string, updates: UpdateServiceDto): Promise<PartnerService> => {
    const { data } = await axiosInstance.patch<ServiceResponse>(
      `/api/partners/services/${id}`,
      updates
    );
    return data.service;
  },

  /**
   * Create a new service
   */
  createService: async (service: Omit<PartnerService, 'id' | 'partnerId' | 'createdAt' | 'updatedAt'>): Promise<PartnerService> => {
    const { data } = await axiosInstance.post<ServiceResponse>(
      API_CONFIG.ENDPOINTS.PARTNER_SERVICES,
      service
    );
    return data.service;
  },

  /**
   * Delete a service
   */
  deleteService: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/partners/services/${id}`);
  },
};
