export enum DriverStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  ON_LEAVE = 'on_leave',
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate: Date;
  medicalCertificateExpiryDate?: Date;
  birthDate?: Date;
  status: DriverStatus;
  address?: string;
  city?: string;
  postalCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  tenantId: number;
  tenant?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateDriverDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  medicalCertificateExpiryDate?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  tenantId: number;
}

export interface UpdateDriverDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  licenseExpiryDate?: string;
  medicalCertificateExpiryDate?: string;
  status?: DriverStatus;
  address?: string;
  city?: string;
  postalCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
}

export interface DriversListResponse {
  data: Driver[];
  total: number;
  page: number;
  limit: number;
}

export interface DriversQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: DriverStatus;
  tenantId?: number;
}
