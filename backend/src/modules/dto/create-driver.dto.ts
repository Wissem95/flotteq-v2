import { IsNotEmpty, IsString, IsEmail, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { DriverStatus } from '../../entities/driver.entity';

export class CreateDriverDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  licenseNumber: string;

  @IsDateString()
  licenseExpiryDate: string;

  @IsOptional()
  @IsDateString()
  medicalCertificateExpiryDate?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}