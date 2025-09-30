import { api } from "@/lib/api";

export interface FinancialOverview {
  monthly_metrics: {
    current_month_cost: number;
    pending_invoices: number;
    average_maintenance_cost: number;
    evolution_percentage: number;
  };
  cumulated_overview: {
    total_cost: number;
    total_maintenances: number;
    total_repairs_cost: number;
    monthly_average: number;
    highest_cost: {
      cost: number;
      type: string;
    };
  };
}

export interface MonthlyData {
  month: string;
  month_name: string;
  cost: number;
}

export interface ExpenseBreakdown {
  breakdown: Array<{
    type: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  total_amount: number;
}

export interface TopExpensiveVehicle {
  id: number;
  marque: string;
  modele: string;
  immatriculation: string;
  interventions_count: number;
  total_cost: number;
}

export interface MaintenanceStats {
  monthly_maintenances: number;
  yearly_maintenances: number;
  average_per_vehicle: number;
  most_expensive_this_month: number;
}

export interface ExpenseHistoryItem {
  id: string;
  vehicle: string;
  plate: string;
  date: string;
  type: string;
  amount: number;
  invoice_number?: string;
}

export interface FinancialAlert {
  type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  details: string;
}

export const financesService = {
  async getOverview(): Promise<FinancialOverview> {
    const response = await api.get('/finances/overview');
    return response.data;
  },

  async getMonthlyChart(): Promise<{ monthly_data: MonthlyData[] }> {
    const response = await api.get('/finances/monthly-chart');
    return response.data;
  },

  async getExpenseBreakdown(): Promise<ExpenseBreakdown> {
    const response = await api.get('/finances/expense-breakdown');
    return response.data;
  },

  async getTopExpensiveVehicles(): Promise<{ top_vehicles: TopExpensiveVehicle[] }> {
    const response = await api.get('/finances/top-expensive-vehicles');
    return response.data;
  },

  async getMaintenanceStats(): Promise<MaintenanceStats> {
    const response = await api.get('/finances/maintenance-stats');
    return response.data;
  },

  async getExpenseHistory(page: number = 1, perPage: number = 10): Promise<{
    expenses: ExpenseHistoryItem[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  }> {
    const response = await api.get(`/finances/expense-history?page=${page}&per_page=${perPage}`);
    return response.data;
  },

  async getFinancialAlerts(): Promise<{ alerts: FinancialAlert[] }> {
    const response = await api.get('/finances/alerts');
    return response.data;
  },
};