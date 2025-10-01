export interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  status: TenantStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: string; // ISO date string
  subscriptionStartedAt?: string;
  subscriptionEndedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relations (optionnelles selon le endpoint)
  users?: Array<{ id: number; email: string; role: string }>;
  vehicles?: Array<{ id: number; registration: string }>;
  drivers?: Array<{ id: number; firstName: string; lastName: string }>;
}

export type TenantStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'incomplete';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'incomplete';

export interface CreateTenantDto {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface UpdateTenantDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  status?: TenantStatus;
}

export interface TenantStats {
  usersCount: number;
  vehiclesCount: number;
  driversCount: number;
  activeVehicles: number;
  maintenancesCount: number;
}

export interface TenantsListResponse {
  data: Tenant[];
  total: number;
  page: number;
  limit: number;
}
