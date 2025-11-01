import api from '@/config/api';
import type {
  Driver,
  DriverListResponse,
  DriverFilters,
  CreateDriverData,
  UpdateDriverData,
  AssignVehicleData,
} from '@/types/driver.types';
import type { Vehicle } from '@/types/vehicle.types';

export const driversService = {
  /**
   * Récupérer la liste paginée des conducteurs
   */
  async getDrivers(filters: DriverFilters = {}): Promise<DriverListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`/drivers?${params.toString()}`);
    return response.data;
  },

  /**
   * Récupérer un conducteur par ID
   */
  async getDriver(id: string): Promise<Driver> {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  /**
   * Créer un nouveau conducteur
   */
  async createDriver(data: CreateDriverData): Promise<Driver> {
    const response = await api.post('/drivers', data);
    return response.data;
  },

  /**
   * Mettre à jour un conducteur
   */
  async updateDriver(id: string, data: UpdateDriverData): Promise<Driver> {
    const response = await api.patch(`/drivers/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer un conducteur
   */
  async deleteDriver(id: string): Promise<void> {
    await api.delete(`/drivers/${id}`);
  },

  /**
   * Récupérer les conducteurs disponibles (sans véhicule)
   */
  async getAvailableDrivers(): Promise<Driver[]> {
    const response = await api.get('/drivers/available');
    return response.data;
  },

  /**
   * Récupérer les conducteurs avec permis expirant bientôt
   */
  async getExpiringLicenses(days: number = 30): Promise<Driver[]> {
    const response = await api.get(`/drivers/expiring-licenses?days=${days}`);
    return response.data;
  },

  /**
   * Récupérer les véhicules d'un conducteur
   */
  async getDriverVehicles(id: string): Promise<Vehicle[]> {
    const response = await api.get(`/drivers/${id}/vehicles`);
    return response.data;
  },

  /**
   * Assigner un véhicule à un conducteur
   */
  async assignVehicle(id: string, data: AssignVehicleData): Promise<Driver> {
    const response = await api.post(`/drivers/${id}/assign-vehicle`, data);
    return response.data;
  },

  /**
   * Désassigner un véhicule d'un conducteur
   */
  async unassignVehicle(id: string, data: AssignVehicleData): Promise<Driver> {
    const response = await api.post(`/drivers/${id}/unassign-vehicle`, data);
    return response.data;
  },
};
