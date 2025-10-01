import { api } from "@/lib/api";

export interface TransactionOverview {
  fleet_metrics: {
    total_fleet_value: number;
    total_investment: number;
    estimated_market_value: number;
    potential_profit: number;
    average_margin: number;
  };
  transaction_metrics: {
    total_purchases: number;
    total_sales: number;
    total_purchase_amount: number;
    total_sale_amount: number;
    net_transaction_result: number;
  };
}

export interface VehicleAnalysis {
  id: number;
  vehicle: string;
  plate: string;
  purchase_price: number;
  total_expenses: number;
  total_investment: number;
  estimated_market_value: number;
  estimated_sale_price: number;
  profit_loss: number;
  profit_loss_percentage: number;
  age_years: number;
  recommendation: {
    action: 'sell' | 'hold';
    priority: 'high' | 'medium' | 'low';
    reason: string;
  };
}

export interface Transaction {
  id: number;
  type: 'purchase' | 'sale';
  vehicle: string;
  plate: string;
  date: string;
  price: number;
  mileage?: number;
  seller_buyer_name: string;
  seller_buyer_contact?: string;
  reason?: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface CreateTransactionData {
  vehicle_id: number;
  type: 'purchase' | 'sale';
  date: string;
  price: number;
  mileage?: number;
  seller_buyer_name: string;
  seller_buyer_contact?: string;
  reason?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

export const transactionsService = {
  async getOverview(): Promise<TransactionOverview> {
    const response = await api.get('/transactions/overview');
    return response.data;
  },

  async getVehicleAnalysis(): Promise<{ vehicle_analysis: VehicleAnalysis[] }> {
    const response = await api.get('/transactions/vehicle-analysis');
    return response.data;
  },

  async getHistory(
    page: number = 1, 
    perPage: number = 10, 
    type?: 'purchase' | 'sale'
  ): Promise<{
    transactions: Transaction[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  }> {
    let url = `/transactions/history?page=${page}&per_page=${perPage}`;
    if (type) {
      url += `&type=${type}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  async createTransaction(data: CreateTransactionData): Promise<{ transaction: Transaction; message: string }> {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  async updateTransaction(id: number, data: Partial<CreateTransactionData>): Promise<{ transaction: Transaction; message: string }> {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  async deleteTransaction(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};