import api from '@/config/api';
import type { DashboardStats, Alert, CostAnalysis, SubscriptionUsage } from '@/types/dashboard.types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  async getAlerts(): Promise<Alert[]> {
    const response = await api.get('/dashboard/alerts');
    return response.data;
  },

  async getCosts(): Promise<CostAnalysis> {
    const response = await api.get('/dashboard/tenant/costs');
    return response.data;
  },

  async getSubscriptionUsage(): Promise<SubscriptionUsage> {
    const response = await api.get('/dashboard/subscription-usage');
    return response.data;
  },
};
