import { IsOptional, IsEnum, IsString, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaintenanceType, MaintenanceStatus } from '../entities/maintenance.entity';

export class UpdateMaintenanceDto {
  @ApiProperty({ description: 'Type of maintenance', enum: MaintenanceType, required: false })
  @IsOptional()
  @IsEnum(MaintenanceType)
  type?: MaintenanceType;

  @ApiProperty({ description: 'Maintenance description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Scheduled date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiProperty({ description: 'Completed date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @ApiProperty({ description: 'Status', enum: MaintenanceStatus, required: false })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiProperty({ description: 'Cost', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

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