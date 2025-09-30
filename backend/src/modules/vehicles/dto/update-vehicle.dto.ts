import { IsOptional, IsString, IsInt, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleStatus } from '../entities/vehicle.entity';

export class UpdateVehicleDto {
  @ApiProperty({ description: 'Vehicle registration number', required: false })
  @IsOptional()
  @IsString()
  registration?: string;

  @ApiProperty({ description: 'Vehicle brand', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Vehicle model', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: 'Vehicle year', required: false })
  @IsOptional()
  @IsInt()
  @Min(1900)
  year?: number;

  @ApiProperty({ description: 'Vehicle VIN', required: false })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiProperty({ description: 'Vehicle color', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Initial mileage at purchase (km)', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  initialMileage?: number;

  @ApiProperty({ description: 'Current kilometer reading', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentKm?: number;

  @ApiProperty({ description: 'Vehicle status', enum: VehicleStatus, required: false })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiProperty({ description: 'Purchase date', required: false })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiProperty({ description: 'Purchase price', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiProperty({ description: 'Assigned driver ID', required: false })
  @IsOptional()
  @IsString()
  assignedDriverId?: string;
}