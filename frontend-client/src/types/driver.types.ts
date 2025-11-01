export const DriverStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  ON_LEAVE: 'on_leave',
} as const;

export type DriverStatus = typeof DriverStatus[keyof typeof DriverStatus];

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  medicalCertificateExpiryDate?: string;
  birthDate?: string;
  status: DriverStatus;
  address?: string;
  city?: string;
  postalCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  profilePhotoUrl?: string | null;
  profilePhotoThumbnail?: string | null;
  tenantId: number;
  vehicles?: {
    id: string;
    registration: string;
    brand: string;
    model: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface DriverFilters {
  page?: number;
  limit?: number;
  status?: DriverStatus;
  search?: string;
}

export interface DriverListResponse {
  data: Driver[];
  total: number;
  page: number;
  limit: number;
}

export interface DriverStats {
  totalActive: number;
  totalInactive: number;
  totalSuspended: number;
  totalOnLeave: number;
  total: number;
  driversWithExpiringSoon: number;
  driversWithVehicles: number;
  driversWithoutVehicles: number;
}

export interface CreateDriverData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  medicalCertificateExpiryDate?: string;
  birthDate?: string;
  status?: DriverStatus;
  address?: string;
  city?: string;
  postalCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
}

export interface UpdateDriverData extends Partial<CreateDriverData> {}

export interface AssignVehicleData {
  vehicleId: string;
}
