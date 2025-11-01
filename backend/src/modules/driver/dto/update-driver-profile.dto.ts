import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsPhoneNumber, IsDateString } from 'class-validator';

export class UpdateDriverProfileDto {
  @ApiPropertyOptional({ example: 'Jean' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Dupont' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '+33612345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '123 Rue de la Paix' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Paris' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: '75001' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({ example: 'Marie Dupont' })
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @ApiPropertyOptional({ example: '+33698765432' })
  @IsString()
  @IsOptional()
  emergencyPhone?: string;

  @ApiPropertyOptional({ example: '1990-01-15' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;
}
