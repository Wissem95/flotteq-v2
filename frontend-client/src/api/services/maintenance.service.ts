import api from '../axios';
import {
  Maintenance,
  MaintenanceTemplate,
  MaintenanceAlert,
  MaintenanceCostSummary,
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
  CreateMaintenanceTemplateDto,
  CreateMaintenanceFromTemplateDto,
} from '../../types/maintenance.types';

export const maintenanceService = {
  // Maintenances CRUD
  async getAll(): Promise<Maintenance[]> {
    const { data } = await api.get('/maintenance');
    return data;
  },

  async getById(id: string): Promise<Maintenance> {
    const { data } = await api.get(`/maintenance/${id}`);
    return data;
  },

  async create(dto: CreateMaintenanceDto): Promise<Maintenance> {
    const { data } = await api.post('/maintenance', dto);
    return data;
  },

  async update(id: string, dto: UpdateMaintenanceDto): Promise<Maintenance> {
    const { data } = await api.patch(`/maintenance/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/maintenance/${id}`);
  },

  // Alerts & Stats
  async getUpcomingAlerts(daysAhead: number = 7): Promise<MaintenanceAlert[]> {
    const { data } = await api.get('/maintenance/alerts/upcoming', {
      params: { daysAhead },
    });
    return data;
  },

  async getKmAlerts(): Promise<MaintenanceAlert[]> {
    const { data } = await api.get('/maintenance/alerts/km');
    return data;
  },

  async getTotalCosts(): Promise<number> {
    const { data } = await api.get('/maintenance/costs/total');
    return data;
  },

  // Vehicle-specific
  async getByVehicle(vehicleId: string): Promise<Maintenance[]> {
    const { data } = await api.get(`/maintenance/vehicle/${vehicleId}`);
    return data;
  },

  async getVehicleCostSummary(vehicleId: string): Promise<MaintenanceCostSummary> {
    const { data } = await api.get(`/maintenance/vehicle/${vehicleId}/costs`);
    return data;
  },

  // Templates CRUD
  async getAllTemplates(): Promise<MaintenanceTemplate[]> {
    const { data } = await api.get('/maintenance/templates');
    return data;
  },

  async getTemplateById(id: string): Promise<MaintenanceTemplate> {
    const { data } = await api.get(`/maintenance/templates/${id}`);
    return data;
  },

  async createTemplate(dto: CreateMaintenanceTemplateDto): Promise<MaintenanceTemplate> {
    const { data } = await api.post('/maintenance/templates', dto);
    return data;
  },

  async updateTemplate(id: string, dto: Partial<CreateMaintenanceTemplateDto>): Promise<MaintenanceTemplate> {
    const { data } = await api.patch(`/maintenance/templates/${id}`, dto);
    return data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/maintenance/templates/${id}`);
  },

  async createFromTemplate(templateId: string, dto: CreateMaintenanceFromTemplateDto): Promise<Maintenance> {
    const { data } = await api.post(`/maintenance/from-template/${templateId}`, dto);
    return data;
  },
};
