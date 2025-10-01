// subscriptionsService.ts - Service de gestion des abonnements FlotteQ
import { api } from "@/lib/api";

// === INTERFACES ===

// Interface pour les données brutes de l'API backend
export interface SubscriptionPlanApi {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    vehicles?: number;
    users?: number;
    support_tickets?: number;
    api_requests?: number;
    storage_gb?: number;
  };
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  metadata?: {
    pricing?: {
      monthly?: number;
      yearly?: number;
    };
    badge?: string;
    color?: string;
  };
  created_at: string;
  updated_at: string;
}

// Interface pour l'affichage frontend (format transformé)
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_vehicles: number;
  max_users: number;
  support_level: 'basic' | 'premium' | 'enterprise';
  is_active: boolean;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  tenant_id: number;
  plan_id: string;
  plan: SubscriptionPlan;
  tenant: {
    id: number;
    name: string;
    email: string;
    status: string;
  };
  status: 'active' | 'inactive' | 'suspended' | 'cancelled' | 'expired';
  billing_cycle: 'monthly' | 'yearly';
  price: number;
  started_at: string;
  expires_at: string;
  next_billing_date: string;
  auto_renew: boolean;
  trial_ends_at: string | null;
  is_trial: boolean;
  payment_method?: PaymentMethod;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'paypal';
  last_four: string;
  brand: string;
  expires_at: string;
  is_default: boolean;
}

export interface Invoice {
  id: string;
  subscription_id: number;
  subscription: Subscription;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  due_date: string;
  paid_at: string | null;
  invoice_number: string;
  description: string;
  payment_method?: PaymentMethod;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionFilters {
  tenant_id?: number;
  plan_id?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'cancelled' | 'expired';
  billing_cycle?: 'monthly' | 'yearly';
  is_trial?: boolean;
  expires_before?: string;
  search?: string;
}

export interface SubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  expired_subscriptions: number;
  suspended_subscriptions: number;
  monthly_revenue: number;
  yearly_revenue: number;
  total_revenue: number;
  churn_rate: number;
  growth_rate: number;
  average_revenue_per_user: number;
  revenue_by_plan: Array<{
    plan_name: string;
    revenue: number;
    subscription_count: number;
  }>;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    new_subscriptions: number;
    cancelled_subscriptions: number;
  }>;
}

export interface CreateSubscriptionData {
  tenant_id: number;
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
  auto_renew?: boolean;
  trial_days?: number;
  payment_method_id?: string;
}

export interface UpdateSubscriptionData {
  plan_id?: string;
  billing_cycle?: 'monthly' | 'yearly';
  auto_renew?: boolean;
  status?: 'active' | 'suspended' | 'cancelled';
}

export interface CreatePlanData {
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_vehicles: number;
  max_users: number;
  support_level: 'basic' | 'premium' | 'enterprise';
  is_popular?: boolean;
}

export interface CreatePlanApiData {
  name: string;
  description: string;
  price: number;
  price_monthly?: number;
  price_yearly?: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  limits?: object;
  max_vehicles?: number;
  max_users?: number;
  support_level?: string;
  is_active?: boolean;
  is_popular?: boolean;
  sort_order?: number;
  metadata?: object;
}

// === TRANSFORMATIONS ===

const transformPlanApiToFrontend = (apiPlan: SubscriptionPlanApi): SubscriptionPlan => {
  return {
    id: apiPlan.id,
    name: apiPlan.name,
    description: apiPlan.description,
    price_monthly: apiPlan.metadata?.pricing?.monthly || apiPlan.price,
    price_yearly: apiPlan.metadata?.pricing?.yearly || (apiPlan.price * 12 * 0.8),
    features: apiPlan.features || [],
    max_vehicles: apiPlan.limits?.vehicles || 0,
    max_users: apiPlan.limits?.users || 0,
    support_level: determineSupportLevel(apiPlan.limits?.support_tickets),
    is_active: apiPlan.is_active,
    is_popular: apiPlan.is_popular,
    created_at: apiPlan.created_at,
    updated_at: apiPlan.updated_at,
  };
};

