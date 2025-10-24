export enum PartnerType {
  GARAGE = 'garage',
  CT_CENTER = 'ct_center',
  INSURANCE = 'insurance',
  PARTS_SUPPLIER = 'parts_supplier',
}

export enum PartnerStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export interface Partner {
  id: string;
  companyName: string;
  type: PartnerType;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  commissionRate: number;
  stripeAccountId?: string;
  stripeOnboardingCompleted: boolean;
  description: string | null;
  siretNumber: string;
  insuranceDocument: string | null;
  rating: number;
  totalReviews: number;
  status: PartnerStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PartnerService {
  id: string;
  partnerId: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnersListResponse {
  data: Partner[];
  total: number;
  page: number;
  limit: number;
}

export interface GetPartnersParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: PartnerType;
  status?: PartnerStatus;
  city?: string;
}

export interface UpdateCommissionRateDto {
  commissionRate: number;
}

export interface RejectPartnerDto {
  reason?: string;
}

export interface SuspendPartnerDto {
  reason?: string;
}

export interface CreatePartnerDto {
  companyName: string;
  type: PartnerType;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  siretNumber: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerFirstName: string;
  ownerLastName: string;
}

export interface UpdatePartnerDto {
  companyName?: string;
  type?: PartnerType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  siretNumber?: string;
}
