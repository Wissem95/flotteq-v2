import { IsNotEmpty, IsDateString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AvailableSlotsQueryDto {
  @ApiProperty({ example: '2025-10-20', description: 'Date to check availability (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ example: 30, description: 'Service duration in minutes', minimum: 5 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(5, { message: 'Minimum duration is 5 minutes' })
  duration: number;

  @ApiPropertyOptional({ example: 24, description: 'Minimum advance notice in hours (default: 24)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  advanceNoticeHours?: number;
}
