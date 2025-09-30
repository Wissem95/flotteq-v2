export class MaintenanceStatsDto {
  totalCompleted: number;
  totalScheduled: number;
  totalInProgress: number;
  totalCancelled: number;
  avgCost: number;
  totalCost: number;
  mostCommonType: string;
  avgDaysToComplete: number;
}