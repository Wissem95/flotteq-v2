import {
  IsInt,
  Min,
  Max,
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleDefect, Location } from '../../../entities/trip.entity';

export class EndTripDto {
  @ApiProperty({ example: 103150 })
  @IsInt()
  @Min(0)
  endKm: number;

  @ApiProperty({ example: 45 })
  @IsInt()
  @Min(0)
  @Max(100)
  endFuelLevel: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  endPhotos: string[];

  @ApiPropertyOptional({ type: Array })
  @IsOptional()
  @IsArray()
  endDefects?: VehicleDefect[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  endLocation?: Location;
}
