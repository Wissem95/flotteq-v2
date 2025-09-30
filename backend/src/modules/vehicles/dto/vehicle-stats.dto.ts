import { ApiProperty } from '@nestjs/swagger';

export class VehicleStatusCount {
  @ApiProperty()
  status: string;

  @ApiProperty()
  count: number;
}

export class VehicleStatsDto {
  @ApiProperty({ description: 'Nombre total de véhicules' })
  total: number;

  @ApiProperty({
    description: 'Répartition par statut',
    type: [VehicleStatusCount],
  })
  byStatus: VehicleStatusCount[];

  @ApiProperty({ description: 'Kilométrage moyen de la flotte' })
  averageMileage: number;

  @ApiProperty({ description: 'Véhicules nécessitant une maintenance (> 10000km)' })
  needingMaintenance: number;
}