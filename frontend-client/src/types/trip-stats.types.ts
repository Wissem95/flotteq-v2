export interface MonthlyStats {
  month: string; // "2025-01"
  monthLabel: string; // "Jan 2025"
  tripCount: number;
  totalKm: number;
  avgFuelConsumption: number;
}

export interface MonthlyStatsResponse {
  data: MonthlyStats[];
}

export interface DriverPerformance {
  driverId: string;
  driverName: string;
  tripCount: number;
  totalKm: number;
  avgKmPerTrip: number;
  totalDefects: number;
}

export interface DriversPerformanceResponse {
  data: DriverPerformance[];
}
