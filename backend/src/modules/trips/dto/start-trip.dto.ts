import { IsNotEmpty, IsInt, Min, Max, IsArray, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleDefect, Location } from '../../../entities/trip.entity';

export class StartTripDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;

  @ApiProperty({ example: 102823 })
  @IsInt()
  @Min(0)
  startKm: number;

  @ApiProperty({ example: 75, description: '0-100%' })
  @IsInt()
  @Min(0)
  @Max(100)
  startFuelLevel: number;

  @ApiProperty({ type: [String], description: 'URLs photos' })
  @IsArray()
  @IsString({ each: true })
  startPhotos: string[];

  @ApiPropertyOptional({ type: Array })
  @IsOptional()
  @IsArray()
  startDefects?: VehicleDefect[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  startLocation?: Location;
}
