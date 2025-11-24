import { ApiProperty } from '@nestjs/swagger';

export class UsagePercentageDto {
  @ApiProperty({
    example: 75.5,
    description: 'Percentage of vehicles used vs plan limit',
  })
  vehicles: number;

  @ApiProperty({
    example: 60.0,
    description: 'Percentage of drivers used vs plan limit',
  })
  drivers: number;

  @ApiProperty({
    example: 45.2,
    description: 'Percentage of storage used vs plan limit',
  })
  storage: number;
}

export class SubscriptionUsageDto {
  @ApiProperty({
    example: 'Professional',
    description: 'Current subscription plan name',
  })
  planName: string;

  @ApiProperty({ example: 50, description: 'Maximum vehicles allowed by plan' })
  maxVehicles: number;

  @ApiProperty({ example: 38, description: 'Current number of vehicles' })
  currentVehicles: number;

  @ApiProperty({ example: 30, description: 'Maximum drivers allowed by plan' })
  maxDrivers: number;

  @ApiProperty({ example: 18, description: 'Current number of drivers' })
  currentDrivers: number;

  @ApiProperty({ example: 5120, description: 'Storage used in MB' })
  storageUsedMB: number;

  @ApiProperty({ example: 10240, description: 'Storage quota in MB' })
  storageQuotaMB: number;

  @ApiProperty({
    type: UsagePercentageDto,
    description: 'Usage percentages for each resource',
  })
  usagePercentage: UsagePercentageDto;
}
