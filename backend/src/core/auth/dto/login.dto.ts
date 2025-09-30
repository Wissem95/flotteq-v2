import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'Password123', description: 'User password' })
  password: string;
}