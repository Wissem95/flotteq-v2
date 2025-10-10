import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../../entities/user.entity';
import { SubscriptionLimitGuard, CheckLimit } from '../../common/guards/subscription-limit.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @UseGuards(SubscriptionLimitGuard)
  @CheckLimit('users')
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() currentUser: User) {
    return this.usersService.create(createUserDto, currentUser);
  }

  @Post('invite')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async invite(
    @Body() inviteUserDto: InviteUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<{ invitationLink: string; token: string }> {
    return this.usersService.generateInvitation(inviteUserDto, currentUser);
  }

  @Get()
  findAll(@CurrentUser() currentUser: User) {
    return this.usersService.findAll(currentUser.tenantId, currentUser);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  getStats(@CurrentUser() currentUser: User) {
    return this.usersService.getUserStats(currentUser.tenantId);
  }

  @Get('me')
  getProfile(@CurrentUser() currentUser: User) {
    return currentUser;
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.usersService.findOne(id, currentUser);
  }

  @Patch('me')
  updateProfile(@Body() updateUserDto: UpdateUserDto, @CurrentUser() currentUser: User) {
    return this.usersService.update(currentUser.id, updateUserDto, currentUser);
  }

  @Patch('me/password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: User,
  ) {
    // Vérifier l'ancien mot de passe
    const user = await this.usersService.findByEmail(currentUser.email, currentUser.tenantId);

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    const isValid = await user.validatePassword(changePasswordDto.currentPassword);

    if (!isValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    // Mettre à jour avec le nouveau
    return this.usersService.update(
      currentUser.id,
      { password: changePasswordDto.newPassword } as any,
      currentUser,
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.update(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.usersService.remove(id, currentUser);
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async deactivate(@Param('id') id: string, @CurrentUser() currentUser: User): Promise<User> {
    return this.usersService.deactivate(id, currentUser);
  }

  @Patch(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async activate(@Param('id') id: string, @CurrentUser() currentUser: User): Promise<User> {
    return this.usersService.activate(id, currentUser);
  }
}
