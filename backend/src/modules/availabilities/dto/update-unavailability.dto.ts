import { IsNotEmpty, IsString, IsDateString, IsBoolean, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUnavailabilityDto {
  @ApiProperty({ example: '2025-10-20', description: 'Date of unavailability (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Holiday', description: 'Reason for unavailability' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({ example: true, description: 'Is full day unavailable?' })
  @IsNotEmpty()
  @IsBoolean()
  isFullDay: boolean;

  @ApiPropertyOptional({ example: '09:00', description: 'Start time if partial unavailability (HH:mm)' })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format (e.g., 09:00)',
  })
  startTime?: string;

  @ApiPropertyOptional({ example: '12:00', description: 'End time if partial unavailability (HH:mm)' })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format (e.g., 12:00)',
  })
  endTime?: string;
}
