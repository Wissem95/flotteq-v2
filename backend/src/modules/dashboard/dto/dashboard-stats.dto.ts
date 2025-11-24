import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ example: 25, description: 'Total number of vehicles' })
  totalVehicles: number;

  @ApiProperty({
    example: 20,
    description: 'Number of active/available vehicles',
  })
  activeVehicles: number;

  @ApiProperty({ example: 15, description: 'Total number of drivers' })
  totalDrivers: number;

  @ApiProperty({ example: 12, description: 'Number of active drivers' })
  activeDrivers: number;

  @ApiProperty({ example: 5, description: 'Number of upcoming maintenances' })
  upcomingMaintenances: number;

  @ApiProperty({ example: 2, description: 'Number of overdue maintenances' })
  overdueMaintenances: number;
}