const determineSupportLevel = (supportTickets?: number): 'basic' | 'premium' | 'enterprise' => {
  if (supportTickets === -1) return 'enterprise';
  if (supportTickets && supportTickets > 10) return 'premium';
  return 'basic';
};

// === SERVICE ===

export const subscriptionsService = {
  // === SUBSCRIPTIONS ===
  
  async getSubscriptions(page: number = 1, perPage: number = 20, filters?: SubscriptionFilters) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/internal/subscriptions?${params}`);
    return response.data;
  },

  async getSubscription(id: number): Promise<Subscription> {
    const response = await api.get(`/internal/subscriptions/${id}`);
    return response.data;
  },

  async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    const response = await api.post('/internal/subscriptions', data);
    return response.data;
  },

  async updateSubscription(id: number, data: UpdateSubscriptionData): Promise<Subscription> {
    const response = await api.put(`/internal/subscriptions/${id}`, data);
    return response.data;
  },

  async cancelSubscription(id: number, reason?: string): Promise<Subscription> {
    const response = await api.post(`/internal/subscriptions/${id}/cancel`, { reason });
    return response.data;
  },

  async suspendSubscription(id: number, reason?: string): Promise<Subscription> {
    const response = await api.post(`/internal/subscriptions/${id}/suspend`, { reason });
    return response.data;
  },

  async reactivateSubscription(id: number): Promise<Subscription> {
    const response = await api.post(`/internal/subscriptions/${id}/reactivate`);
    return response.data;
  },

  async extendTrial(id: number, days: number): Promise<Subscription> {
    const response = await api.post(`/internal/subscriptions/${id}/extend-trial`, { days });
    return response.data;
  },

  // === PLANS ===
  
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get('/internal/subscriptions/plans');
    const apiPlans: SubscriptionPlanApi[] = response.data;
    return apiPlans.map(transformPlanApiToFrontend);
  },

  async getPlan(id: string): Promise<SubscriptionPlan> {
    const response = await api.get(`/internal/subscriptions/plans/${id}`);
    const apiPlan: SubscriptionPlanApi = response.data;
    return transformPlanApiToFrontend(apiPlan);
  },

  async createPlan(data: CreatePlanData | CreatePlanApiData): Promise<SubscriptionPlan> {
    // Transform data if it's in the frontend format
    let apiData: CreatePlanApiData;
    
    if ('price_monthly' in data && 'max_vehicles' in data) {
      // Frontend format - transform to API format
      const frontendData = data as CreatePlanData;
      apiData = {
        name: frontendData.name,
        description: frontendData.description,
        price: frontendData.price_monthly,
        price_monthly: frontendData.price_monthly,
        price_yearly: frontendData.price_yearly,
        currency: 'EUR',
        billing_cycle: 'monthly',
        features: frontendData.features,
        max_vehicles: frontendData.max_vehicles,
        max_users: frontendData.max_users,
        support_level: frontendData.support_level,
        is_active: true,
        is_popular: frontendData.is_popular ?? false,
        sort_order: frontendData.support_level === 'enterprise' ? 3 : 
                   frontendData.support_level === 'premium' ? 2 : 1,
        metadata: {
          pricing: {
            monthly: frontendData.price_monthly,
            yearly: frontendData.price_yearly
          }
        }
      };
    } else {
      // Already in API format
      apiData = data as CreatePlanApiData;
    }

    const response = await api.post('/internal/subscriptions/plans', apiData);
    const apiPlan: SubscriptionPlanApi = response.data.plan || response.data;
    return transformPlanApiToFrontend(apiPlan);
  },

  async updatePlan(id: string, data: Partial<CreatePlanData> | CreatePlanApiData): Promise<SubscriptionPlan> {
    // Transform data if needed (similar to createPlan)
    let apiData: CreatePlanApiData;
    
    if (data && 'price_monthly' in data && 'max_vehicles' in data) {
      // Frontend format - transform to API format
      const frontendData = data as Partial<CreatePlanData>;
      apiData = {
        name: frontendData.name || '',
        description: frontendData.description || '',
        price: frontendData.price_monthly || 0,
        price_monthly: frontendData.price_monthly,
        price_yearly: frontendData.price_yearly,
        currency: 'EUR',
        billing_cycle: 'monthly',
        features: frontendData.features || [],
        max_vehicles: frontendData.max_vehicles,
        max_users: frontendData.max_users,
        support_level: frontendData.support_level,
        is_active: true,
        is_popular: frontendData.is_popular ?? false,
        sort_order: frontendData.support_level === 'enterprise' ? 3 : 
                   frontendData.support_level === 'premium' ? 2 : 1,
        metadata: {
          pricing: {
            monthly: frontendData.price_monthly,
            yearly: frontendData.price_yearly
          }
        }
      };
    } else {
      // Already in API format
      apiData = data as CreatePlanApiData;
    }

    const response = await api.put(`/internal/subscriptions/plans/${id}`, apiData);
    const apiPlan: SubscriptionPlanApi = response.data.plan || response.data;
    return transformPlanApiToFrontend(apiPlan);
  },

  async togglePlanStatus(id: string): Promise<SubscriptionPlan> {
    const response = await api.post(`/internal/subscriptions/plans/${id}/toggle-status`);
    const apiPlan: SubscriptionPlanApi = response.data.plan || response.data;
    return transformPlanApiToFrontend(apiPlan);
  },

  async deletePlan(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/internal/subscriptions/plans/${id}`);
    return response.data;
  },

  // === INVOICES ===
  
  async getInvoices(page: number = 1, perPage: number = 20, filters?: { subscription_id?: number; status?: string; tenant_id?: number }) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/invoices?${params}`);
    return response.data;
  },

  async getInvoice(id: string): Promise<Invoice> {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  async sendInvoice(id: string): Promise<{ message: string }> {
    const response = await api.post(`/invoices/${id}/send`);
    return response.data;
  },

  async markInvoiceAsPaid(id: string): Promise<Invoice> {
    const response = await api.post(`/invoices/${id}/mark-paid`);
    return response.data;
  },

  async refundInvoice(id: string, amount?: number): Promise<Invoice> {
    const response = await api.post(`/invoices/${id}/refund`, { amount });
    return response.data;
  },

  async downloadInvoice(id: string): Promise<Blob> {
    const response = await api.get(`/invoices/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // === STATISTICS ===
  
  async getSubscriptionStats(): Promise<SubscriptionStats> {
    const response = await api.get('/internal/subscriptions/stats');
    return response.data;
  },

  // Alias for compatibility
  async getStats(): Promise<SubscriptionStats> {
    return this.getSubscriptionStats();
  },

  async getRevenueReport(startDate: string, endDate: string) {
    const response = await api.get('/subscriptions/revenue-report', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  // === UTILITIES ===
  
  async searchSubscriptions(query: string): Promise<Subscription[]> {
    const response = await api.get('/subscriptions/search', {
      params: { q: query }
    });
    return response.data;
  },

  async exportSubscriptions(format: 'csv' | 'excel', filters?: SubscriptionFilters): Promise<Blob> {
    const params = new URLSearchParams({
      format,
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/subscriptions/export?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async bulkUpdateSubscriptions(subscriptionIds: number[], data: { status?: string; auto_renew?: boolean }): Promise<{ message: string; updated_count: number }> {
    const response = await api.post('/subscriptions/bulk-update', {
      subscription_ids: subscriptionIds,
      data
    });
    return response.data;
  },

  // === PAYMENT METHODS ===
  
  async getPaymentMethods(tenantId: number): Promise<PaymentMethod[]> {
    const response = await api.get(`/tenants/${tenantId}/payment-methods`);
    return response.data;
  },

  async deletePaymentMethod(tenantId: number, paymentMethodId: string): Promise<{ message: string }> {
    const response = await api.delete(`/tenants/${tenantId}/payment-methods/${paymentMethodId}`);
    return response.data;
  },

  async setDefaultPaymentMethod(tenantId: number, paymentMethodId: string): Promise<PaymentMethod> {
    const response = await api.post(`/tenants/${tenantId}/payment-methods/${paymentMethodId}/set-default`);
    return response.data;
  }
}; 