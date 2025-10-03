export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  maxVehicles: number;
  maxUsers: number;
  maxDrivers: number;
  features: string[];
  isActive: boolean;
  trialDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: number;
  tenantId: number;
  planId: number;
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  startDate?: string;
  endDate?: string;
  trialEndDate?: string;
  cancelledAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  plan?: SubscriptionPlan;
  tenant?: {
    id: number;
    name: string; // Changed from companyName to name
  };
}

export interface SubscriptionStats {
  totalActive: number;
  totalTrialing: number;
  totalCancelled: number;
  totalRevenue: number;
  mrr: number;
  churnRate: number;
  arpu: number;
}

export interface CreatePlanDto {
  name: string;
  price: number;
  maxVehicles: number;
  maxUsers: number;
  maxDrivers: number;
  features: string[];
  isActive: boolean;
  trialDays: number;
}

export interface UpdatePlanDto {
  name?: string;
  price?: number;
  maxVehicles?: number;
  maxUsers?: number;
  maxDrivers?: number;
  features?: string[];
  isActive?: boolean;
  trialDays?: number;
}
