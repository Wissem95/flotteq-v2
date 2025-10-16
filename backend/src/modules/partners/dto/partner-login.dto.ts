import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PartnerLoginDto {
  @ApiProperty({ example: 'john.doe@garagemartin.fr' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
