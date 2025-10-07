import api from '@/config/api';
import type {
  Vehicle,
  VehicleFilters,
  VehicleListResponse,
  VehicleStats,
  VehicleTimeline,
  VehicleCostAnalysis,
  CreateVehicleData,
  UpdateVehicleData,
} from '../../types/vehicle.types';

export const vehiclesService = {
  async getVehicles(filters: VehicleFilters = {}): Promise<VehicleListResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.model) params.append('model', filters.model);
    if (filters.registration) params.append('registration', filters.registration);
    if (filters.assignedDriverId) params.append('assignedDriverId', filters.assignedDriverId);

    const response = await api.get(`/vehicles?${params.toString()}`);
    return response.data;
  },

  async getVehicleById(id: string): Promise<Vehicle> {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  async getVehicleStats(): Promise<VehicleStats> {
    const response = await api.get('/vehicles/stats');
    return response.data;
  },

  async getVehicleTimeline(id: string): Promise<VehicleTimeline> {
    const response = await api.get(`/vehicles/${id}/timeline`);
    return response.data;
  },

  async getVehicleCostAnalysis(id: string): Promise<VehicleCostAnalysis> {
    const response = await api.get(`/vehicles/${id}/costs`);
    return response.data;
  },

  async createVehicle(data: CreateVehicleData): Promise<Vehicle> {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  async updateVehicle(id: string, data: UpdateVehicleData): Promise<Vehicle> {
    const response = await api.patch(`/vehicles/${id}`, data);
    return response.data;
  },

  async deleteVehicle(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },
};
