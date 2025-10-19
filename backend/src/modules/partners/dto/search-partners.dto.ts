import {
  IsOptional,
  IsNumber,
  IsEnum,
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsDecimal,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PartnerType } from '../../../entities/partner.entity';

export class SearchPartnersDto {
  @ApiProperty({ example: 48.8566, description: 'Latitude du point de recherche' })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ example: 2.3522, description: 'Longitude du point de recherche' })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @ApiProperty({ example: 10, description: 'Rayon de recherche en kilomètres', default: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(100)
  radius: number = 10;

  @ApiPropertyOptional({ enum: PartnerType, example: 'garage' })
  @IsOptional()
  @IsEnum(PartnerType)
  type?: PartnerType;

  @ApiPropertyOptional({ example: 'vidange', description: 'Type de service recherché' })
  @IsOptional()
  @IsString()
  serviceType?: string;

  @ApiPropertyOptional({ example: '2025-10-15', description: 'Date souhaitée (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 0, description: 'Prix minimum en EUR' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional({ example: 100, description: 'Prix maximum en EUR' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;

  @ApiPropertyOptional({ example: 4.0, description: 'Note minimum (0-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
