import { IsNotEmpty, IsString, IsUUID, IsDateString, IsOptional, Matches, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ format: 'uuid', description: 'Partner ID' })
  @IsNotEmpty()
  @IsUUID()
  partnerId: string;

  @ApiProperty({ format: 'uuid', description: 'Vehicle ID' })
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Driver ID (optional)' })
  @IsOptional()
  @IsUUID()
  driverId?: string;

  @ApiProperty({ format: 'uuid', description: 'Partner Service ID' })
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: '2025-10-20', description: 'Scheduled date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ example: '14:00', description: 'Scheduled time (HH:mm)' })
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'scheduledTime must be in HH:mm format (e.g., 14:00)',
  })
  scheduledTime: string;

  @ApiProperty({ example: '16:00', description: 'End time (HH:mm)' })
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format (e.g., 16:00)',
  })
  endTime: string;

  @ApiPropertyOptional({ example: 'Please check the brakes too' })
  @IsOptional()
  @IsString()
  customerNotes?: string;
}
