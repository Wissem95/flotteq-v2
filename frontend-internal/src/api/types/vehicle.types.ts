export enum VehicleStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
}

export enum TransmissionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
}

export enum FuelType {
  GASOLINE = 'gasoline',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
}

export interface Vehicle {
  id: string;
  registration: string;
  brand: string;
  model: string;
  year: number;
  vin?: string;
  color?: string;
  transmission: TransmissionType;
  fuelType: FuelType;
  initialMileage: number;
  currentKm: number;
  status: VehicleStatus;
  purchaseDate?: Date;
  purchasePrice?: number;
  lastTechnicalInspection?: Date;
  nextTechnicalInspection?: Date;
  photos?: string[];
  assignedDriverId?: string;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateVehicleDto {
  registration: string;
  brand: string;
  model: string;
  year: number;
  vin?: string;
  color?: string;
  transmission: TransmissionType;
  fuelType: FuelType;
  initialMileage: number;
  purchaseDate?: string;
  purchasePrice?: number;
  tenantId: number;
}

export interface UpdateVehicleDto {
  registration?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  currentKm?: number;
  status?: VehicleStatus;
  lastTechnicalInspection?: string;
  nextTechnicalInspection?: string;
  assignedDriverId?: string | null;
}

export interface VehiclesListResponse {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
}

export interface VehiclesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: VehicleStatus;
  tenantId?: number;
}
