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
  async getAll(): Promise<Vehicle[]> {
    const response = await api.get<VehicleListResponse>('/vehicles');
    return response.data.data;
  },

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

  async getById(id: string): Promise<Vehicle> {
    return this.getVehicleById(id);
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

  async uploadPhotos(vehicleId: string, files: File[]): Promise<Vehicle> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });

    const response = await api.post(`/vehicles/${vehicleId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deletePhoto(vehicleId: string, photoUrl: string): Promise<Vehicle> {
    const response = await api.delete(`/vehicles/${vehicleId}/photos`, {
      data: { photoUrl },
    });
    return response.data;
  },

  async unassignDriver(vehicleId: string): Promise<Vehicle> {
    const response = await api.delete(`/vehicles/${vehicleId}/driver`);
    return response.data;
  },
};
