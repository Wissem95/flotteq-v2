export class FleetStatusDto {
  available: number;
  inUse: number;
  maintenance: number;
  outOfService: number;
  total: number;
  utilizationRate: number; // Percentage of vehicles in use
}
