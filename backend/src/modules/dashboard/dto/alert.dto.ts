export enum AlertType {
  LICENSE_EXPIRING = 'license_expiring',
  MEDICAL_CERTIFICATE_EXPIRING = 'medical_certificate_expiring',
  MAINTENANCE_DUE = 'maintenance_due',
  VEHICLE_MAINTENANCE_OVERDUE = 'vehicle_maintenance_overdue',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class AlertDto {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  entityId: string;
  entityType: 'driver' | 'vehicle' | 'maintenance';
  dueDate?: Date;
  daysUntilDue?: number;
}