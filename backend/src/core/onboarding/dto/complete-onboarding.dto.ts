import {
  IsObject,
  IsOptional,
  ValidateNested,
  IsString,
  IsNumber,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OnboardingProfileDto {
  @ApiProperty()
  @IsString()
  companyName: string;

  @ApiProperty()
  @IsString()
  companyAddress: string;

  @ApiProperty()
  @IsString()
  companyCity: string;

  @ApiProperty()
  @IsString()
  companyPostalCode: string;

  @ApiProperty()
  @IsString()
  companyCountry: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  fleetSize: number;
}

class OnboardingVehicleDto {
  @ApiProperty()
  @IsString()
  licensePlate: string;

  @ApiProperty()
  @IsString()
  brand: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  year: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vin?: string;
}

class OnboardingDriverDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  licenseNumber: string;
}

export class CompleteOnboardingDto {
  @ApiProperty({ type: OnboardingProfileDto })
  @IsObject()
  @ValidateNested()
  @Type(() => OnboardingProfileDto)
  profile: OnboardingProfileDto;

  @ApiPropertyOptional({ type: OnboardingVehicleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OnboardingVehicleDto)
  vehicle?: OnboardingVehicleDto;

  @ApiPropertyOptional({ type: OnboardingDriverDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OnboardingDriverDto)
  driver?: OnboardingDriverDto;
}
