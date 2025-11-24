export class InternalStatsDto {
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

export class InternalRevenueDto {
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

export class InternalSubscriptionsDto {
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

export class ActivityLogDto {
  id: string;
  type:
    | 'TENANT_CREATED'
    | 'PLAN_CHANGED'
    | 'SUBSCRIPTION_CANCELLED'
    | 'PAYMENT_SUCCEEDED'
    | 'PAYMENT_FAILED';
  tenantId: number;
  tenantName: string;
  description: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export class RecentTenantDto {
  id: number;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
  plan: {
    name: string;
    price: number;
  };
  vehiclesCount: number;
  usersCount: number;
  daysActive: number;
}
