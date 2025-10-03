import { apiClient } from '../httpClient';

// ========== TYPES (DTOs) ==========

export interface InternalStatsDto {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  cancelledTenants: number;
  totalVehicles: number;
  totalDrivers: number;
  totalUsers: number;
  mrr: number;
  arr: number;
  churnRate: number;
  averageRevenuePerTenant: number;
}

export interface InternalRevenueDto {
  mrr: number;
  arr: number;
  revenueByPlan: Array<{
    plan: string;
    count: number;
    revenue: number;
  }>;
  revenueEvolution: Array<{
    month: string;
    mrr: number;
    newMrr: number;
    churnedMrr: number;
  }>;
}

export interface InternalSubscriptionsDto {
  planDistribution: Array<{
    plan: string;
    count: number;
    percentage: number;
  }>;
  activeSubscriptions: number;
  trialSubscriptions: number;
  cancelledThisMonth: number;
  upgradedThisMonth: number;
}

export interface ActivityLogDto {
  id: string;
  type: 'TENANT_CREATED' | 'PLAN_CHANGED' | 'SUBSCRIPTION_CANCELLED' | 'PAYMENT_SUCCEEDED' | 'PAYMENT_FAILED';
  tenantId: number;
  tenantName: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface RecentTenantDto {
  id: number;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  plan: {
    name: string;
    price: number;
  };
  vehiclesCount: number;
  usersCount: number;
  daysActive: number;
}

// ========== API ENDPOINTS ==========

export const dashboardApi = {
  // Internal endpoints (Admin FlotteQ)
  getInternalStats: () =>
    apiClient.get<InternalStatsDto>('/dashboard/internal/stats'),

  getInternalRevenue: () =>
    apiClient.get<InternalRevenueDto>('/dashboard/internal/revenue'),

  getInternalSubscriptions: () =>
    apiClient.get<InternalSubscriptionsDto>('/dashboard/internal/subscriptions'),

  getInternalActivity: () =>
    apiClient.get<ActivityLogDto[]>('/dashboard/internal/activity'),

  getRecentTenants: (limit = 5) =>
    apiClient.get<RecentTenantDto[]>(`/dashboard/internal/tenants/recent?limit=${limit}`),
};
