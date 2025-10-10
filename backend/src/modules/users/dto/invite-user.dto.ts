import { IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
}
