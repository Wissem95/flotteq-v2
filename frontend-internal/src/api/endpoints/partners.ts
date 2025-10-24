import { apiClient } from '../httpClient';
import type {
  Partner,
  PartnerService,
  PartnersListResponse,
  GetPartnersParams,
  UpdateCommissionRateDto,
  RejectPartnerDto,
  SuspendPartnerDto,
  CreatePartnerDto,
  UpdatePartnerDto,
} from '../types/partner.types';

export const partnersApi = {
  getAll: async (params?: GetPartnersParams): Promise<PartnersListResponse> => {
    const cleanParams = { ...params };

    // Remove empty search to avoid validation errors
    if (!cleanParams.search || cleanParams.search.trim() === '') {
      delete cleanParams.search;
    }

    const response = await apiClient.get<PartnersListResponse>('/partners', {
      params: cleanParams,
    });
    return response.data;
  },

  getOne: async (id: string): Promise<Partner> => {
    const response = await apiClient.get<Partner>(`/partners/${id}`);
    return response.data;
  },

  getServices: async (id: string): Promise<PartnerService[]> => {
    const response = await apiClient.get<PartnerService[]>(`/partners/${id}/services`);
    return response.data;
  },

  approve: async (id: string): Promise<Partner> => {
    const response = await apiClient.patch<Partner>(`/partners/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, data?: RejectPartnerDto): Promise<Partner> => {
    const response = await apiClient.patch<Partner>(`/partners/${id}/reject`, data);
    return response.data;
  },

  suspend: async (id: string, data?: SuspendPartnerDto): Promise<Partner> => {
    const response = await apiClient.patch<Partner>(`/partners/${id}/suspend`, data);
    return response.data;
  },

  updateCommissionRate: async (
    id: string,
    data: UpdateCommissionRateDto,
  ): Promise<Partner> => {
    const response = await apiClient.patch<Partner>(
      `/partners/${id}/commission-rate`,
      data,
    );
    return response.data;
  },

  create: async (data: CreatePartnerDto): Promise<Partner> => {
    const response = await apiClient.post<Partner>('/partners', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePartnerDto): Promise<Partner> => {
    const response = await apiClient.patch<Partner>(`/partners/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/partners/${id}`);
  },
};
