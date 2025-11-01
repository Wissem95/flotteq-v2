import { ApiProperty } from '@nestjs/swagger';

export class DriverPerformanceDto {
  @ApiProperty()
  driverId: string;

  @ApiProperty()
  driverName: string;

  @ApiProperty()
  tripCount: number;

  @ApiProperty()
  totalKm: number;

  @ApiProperty()
  avgKmPerTrip: number;

  @ApiProperty()
  totalDefects: number;
}

export class DriversPerformanceResponseDto {
  @ApiProperty({ type: [DriverPerformanceDto] })
  data: DriverPerformanceDto[];
}
