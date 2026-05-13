import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PartnerForgotPasswordDto {
  @ApiProperty({ example: 'john.doe@garagemartin.fr' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
