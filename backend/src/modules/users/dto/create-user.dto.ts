import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsNumber()
  tenantId?: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
