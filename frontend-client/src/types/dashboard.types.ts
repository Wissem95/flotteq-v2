export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  upcomingMaintenances: number;
  overdueMaintenances: number;
}

export type AlertType = 'license_expiring' | 'medical_certificate_expiring' | 'maintenance_due' | 'vehicle_maintenance_overdue';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  entityId: string;
  entityType: 'driver' | 'vehicle' | 'maintenance';
  dueDate?: string;
  daysUntilDue?: number;
}

export interface MonthlyMaintenanceCost {
  month: string;
  cost: number;
  count: number;
}

export interface MaintenanceCostByType {
  type: string;
  cost: number;
  count: number;
}

export interface CostAnalysis {
  totalMaintenanceCost: number;
  totalFleetPurchaseValue: number;
  avgMaintenanceCostPerVehicle: number;
  monthlyMaintenanceCosts: MonthlyMaintenanceCost[];
  costsByType: MaintenanceCostByType[];
  lastMonthTotal: number;
  currentMonthTotal: number;
}

export interface SubscriptionUsage {
  planName: string;
  maxVehicles: number;
  currentVehicles: number;
  maxDrivers: number;
  currentDrivers: number;
  storageUsedMB: number;
  storageQuotaMB: number;
  usagePercentage: {
    vehicles: number;
    drivers: number;
    storage: number;
  };
}
