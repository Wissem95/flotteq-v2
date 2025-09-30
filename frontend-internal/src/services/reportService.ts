// reportService.ts - Service pour la génération de rapports

import { api } from '@/lib/api';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  tenantId?: string;
  category?: string;
}

export interface DashboardReportData {
  period: string;
  metrics: {
    tenants: {
      total: number;
      active: number;
      new: number;
      growth_rate: number;
    };
    revenue: {
      total: number;
      monthly_recurring: number;
      growth_rate: number;
      by_plan: Array<{
        plan: string;
        amount: number;
        percentage: number;
      }>;
    };
    users: {
      total: number;
      active: number;
      growth_rate: number;
    };
    vehicles: {
      total: number;
      active: number;
      maintenance_due: number;
    };
    partners: {
      garages: number;
      ct_centers: number;
      insurances: number;
      active_partnerships: number;
    };
    system: {
      uptime: number;
      avg_response_time: number;
      error_rate: number;
      active_alerts: number;
    };
  };
  charts: {
    revenue_evolution: Array<{
      month: string;
      revenue: number;
      tenants: number;
    }>;
    tenant_distribution: Array<{
      plan: string;
      count: number;
      percentage: number;
    }>;
    geographic_distribution: Array<{
      region: string;
      tenants: number;
      revenue: number;
    }>;
  };
}

export interface SupportReportData {
  period: string;
  tickets: {
    total: number;
    open: number;
    resolved: number;
    avg_resolution_time: number;
    satisfaction_score: number;
  };
  categories: Array<{
    category: string;
    count: number;
    avg_resolution_time: number;
  }>;
  agents: Array<{
    name: string;
    tickets_handled: number;
    avg_response_time: number;
    satisfaction_score: number;
  }>;
  trends: Array<{
    date: string;
    tickets_created: number;
    tickets_resolved: number;
  }>;
}

export interface FinancialReportData {
  period: string;
  summary: {
    total_revenue: number;
    recurring_revenue: number;
    one_time_payments: number;
    refunds: number;
    net_revenue: number;
    growth_rate: number;
  };
  by_tenant: Array<{
    tenant_name: string;
    revenue: number;
    plan: string;
    status: string;
    last_payment: string;
  }>;
  by_plan: Array<{
    plan_name: string;
    subscribers: number;
    revenue: number;
    churn_rate: number;
  }>;
  transactions: Array<{
    date: string;
    tenant: string;
    amount: number;
    type: string;
    status: string;
  }>;
}

class ReportService {
  // Génération de rapport du tableau de bord
  async generateDashboardReport(filters: ReportFilters = {}): Promise<Blob> {
    try {
      const response = await api.get('/reports/dashboard', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur génération rapport dashboard:', error);
      throw new Error('Impossible de générer le rapport du tableau de bord');
    }
  }

  // Génération de rapport support
  async generateSupportReport(filters: ReportFilters = {}): Promise<Blob> {
    try {
      const response = await api.get('/reports/support', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur génération rapport support:', error);
      throw new Error('Impossible de générer le rapport support');
    }
  }

  // Génération de rapport financier
  async generateFinancialReport(filters: ReportFilters = {}): Promise<Blob> {
    try {
      const response = await api.get('/reports/financial', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur génération rapport financier:', error);
      throw new Error('Impossible de générer le rapport financier');
    }
  }

  // Export Excel des données
  async exportToExcel(type: 'tenants' | 'support' | 'financial', filters: ReportFilters = {}): Promise<Blob> {
    try {
      const response = await api.get(`/reports/export/${type}`, {
        params: { format: 'excel', ...filters },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur export Excel:', error);
      throw new Error('Impossible d\'exporter les données en Excel');
    }
  }

  // Récupération des données du tableau de bord
  async getDashboardReportData(filters: ReportFilters): Promise<DashboardReportData> {
    try {
      const response = await api.get('/reports/dashboard/data', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données dashboard:', error);
      throw new Error('Impossible de récupérer les données du tableau de bord');
    }
  }

  // Récupération des données support
  async getSupportReportData(filters: ReportFilters): Promise<SupportReportData> {
    try {
      const response = await api.get('/reports/support/data', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données support:', error);
      throw new Error('Impossible de récupérer les données support');
    }
  }

  // Récupération des données financières
  async getFinancialReportData(filters: ReportFilters): Promise<FinancialReportData> {
    try {
      const response = await api.get('/reports/financial/data', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données financières:', error);
      throw new Error('Impossible de récupérer les données financières');
    }
  }



}

export const reportService = new ReportService();