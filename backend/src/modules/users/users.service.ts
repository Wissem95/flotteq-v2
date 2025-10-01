import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser: User): Promise<User> {
    // Vérifier les permissions
    if (!currentUser.canManageUsers()) {
      throw new ForbiddenException('Vous n\'avez pas le droit de créer des utilisateurs');
    }

    // Si c'est un tenant_admin, il ne peut créer que pour son tenant
    const tenantId = currentUser.role === UserRole.SUPER_ADMIN && createUserDto.tenantId
      ? createUserDto.tenantId
      : currentUser.tenantId;

    // Vérifier la limite du plan pour les users (sauf super_admin)
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      await this.subscriptionsService.enforceLimit(tenantId, 'users');
    }

    // Vérifier que l'email n'existe pas déjà pour ce tenant
    const existing = await this.usersRepository.findOne({
      where: { email: createUserDto.email, tenantId },
    });

    if (existing) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Limiter les rôles qu'un tenant_admin peut assigner
    if (currentUser.role === UserRole.TENANT_ADMIN) {
      const allowedRoles = [UserRole.MANAGER, UserRole.DRIVER, UserRole.VIEWER];
      if (!allowedRoles.includes(createUserDto.role)) {
        throw new ForbiddenException('Vous ne pouvez pas assigner ce rôle');
      }
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      tenantId,
    });

    const savedUser = await this.usersRepository.save(user);

    // Incrémenter l'usage
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      await this.subscriptionsService.updateUsage(tenantId, 'users', 1);
    }

    return savedUser;
  }

  async findAll(tenantId: number, currentUser: User): Promise<User[]> {
    // Super admin voit tous les users
    if (currentUser.canViewAllData()) {
      return this.usersRepository.find({
        order: { createdAt: 'DESC' },
        relations: ['tenant'],
      });
    }

    // Les autres ne voient que les users de leur tenant
    return this.usersRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, currentUser: User): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['tenant'],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur #${id} non trouvé`);
    }

    // Vérifier les permissions
    if (!currentUser.canViewAllData() && user.tenantId !== currentUser.tenantId) {
      throw new ForbiddenException('Accès non autorisé');
    }

    return user;
  }

  async findByEmail(email: string, tenantId: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email, tenantId },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'tenantId', 'isActive'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: User): Promise<User> {
    const user = await this.findOne(id, currentUser);

    // Vérifier les permissions de modification
    if (!currentUser.canManageUsers() && user.id !== currentUser.id) {
      throw new ForbiddenException('Vous ne pouvez modifier que votre propre profil');
    }

    // Un tenant_admin ne peut pas modifier un super_admin
    if (currentUser.role === UserRole.TENANT_ADMIN && user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Vous ne pouvez pas modifier un super administrateur');
    }

    // Empêcher la modification du tenantId et du rôle pour certains users
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      delete updateUserDto.tenantId;
      if (user.id === currentUser.id) {
        delete updateUserDto.role; // On ne peut pas changer son propre rôle
      }
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const user = await this.findOne(id, currentUser);

    // Vérifier les permissions
    if (!currentUser.canManageUsers()) {
      throw new ForbiddenException('Vous n\'avez pas le droit de supprimer des utilisateurs');
    }

    // On ne peut pas supprimer son propre compte
    if (user.id === currentUser.id) {
      throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte');
    }

    // Un tenant_admin ne peut pas supprimer un super_admin
    if (currentUser.role === UserRole.TENANT_ADMIN && user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer un super administrateur');
    }

    await this.usersRepository.delete(id);

    // Décrémenter l'usage
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      await this.subscriptionsService.updateUsage(user.tenantId, 'users', -1);
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  async getUserStats(tenantId: number) {
    const users = await this.usersRepository.find({
      where: { tenantId },
    });

    const stats = {
      total: users.length,
      byRole: {} as Record<string, number>,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
    };

    // Compter par rôle
    for (const role of Object.values(UserRole)) {
      stats.byRole[role] = users.filter(u => u.role === role).length;
    }

    return stats;
  }
}
