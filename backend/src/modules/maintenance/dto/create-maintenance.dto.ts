import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaintenanceType } from '../entities/maintenance.entity';

export class CreateMaintenanceDto {
  @ApiProperty({ description: 'Vehicle ID' })
  @IsNotEmpty()
  @IsString()
  vehicleId: string;

  @ApiProperty({
    description: 'Type of maintenance',
    enum: MaintenanceType,
  })
  @IsNotEmpty()
  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @ApiProperty({ description: 'Maintenance description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Scheduled date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ description: 'Estimated cost', example: 150.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  estimatedCost: number;

  @ApiProperty({
    description: 'Actual cost (optional, for completed maintenance)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualCost?: number;

  @ApiProperty({ description: 'Garage or mechanic name', required: false })
  @IsOptional()
  @IsString()
  performedBy?: string;

  @ApiProperty({ description: 'Next maintenance at this km', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  nextMaintenanceKm?: number;
}
