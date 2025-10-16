import { ApiProperty } from '@nestjs/swagger';

export class VehicleTCODto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vehicleId: string;

  @ApiProperty({ example: 25000, description: 'Prix d\'achat du véhicule' })
  purchasePrice: number;

  @ApiProperty({ example: 18000, description: 'Valeur actuelle estimée' })
  currentValue: number;

  @ApiProperty({ example: 2500, description: 'Coûts totaux de maintenance' })
  totalMaintenanceCosts: number;

  @ApiProperty({ example: 3200, description: 'Coûts estimés de carburant' })
  estimatedFuelCosts: number;

  @ApiProperty({ example: 12700, description: 'Coût Total de Possession (TCO)' })
  totalTCO: number;

  @ApiProperty({ example: 45000, description: 'Kilom\u00e8tres parcourus' })
  kmTraveled: number;

  @ApiProperty({ example: 0.28, description: 'TCO par kilom\u00e8tre' })
  tcoPerKm: number;
}
