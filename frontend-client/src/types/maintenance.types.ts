export const MaintenanceType = {
  PREVENTIVE: 'preventive',
  CORRECTIVE: 'corrective',
  INSPECTION: 'inspection',
  TIRE_CHANGE: 'tire_change',
  OIL_CHANGE: 'oil_change',
} as const;

export type MaintenanceType = typeof MaintenanceType[keyof typeof MaintenanceType];

export const MaintenanceStatus = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type MaintenanceStatus = typeof MaintenanceStatus[keyof typeof MaintenanceStatus];

export interface Maintenance {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  scheduledDate: string;
  completedDate: string | null;
  status: MaintenanceStatus;
  estimatedCost: number;
  actualCost: number | null;
  performedBy: string | null;
  nextMaintenanceKm: number | null;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
  vehicle?: {
    id: string;
    registration: string;
    brand: string;
    model: string;
  };
}

export interface MaintenanceTemplate {
  id: string;
  name: string;
  type: MaintenanceType;
  description: string;
  estimatedCost: number;
  estimatedDurationDays: number | null;
  kmInterval: number | null;
  isActive: boolean;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceAlert {
  maintenanceId: string;
  vehicleRegistration: string;
  type: string;
  scheduledDate: string;
  daysUntil: number;
  alertReason: string;
}

export interface MaintenanceCostSummary {
  vehicleId: string;
  totalCost: number;
  maintenanceCount: number;
  averageCost: number;
}

export interface CreateMaintenanceDto {
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  scheduledDate: string;
  estimatedCost: number;
  actualCost?: number;
  performedBy?: string;
  nextMaintenanceKm?: number;
}

export interface UpdateMaintenanceDto {
  type?: MaintenanceType;
  description?: string;
  scheduledDate?: string;
  completedDate?: string;
  status?: MaintenanceStatus;
  estimatedCost?: number;
  actualCost?: number;
  performedBy?: string;
  nextMaintenanceKm?: number;
}

export interface CreateMaintenanceTemplateDto {
  name: string;
  type: MaintenanceType;
  description: string;
  estimatedCost: number;
  estimatedDurationDays?: number;
  kmInterval?: number;
}

export interface CreateMaintenanceFromTemplateDto {
  vehicleId: string;
  scheduledDate: string;
  estimatedCost?: number;
  performedBy?: string;
  nextMaintenanceKm?: number;
}
