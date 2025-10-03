export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  phone?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  registration: string;
  brand: string;
  model: string;
  year: number;
  status: string;
  vin: string;
  color: string;
  currentKm: number;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface Subscription {
  id: string;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialEnd?: string;
  plan: SubscriptionPlan;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  maxVehicles: number;
  maxUsers: number;
  maxDrivers: number;
  features: string[];
}

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
  planId?: number;
  // Relations (optionnelles selon le endpoint)
  users?: User[];
  vehicles?: Vehicle[];
  drivers?: Driver[];
  subscription?: Subscription;
  plan?: SubscriptionPlan;
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
