import { IsNotEmpty, IsString, IsInt, IsEnum, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleStatus } from '../../../entities/vehicle.entity';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Vehicle registration number' })
  @IsNotEmpty()
  @IsString()
  registration: string;

  @ApiProperty({ description: 'Vehicle brand' })
  @IsNotEmpty()
  @IsString()
  brand: string;

  @ApiProperty({ description: 'Vehicle model' })
  @IsNotEmpty()
  @IsString()
  model: string;

  @ApiProperty({ description: 'Vehicle year' })
  @IsNotEmpty()
  @IsInt()
  @Min(1900)
  year: number;

  @ApiProperty({ description: 'Vehicle VIN' })
  @IsNotEmpty()
  @IsString()
  vin: string;

  @ApiProperty({ description: 'Vehicle color' })
  @IsNotEmpty()
  @IsString()
  color: string;

  @ApiProperty({ description: 'Purchase date', required: false })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiProperty({ description: 'Purchase price', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

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
}