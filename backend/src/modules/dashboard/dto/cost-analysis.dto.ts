export class MonthlyMaintenanceCost {
  month: string;
  cost: number;
  count: number;
}

export class MaintenanceCostByType {
  type: string;
  cost: number;
  count: number;
}

export class CostAnalysisDto {
  totalMaintenanceCost: number;
  totalFleetPurchaseValue: number;
  avgMaintenanceCostPerVehicle: number;
  monthlyMaintenanceCosts: MonthlyMaintenanceCost[];
  costsByType: MaintenanceCostByType[];
  lastMonthTotal: number;
  currentMonthTotal: number;
}
