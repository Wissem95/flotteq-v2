import { ApiProperty } from '@nestjs/swagger';

export class MonthlyStatDto {
  @ApiProperty({ example: '2025-01' })
  month: string;

  @ApiProperty({ example: 'Jan 2025' })
  monthLabel: string;

  @ApiProperty({ example: 15 })
  tripCount: number;

  @ApiProperty({ example: 1250 })
  totalKm: number;

  @ApiProperty({ example: 25 })
  avgFuelConsumption: number;
}

export class MonthlyStatsResponseDto {
  @ApiProperty({ type: [MonthlyStatDto] })
  data: MonthlyStatDto[];
}
