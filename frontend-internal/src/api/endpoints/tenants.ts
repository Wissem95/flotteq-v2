import { apiClient } from '../httpClient';
import type {
  Tenant,
  CreateTenantDto,
  UpdateTenantDto,
  TenantStats,
  TenantsListResponse,
} from '../types/tenant.types';

export const tenantsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<TenantsListResponse> => {
    // Le backend supporte maintenant la pagination et recherche
    // Enlever les paramètres vides pour éviter les erreurs de validation
    const cleanParams = {
      ...params,
    };

    // Ne pas envoyer search si vide
    if (!cleanParams.search || cleanParams.search.trim() === '') {
      delete cleanParams.search;
    }

    const response = await apiClient.get<TenantsListResponse>('/tenants', { params: cleanParams });
    return response.data;
  },

  getOne: async (id: number): Promise<Tenant> => {
    const response = await apiClient.get<Tenant>(`/tenants/${id}`);
    return response.data;
  },

  create: async (data: CreateTenantDto): Promise<Tenant> => {
    const response = await apiClient.post<Tenant>('/tenants', data);
    return response.data;
  },

  update: async (id: number, data: UpdateTenantDto): Promise<Tenant> => {
    const response = await apiClient.patch<Tenant>(`/tenants/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${id}`);
  },

  getStats: async (id: number): Promise<TenantStats> => {
    const response = await apiClient.get<TenantStats>(`/tenants/${id}/stats`);
    return response.data;
  },

  changePlan: async (id: number, planId: number): Promise<Tenant> => {
    const response = await apiClient.patch<Tenant>(`/tenants/${id}/change-plan/${planId}`);
    return response.data;
  },

  getStorageUsage: async (id: number): Promise<any> => {
    const response = await apiClient.get(`/tenants/${id}/storage-usage`);
    return response.data;
  },
};
