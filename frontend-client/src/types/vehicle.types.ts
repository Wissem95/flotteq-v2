export const VehicleStatus = {
  AVAILABLE: 'available',
  IN_USE: 'in_use',
  MAINTENANCE: 'maintenance',
  OUT_OF_SERVICE: 'out_of_service',
} as const;

export type VehicleStatus = typeof VehicleStatus[keyof typeof VehicleStatus];

export interface Vehicle {
  id: string;
  registration: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  color: string;
  purchaseDate: string;
  purchasePrice: number;
  initialMileage: number | null;
  currentKm: number;
  status: VehicleStatus;
  photos: string[] | null;
  assignedDriverId: string | null;
  assignedDriver?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  tenantId: number;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFilters {
  page?: number;
  limit?: number;
  status?: VehicleStatus;
  brand?: string;
  model?: string;
  registration?: string;
  assignedDriverId?: string;
}

export interface VehicleListResponse {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
}

export interface VehicleStatusCount {
  status: string;
  count: number;
}

export interface VehicleStats {
  total: number;
  byStatus: VehicleStatusCount[];
  averageMileage: number;
  needingMaintenance: number;
}

export interface TimelineItem {
  type: 'maintenance' | 'document' | 'assignment' | 'creation';
  date: string;
  description: string;
  metadata?: any;
}

export interface VehicleTimeline {
  vehicleId: string;
  items: TimelineItem[];
  totalEvents: number;
}

export interface MaintenanceCostByType {
  type: string;
  totalCost: number;
  count: number;
}

export interface VehicleCostAnalysis {
  vehicleId: string;
  purchasePrice: number;
  totalMaintenanceCost: number;
  totalMaintenanceCount: number;
  averageMaintenanceCost: number;
  totalOwnershipCost: number;
  costsByType: MaintenanceCostByType[];
  costPerKm?: number;
}

export interface CreateVehicleData {
  registration: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  color: string;
  purchaseDate?: string;
  purchasePrice?: number;
  initialMileage?: number;
  currentKm?: number;
  status?: VehicleStatus;
}

export interface UpdateVehicleData extends Partial<CreateVehicleData> {
  assignedDriverId?: string;
}
