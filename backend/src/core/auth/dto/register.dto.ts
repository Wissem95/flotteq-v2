import { IsEmail, IsString, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  @ApiProperty({
    example: 'Password123',
    description: 'User password (min 8 chars, must contain uppercase, lowercase and number)'
  })
  password: string;

  @IsString()
  @ApiProperty({ example: 'John', description: 'User first name' })
  firstName: string;

  @IsString()
  @ApiProperty({ example: 'Doe', description: 'User last name' })
  lastName: string;

  @IsString()
  @ApiProperty({ example: 'My Company', description: 'Company name' })
  companyName: string;

  @IsString()
  @ApiProperty({ example: 'price_123456789', description: 'Stripe plan ID' })
  planId: string;
}