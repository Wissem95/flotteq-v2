import { ApiProperty } from '@nestjs/swagger';

export class MaintenanceAlertDto {
  @ApiProperty({ description: 'Maintenance ID' })
  maintenanceId: string;

  @ApiProperty({ description: 'Vehicle registration' })
  vehicleRegistration: string;

  @ApiProperty({ description: 'Maintenance type' })
  type: string;

  @ApiProperty({ description: 'Scheduled date' })
  scheduledDate: Date;

  @ApiProperty({ description: 'Days until maintenance' })
  daysUntil: number;

  @ApiProperty({ description: 'Alert reason' })
  alertReason: string;
}

export class MaintenanceCostSummaryDto {
  @ApiProperty({ description: 'Vehicle ID' })
  vehicleId: string;

  @ApiProperty({ description: 'Total cost' })
  totalCost: number;

  @ApiProperty({ description: 'Number of maintenances' })
  maintenanceCount: number;

  @ApiProperty({ description: 'Average cost' })
  averageCost: number;
}
