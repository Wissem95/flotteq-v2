import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PartnerUser } from '../../entities/partner-user.entity';
import { Partner, PartnerStatus } from '../../entities/partner.entity';
import { PartnerLoginDto } from './dto/partner-login.dto';
import { EmailQueueService } from '../notifications/email-queue.service';

@Injectable()
export class PartnerAuthService {
  private readonly logger = new Logger(PartnerAuthService.name);

  constructor(
    @InjectRepository(PartnerUser)
    private partnerUserRepository: Repository<PartnerUser>,
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailQueueService: EmailQueueService,
  ) {}

  async login(loginDto: PartnerLoginDto) {
    const { email, password } = loginDto;

    // Find partner user with password field
    const partnerUser = await this.partnerUserRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'firstName',
        'lastName',
        'role',
        'isActive',
        'partnerId',
      ],
    });

    if (!partnerUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await partnerUser.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!partnerUser.isActive) {
      throw new UnauthorizedException('Your account is inactive');
    }

    // Check partner status
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerUser.partnerId },
    });

    if (!partner) {
      throw new UnauthorizedException('Partner not found');
    }

    if (partner.status !== PartnerStatus.APPROVED) {
      throw new UnauthorizedException(
        'Your partner account is pending approval. Please wait for admin approval.',
      );
    }

    // Update last login
    await this.partnerUserRepository.update(partnerUser.id, {
      lastLoginAt: new Date(),
    });

    // Generate JWT token
    const payload = {
      sub: partnerUser.id,
      email: partnerUser.email,
      partnerId: partnerUser.partnerId,
      role: partnerUser.role,
      type: 'partner',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_PARTNER_SECRET'),
      expiresIn: this.configService.get('PARTNER_TOKEN_EXPIRY') || '7d',
    });

    this.logger.log(`Partner user ${partnerUser.email} logged in successfully`);

    return {
      accessToken,
      partnerUser: {
        id: partnerUser.id,
        email: partnerUser.email,
        firstName: partnerUser.firstName,
        lastName: partnerUser.lastName,
        role: partnerUser.role,
        partnerId: partnerUser.partnerId,
      },
      partner: {
        id: partner.id,
        companyName: partner.companyName,
        type: partner.type,
        status: partner.status,
      },
    };
  }

  async validatePartner(partnerUserId: string): Promise<PartnerUser | null> {
    const partnerUser = await this.partnerUserRepository.findOne({
      where: { id: partnerUserId },
      relations: ['partner'],
    });

    if (!partnerUser || !partnerUser.isActive) {
      return null;
    }

    // Check if partner is approved
    if (
      partnerUser.partner &&
      partnerUser.partner.status !== PartnerStatus.APPROVED
    ) {
      return null;
    }

    return partnerUser;
  }

  async getProfile(partnerUserId: string) {
    const partnerUser = await this.partnerUserRepository.findOne({
      where: { id: partnerUserId },
      relations: ['partner'],
    });

    if (!partnerUser) {
      throw new UnauthorizedException('Partner user not found');
    }

    return {
      id: partnerUser.id,
      email: partnerUser.email,
      firstName: partnerUser.firstName,
      lastName: partnerUser.lastName,
      role: partnerUser.role,
      isActive: partnerUser.isActive,
      partnerId: partnerUser.partnerId,
      partner: {
        id: partnerUser.partner.id,
        companyName: partnerUser.partner.companyName,
        type: partnerUser.partner.type,
        email: partnerUser.partner.email,
        phone: partnerUser.partner.phone,
        address: partnerUser.partner.address,
        city: partnerUser.partner.city,
        postalCode: partnerUser.partner.postalCode,
        status: partnerUser.partner.status,
        rating: partnerUser.partner.rating,
        totalReviews: partnerUser.partner.totalReviews,
      },
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const partnerUser = await this.partnerUserRepository.findOne({
      where: { email },
    });

    if (!partnerUser) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return {
        message:
          'Si cet email existe, un lien de réinitialisation a été envoyé.',
      };
    }

    // Générer token JWT avec expiration 1h
    const resetToken = this.jwtService.sign(
      { userId: partnerUser.id, type: 'partner-reset-password' },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '1h',
      },
    );

    // Construire l'URL frontend partenaire
    const partnerFrontendUrl =
      this.configService.get('PARTNER_FRONTEND_URL') ||
      'https://partner.flotteq.fr';
    const resetUrl = `${partnerFrontendUrl}/reset-password?token=${resetToken}`;

    // Envoyer email via la queue
    await this.emailQueueService.queuePasswordResetEmail(
      partnerUser.email,
      partnerUser.firstName,
      resetUrl,
    );

    this.logger.log(
      `Password reset link queued for partner user ${partnerUser.email}`,
    );

    return {
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
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

      if (payload.type !== 'partner-reset-password') {
        throw new BadRequestException('Token invalide');
      }

      // Récupérer l'utilisateur partenaire
      const partnerUser = await this.partnerUserRepository.findOne({
        where: { id: payload.userId },
      });

      if (!partnerUser) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Hasher le nouveau mot de passe (bcrypt rounds=12, identique à auth.service)
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Mettre à jour le mot de passe sans déclencher BeforeUpdate (déjà hashé)
      partnerUser.password = hashedPassword;
      await this.partnerUserRepository.save(partnerUser);

      this.logger.log(
        `Password successfully reset for partner user ${partnerUser.email}`,
      );

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
}
