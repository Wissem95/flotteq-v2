import { apiClient } from '../httpClient';
import type {
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto,
  VehiclesListResponse,
  VehiclesQueryParams,
} from '../types/vehicle.types';

export const vehiclesApi = {
  getAll: async (params?: VehiclesQueryParams): Promise<VehiclesListResponse> => {
    const response = await apiClient.get<VehiclesListResponse>('/vehicles');
    // Le backend retourne déjà { data, total, page, limit }
    return response.data;
  },

  getById: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.get<Vehicle>(`/vehicles/${id}`);
    return response.data;
  },

  create: async (data: CreateVehicleDto): Promise<Vehicle> => {
    const response = await apiClient.post<Vehicle>('/vehicles', data);
    return response.data;
  },

  update: async (id: string, data: UpdateVehicleDto): Promise<Vehicle> => {
    const response = await apiClient.patch<Vehicle>(`/vehicles/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/vehicles/${id}`);
  },

  assignDriver: async (id: string, driverId: string): Promise<Vehicle> => {
    const response = await apiClient.patch<Vehicle>(`/vehicles/${id}`, {
      assignedDriverId: driverId,
    });
    return response.data;
  },

  unassignDriver: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.delete<Vehicle>(`/vehicles/${id}/driver`);
    return response.data;
  },

  getStats: async (): Promise<any> => {
    const response = await apiClient.get('/vehicles/stats');
    return response.data;
  },
};
