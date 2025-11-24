import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaintenanceType } from '../entities/maintenance.entity';

export class CreateMaintenanceTemplateDto {
  @ApiProperty({ description: 'Template name', example: 'Vidange standard' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of maintenance',
    enum: MaintenanceType,
  })
  @IsNotEmpty()
  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @ApiProperty({ description: 'Description template' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Estimated cost', example: 150.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  estimatedCost: number;

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
}
