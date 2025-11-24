import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerType } from '../../../entities/partner.entity';

export class CreatePartnerDto {
  @ApiProperty({ example: 'Garage Martin' })
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @ApiProperty({ enum: PartnerType, example: 'garage' })
  @IsNotEmpty()
  @IsEnum(PartnerType)
  type: PartnerType;

  @ApiProperty({ example: 'contact@garagemartin.fr' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+33612345678' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phone: string;

  @ApiProperty({ example: '15 Rue de la République' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: 'Paris' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: '75001' })
  @IsNotEmpty()
  @IsString()
  @Length(5, 5, { message: 'Postal code must be exactly 5 digits' })
  @Matches(/^\d{5}$/, { message: 'Postal code must contain only digits' })
  postalCode: string;

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

  @ApiPropertyOptional({
    example: 'Spécialiste réparation véhicules utilitaires',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '12345678901234' })
  @IsNotEmpty()
  @IsString()
  @Length(14, 14, { message: 'SIRET number must be exactly 14 digits' })
  @Matches(/^\d{14}$/, { message: 'SIRET number must contain only digits' })
  siretNumber: string;

  // Owner user fields
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  ownerFirstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  ownerLastName: string;

  @ApiProperty({ example: 'john.doe@garagemartin.fr' })
  @IsNotEmpty()
  @IsEmail()
  ownerEmail: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsNotEmpty()
  @IsString()
  @Length(8, 50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  ownerPassword: string;
}
