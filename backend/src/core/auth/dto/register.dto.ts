import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const CUSTOMER_TYPES = ['consumer', 'professional'] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export class RegisterDto {
  @IsEmail()
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  @ApiProperty({
    example: 'Password123',
    description:
      'User password (min 8 chars, must contain uppercase, lowercase and number)',
  })
  password: string;

  @IsString()
  @ApiProperty({ example: 'John', description: 'User first name' })
  firstName: string;

  @IsString()
  @ApiProperty({ example: 'Doe', description: 'User last name' })
  lastName: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'My Company', description: 'Company name' })
  companyName?: string;

  @IsIn(CUSTOMER_TYPES)
  @ApiProperty({
    example: 'professional',
    enum: CUSTOMER_TYPES,
    description: 'Registration profile',
  })
  customerType: CustomerType;

  @IsBoolean()
  @ApiProperty({ example: true, description: 'CGU and CGV acceptance' })
  acceptedTerms: boolean;

  @IsBoolean()
  @ApiProperty({ example: true, description: 'Privacy policy acknowledgement' })
  acceptedPrivacyPolicy: boolean;

  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Express consumer request for immediate service access',
  })
  immediateServiceRequested: boolean;

  @IsString()
  @ApiProperty({ example: 'price_123456789', description: 'Stripe plan ID' })
  planId: string;
}
