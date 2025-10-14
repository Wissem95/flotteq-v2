import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../../entities/user.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { Subscription, SubscriptionStatus } from '../../../entities/subscription.entity';
import { SubscriptionPlan } from '../../../entities/subscription-plan.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { EmailQueueService } from '../../../modules/notifications/email-queue.service';
import { StripeService } from '../../../stripe/stripe.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailQueueService: EmailQueueService,
    private stripeService: StripeService,
    private dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Valider planId AVANT toute création en base
    const planId = parseInt(dto.planId, 10);
    if (isNaN(planId)) {
      throw new BadRequestException(`Invalid plan ID: ${dto.planId}. Must be a number.`);
    }

    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id: planId },
    });

    if (!plan) {
      throw new BadRequestException(`Invalid plan ID: ${planId}. Plan not found.`);
    }

    // 2. Valider companyName
    if (!dto.companyName) {
      throw new BadRequestException('Company name is required for registration');
    }

    // 3. Vérifier si email existe déjà
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 4. Transaction atomique : Tenant + User + Subscription ensemble
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 4a. Créer tenant
      const tenant = queryRunner.manager.create(Tenant, {
        name: dto.companyName,
        email: dto.email,
      });
      await queryRunner.manager.save(tenant);

      // 4a-bis. Créer Stripe customer
      try {
        const stripeCustomerId = await this.stripeService.createCustomer(tenant, dto.email);
        tenant.stripeCustomerId = stripeCustomerId;
        await queryRunner.manager.save(tenant);
      } catch (stripeError) {
        // Log l'erreur mais ne pas bloquer l'inscription si Stripe échoue
        console.error('Failed to create Stripe customer:', stripeError.message);
      }

      // 4b. Créer user
      const hashedPassword = await bcrypt.hash(dto.password, 12);
      const user = queryRunner.manager.create(User, {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        tenantId: tenant.id,
        role: UserRole.TENANT_ADMIN,
      });
      await queryRunner.manager.save(user);

      // 4c. Créer subscription
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const subscription = queryRunner.manager.create(Subscription, {
        tenantId: tenant.id,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd: endDate,
        usage: {
          vehicles: 0,
          users: 0,
          drivers: 0,
        },
      });
      await queryRunner.manager.save(subscription);

      // 5. COMMIT (tout ou rien)
      await queryRunner.commitTransaction();

      // 6. Générer tokens
      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user.id, tokens.refresh_token);

      // 7. Retourner résultat sans données sensibles
      const { password, refreshToken, ...userWithoutSensitive } = user;
      return { user: userWithoutSensitive, ...tokens };

    } catch (error) {
      // 8. ROLLBACK en cas d'erreur
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      select: [
        'id',
        'email',
        'password',
        'firstName',
        'lastName',
        'tenantId',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    const { password, ...userWithoutSensitive } = user;

    return { user: userWithoutSensitive, ...tokens };
  }

  async logout(userId: string) {
    // Cast explicite pour gérer le null avec TypeORM
    await this.userRepository.update(userId, {
      refreshToken: null as any
    });
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'tenantId', 'refreshToken'],
    });

    // Vérifier null explicitement
    if (!user || user.refreshToken === null || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const rtMatches = await bcrypt.compare(rt, user.refreshToken);

    if (!rtMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  private async generateTokens(user: Partial<User>) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES', '7d'),
      }),
    ]);

    return { access_token, refresh_token };
  }

  private async updateRefreshToken(userId: string, rt: string) {
    const hashedRefreshToken = await bcrypt.hash(rt, 10);
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async validateUser(userId: string) {
    return this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'tenantId', 'role', 'isActive', 'firstName', 'lastName'],
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['tenant'],
    });

    if (!user) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return {
        message:
          "Si cet email existe, un lien de réinitialisation a été envoyé.",
      };
    }

    // Générer token JWT avec expiration 1h
    const resetToken = this.jwtService.sign(
      { userId: user.id, type: 'reset-password' },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '1h',
      },
    );

    // Envoyer email avec lien
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    await this.emailQueueService.queuePasswordResetEmail(
      user.email,
      user.firstName,
      resetUrl,
    );

    return {
      message:
        "Si cet email existe, un lien de réinitialisation a été envoyé.",
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      // Vérifier et décoder le token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      if (payload.type !== 'reset-password') {
        throw new BadRequestException('Token invalide');
      }

      // Récupérer l'utilisateur
      const user = await this.userRepository.findOne({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Mettre à jour le mot de passe
      user.password = hashedPassword;
      await this.userRepository.save(user);

      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException(
          'Le lien a expiré. Veuillez demander un nouveau lien.',
        );
      }
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Token invalide');
      }
      throw error;
    }
  }

  async acceptInvitation(dto: { token: string; password: string; firstName: string; lastName: string }) {
    const user = await this.userRepository.findOne({
      where: { invitationToken: dto.token },
    });

    if (!user || !user.invitationExpiresAt || user.invitationExpiresAt < new Date()) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Activer et mettre à jour
    user.password = hashedPassword;
    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.isActive = true;
    user.invitationToken = null;
    user.invitationExpiresAt = null;

    await this.userRepository.save(user);

    return { message: 'Compte activé avec succès' };
  }

  async verifyInvitation(token: string): Promise<{ email: string; role: string }> {
    const user = await this.userRepository.findOne({
      where: { invitationToken: token },
    });

    if (!user || !user.invitationExpiresAt || user.invitationExpiresAt < new Date()) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    return {
      email: user.email,
      role: user.role,
    };
  }
}