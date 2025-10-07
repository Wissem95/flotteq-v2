import { ApiProperty } from '@nestjs/swagger';

export class MaintenanceCostByTypeDto {
  @ApiProperty({ description: 'Type de maintenance' })
  type: string;

  @ApiProperty({ description: 'Coût total pour ce type' })
  totalCost: number;

  @ApiProperty({ description: 'Nombre de maintenances de ce type' })
  count: number;
}

export class VehicleCostAnalysisDto {
  @ApiProperty({ format: 'uuid', description: 'ID du véhicule' })
  vehicleId: string;

  @ApiProperty({ description: 'Prix d\'achat du véhicule' })
  purchasePrice: number;

  @ApiProperty({ description: 'Coût total des maintenances' })
  totalMaintenanceCost: number;

  @ApiProperty({ description: 'Nombre total de maintenances complétées' })
  totalMaintenanceCount: number;

  @ApiProperty({ description: 'Coût moyen par maintenance' })
  averageMaintenanceCost: number;

  @ApiProperty({ description: 'Coût total de possession (achat + maintenances)' })
  totalOwnershipCost: number;

  @ApiProperty({
    type: [MaintenanceCostByTypeDto],
    description: 'Répartition des coûts par type de maintenance',
  })
  costsByType: MaintenanceCostByTypeDto[];

  @ApiProperty({
    description: 'Coût par kilomètre (coût total / km parcourus)',
    required: false,
  })
  costPerKm?: number;
}
