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
    const response = await apiClient.get<Partner>(`/api/partners/${id}`);
    return response.data;
  },

  getServices: async (id: string): Promise<PartnerService[]> => {
    const response = await apiClient.get<PartnerService[]>(`/api/partners/${id}/services`);
    return response.data;
  },

  approve: async (id: string): Promise<Partner> => {
    const response = await apiClient.patch<Partner>(`/api/partners/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, data?: RejectPartnerDto): Promise<Partner> => {
    const response = await apiClient.patch<Partner>(`/api/partners/${id}/reject`, data);
    return response.data;
  },

  suspend: async (id: string, data?: SuspendPartnerDto): Promise<Partner> => {
    const response = await apiClient.patch<Partner>(`/api/partners/${id}/suspend`, data);
    return response.data;
  },

  updateCommissionRate: async (
    id: string,
    data: UpdateCommissionRateDto,
  ): Promise<Partner> => {
    const response = await apiClient.patch<Partner>(
      `/api/partners/${id}/commission-rate`,
      data,
    );
    return response.data;
  },

  create: async (data: CreatePartnerDto): Promise<Partner> => {
    const response = await apiClient.post<Partner>('/partners', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePartnerDto): Promise<Partner> => {
    const response = await apiClient.patch<Partner>(`/api/partners/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/partners/${id}`);
  },
};
