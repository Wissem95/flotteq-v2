import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PartnerUser } from '../../entities/partner-user.entity';
import { Partner, PartnerStatus } from '../../entities/partner.entity';
import { PartnerLoginDto } from './dto/partner-login.dto';

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
  ) {}

  async login(loginDto: PartnerLoginDto) {
    const { email, password } = loginDto;

    // Find partner user with password field
    const partnerUser = await this.partnerUserRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'isActive', 'partnerId'],
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
    if (partnerUser.partner && partnerUser.partner.status !== PartnerStatus.APPROVED) {
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
}
