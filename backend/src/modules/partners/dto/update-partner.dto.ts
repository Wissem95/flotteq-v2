import {
  IsOptional,
  IsString,
  IsEmail,
  IsNumber,
  Min,
  Max,
  Length,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePartnerDto {
  @ApiPropertyOptional({ example: 'Garage Martin' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: '+33612345678' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiPropertyOptional({ example: '15 Rue de la République' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Paris' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: '75001' })
  @IsOptional()
  @IsString()
  @Length(5, 5, { message: 'Postal code must be exactly 5 digits' })
  @Matches(/^\d{5}$/, { message: 'Postal code must contain only digits' })
  postalCode?: string;

  @ApiPropertyOptional({ example: 48.8566 })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 2.3522 })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;

  @ApiPropertyOptional({
    example: 'Spécialiste réparation véhicules utilitaires',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'path/to/insurance.pdf' })
  @IsOptional()
  @IsString()
  insuranceDocument?: string;
}
