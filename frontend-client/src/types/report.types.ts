// Using const assertions instead of enums for erasableSyntaxOnly compatibility
export const ReportType = {
  MECHANICAL: 'mechanical',
  ACCIDENT: 'accident',
  DAMAGE: 'damage',
  CLEANING: 'cleaning',
  OTHER: 'other',
} as const;

export type ReportType = typeof ReportType[keyof typeof ReportType];

export const ReportStatus = {
  OPEN: 'open',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
} as const;

export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];

export interface Report {
  id: string;
  vehicleId: string;
  vehicleRegistration?: string;
  driverId: string;
  driverName?: string;
  type: ReportType;
  description: string;
  notes: string | null;
  status: ReportStatus;
  photos: string[] | null;
  acknowledgedAt: Date | null;
  acknowledgedBy: string | null;
  acknowledgedByName: string | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  resolvedByName: string | null;
  resolutionNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportDto {
  type: ReportType;
  description: string;
  notes?: string;
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  [ReportType.MECHANICAL]: 'Problème mécanique',
  [ReportType.ACCIDENT]: 'Accident',
  [ReportType.DAMAGE]: 'Dommage',
  [ReportType.CLEANING]: 'Nettoyage',
  [ReportType.OTHER]: 'Autre',
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  [ReportStatus.OPEN]: 'En attente',
  [ReportStatus.ACKNOWLEDGED]: 'Pris en compte',
  [ReportStatus.RESOLVED]: 'Résolu',
};

export const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
  [ReportStatus.OPEN]: 'bg-yellow-100 text-yellow-800',
  [ReportStatus.ACKNOWLEDGED]: 'bg-blue-100 text-blue-800',
  [ReportStatus.RESOLVED]: 'bg-green-100 text-green-800',
};
