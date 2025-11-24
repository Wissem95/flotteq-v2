import {
  IsObject,
  IsOptional,
  ValidateNested,
  IsString,
  IsNumber,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OnboardingProfileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  companyAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  companyCity: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  companyPostalCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  companyCountry: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  fleetSize: number;
}

class OnboardingVehicleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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
