// tenantsService.ts - Service pour la gestion des tenants
import { api } from "@/lib/api";

export interface Tenant {
  id: number;
  name: string;
  domain: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  database?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const tenantsService = {
  async getTenants(page: number = 1, perPage: number = 20) {
    const response = await api.get(`/internal/tenants?page=${page}&per_page=${perPage}`);
    return response.data;
  },

  async getTenant(id: number): Promise<Tenant> {
    const response = await api.get(`/internal/tenants/${id}`);
    return response.data;
  },

  async createTenant(data: Partial<Tenant>): Promise<Tenant> {
    const response = await api.post('/internal/tenants', data);
    return response.data;
  },

  async updateTenant(id: number, data: Partial<Tenant>): Promise<Tenant> {
    const response = await api.put(`/internal/tenants/${id}`, data);
    return response.data;
  },

  async deleteTenant(id: number): Promise<void> {
    await api.delete(`/internal/tenants/${id}`);
  },

  async getTenantStats(): Promise<any> {
    const response = await api.get('/internal/tenants/stats');
    return response.data;
  }
};