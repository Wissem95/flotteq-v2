import { apiClient } from '../httpClient';
import type {
  Driver,
  CreateDriverDto,
  UpdateDriverDto,
  DriversListResponse,
  DriversQueryParams,
} from '../types/driver.types';

export const driversApi = {
  getAll: async (params?: DriversQueryParams): Promise<DriversListResponse> => {
    const response = await apiClient.get<DriversListResponse>('/drivers');
    // Le backend retourne déjà { data, total, page, limit }
    return response.data;
  },

  getById: async (id: string): Promise<Driver> => {
    const response = await apiClient.get<Driver>(`/drivers/${id}`);
    return response.data;
  },

  create: async (data: CreateDriverDto): Promise<Driver> => {
    const response = await apiClient.post<Driver>('/drivers', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDriverDto): Promise<Driver> => {
    const response = await apiClient.patch<Driver>(`/drivers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/drivers/${id}`);
  },

  getVehicles: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/drivers/${id}/vehicles`);
    return response.data;
  },

  getExpiringLicenses: async (): Promise<Driver[]> => {
    const response = await apiClient.get<Driver[]>('/drivers/expiring-licenses');
    return response.data;
  },
};
