export class DriverStatsDto {
  totalActive: number;
  totalInactive: number;
  totalSuspended: number;
  totalOnLeave: number;
  total: number;
  driversWithExpiringSoon: number; // License expiring within 30 days
  driversWithVehicles: number;
  driversWithoutVehicles: number;
}
