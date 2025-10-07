import { IsOptional, IsString, IsEnum, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaintenanceType } from '../entities/maintenance.entity';

export class UpdateMaintenanceTemplateDto {
  @ApiProperty({ description: 'Template name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Type of maintenance', enum: MaintenanceType, required: false })
  @IsOptional()
  @IsEnum(MaintenanceType)
  type?: MaintenanceType;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Estimated cost', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCost?: number;

  @ApiProperty({ description: 'Estimated duration in days', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedDurationDays?: number;

  @ApiProperty({ description: 'Recommended km interval', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  kmInterval?: number;

  @ApiProperty({ description: 'Active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
