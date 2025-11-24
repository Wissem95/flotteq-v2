import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMaintenanceFromTemplateDto {
  @ApiProperty({ description: 'Vehicle ID' })
  @IsNotEmpty()
  @IsString()
  vehicleId: string;

  @ApiProperty({ description: 'Scheduled date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ description: 'Override estimated cost', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCost?: number;

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
