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
import { InviteUserDto } from './dto/invite-user.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { EmailQueueService } from '../notifications/email-queue.service';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private subscriptionsService: SubscriptionsService,
    private emailQueueService: EmailQueueService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser: User): Promise<User> {
    // Vérifier les permissions (utiliser vérification directe du rôle)
    const canManage = [UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN].includes(currentUser.role);
    if (!canManage) {
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

    // Envoyer email de bienvenue (asynchrone)
    try {
      // Récupérer le tenant pour avoir son nom
      const userWithTenant = await this.usersRepository.findOne({
        where: { id: savedUser.id },
        relations: ['tenant'],
      });

      if (userWithTenant?.tenant) {
        await this.emailQueueService.queueWelcomeEmail(
          savedUser.email,
          savedUser.firstName,
          userWithTenant.tenant.name,
        );
      }
    } catch (error) {
      // Log l'erreur mais ne pas bloquer la création de l'utilisateur
      console.error('Failed to queue welcome email:', error);
    }

    return savedUser;
  }

  async findAll(tenantId: number, currentUser: User): Promise<User[]> {
    // Super admin voit tous les users
    const canViewAll = [UserRole.SUPER_ADMIN, UserRole.SUPPORT].includes(currentUser.role);

    if (canViewAll) {
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

    // Vérifier les permissions (utiliser vérification directe du rôle)
    const canViewAll = [UserRole.SUPER_ADMIN, UserRole.SUPPORT].includes(currentUser.role);
    if (!canViewAll && user.tenantId !== currentUser.tenantId) {
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

    // Vérifier les permissions de modification (utiliser vérification directe du rôle)
    const canManage = [UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN].includes(currentUser.role);
    if (!canManage && user.id !== currentUser.id) {
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

    // Vérifier les permissions (utiliser vérification directe du rôle)
    const canManage = [UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN].includes(currentUser.role);
    if (!canManage) {
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

  async deactivate(id: string, currentUser: User): Promise<User> {
    // Prevent self-deactivation
    if (id === currentUser.id) {
      throw new BadRequestException('Vous ne pouvez pas désactiver votre propre compte');
    }

    const user = await this.usersRepository.findOne({
      where: { id, tenantId: currentUser.tenantId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // A tenant_admin cannot deactivate a super_admin
    if (currentUser.role === UserRole.TENANT_ADMIN && user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Vous ne pouvez pas désactiver un super administrateur');
    }

    user.isActive = false;
    return await this.usersRepository.save(user);
  }

  async activate(id: string, currentUser: User): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Verify tenant access
    const canViewAll = [UserRole.SUPER_ADMIN, UserRole.SUPPORT].includes(currentUser.role);
    if (!canViewAll && user.tenantId !== currentUser.tenantId) {
      throw new ForbiddenException('Accès non autorisé');
    }

    user.isActive = true;
    return await this.usersRepository.save(user);
  }

  async generateInvitation(
    inviteUserDto: InviteUserDto,
    currentUser: User,
  ): Promise<{ invitationLink: string; token: string }> {
    const { email, role } = inviteUserDto;

    // Verify permissions (utiliser vérification directe du rôle)
    const canManage = [UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN].includes(currentUser.role);
    if (!canManage) {
      throw new ForbiddenException('Vous n\'avez pas le droit d\'inviter des utilisateurs');
    }

    // Limit roles that tenant_admin can assign
    if (currentUser.role === UserRole.TENANT_ADMIN) {
      const allowedRoles = [UserRole.MANAGER, UserRole.DRIVER, UserRole.VIEWER];
      if (!allowedRoles.includes(role)) {
        throw new ForbiddenException('Vous ne pouvez pas assigner ce rôle');
      }
    }

    // Check if email already exists for this tenant
    const existingUser = await this.usersRepository.findOne({
      where: { email, tenantId: currentUser.tenantId },
    });

    // Option A: Refuser si user déjà actif avec password
    if (existingUser && existingUser.isActive && existingUser.password) {
      throw new ConflictException(
        'Cet utilisateur est déjà actif. Utilisez la fonction "Réinitialiser le mot de passe" si nécessaire.'
      );
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // Expires in 48 hours

    let user: User;

    if (existingUser && !existingUser.isActive) {
      // Réutiliser le user inactif existant (ré-invitation)
      existingUser.invitationToken = token;
      existingUser.invitationExpiresAt = expiresAt;
      existingUser.role = role; // Mettre à jour le rôle si changé
      user = await this.usersRepository.save(existingUser);
    } else {
      // Create "ghost" user with invitation
      user = this.usersRepository.create({
        email,
        role,
        tenantId: currentUser.tenantId,
        isActive: false,
        invitationToken: token,
        invitationExpiresAt: expiresAt,
        firstName: '',
        lastName: '',
        password: randomBytes(32).toString('hex'), // Temporary password, will be set on acceptance
      });
      await this.usersRepository.save(user);
    }

    // Build invitation link - différent selon le rôle (client vs internal)
    const isInternalRole = ['super_admin', 'support'].includes(role);
    const frontendUrl = isInternalRole
      ? (process.env.FRONTEND_INTERNAL_URL || 'http://localhost:5175')
      : (process.env.FRONTEND_CLIENT_URL || 'http://localhost:5174');

    const invitationLink = `${frontendUrl}/accept-invitation?token=${token}`;

    return { invitationLink, token };
  }
}
