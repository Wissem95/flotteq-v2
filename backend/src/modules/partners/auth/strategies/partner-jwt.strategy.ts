import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PartnerAuthService } from '../../partner-auth.service';

@Injectable()
export class PartnerJwtStrategy extends PassportStrategy(
  Strategy,
  'partner-jwt',
) {
  constructor(
    private configService: ConfigService,
    private partnerAuthService: PartnerAuthService,
  ) {
    const secret = configService.get<string>('JWT_PARTNER_SECRET');
    if (!secret) {
      throw new Error(
        'JWT_PARTNER_SECRET is not defined in environment variables',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    // Validate that the token is for a partner (not a tenant user)
    if (payload.type !== 'partner') {
      throw new UnauthorizedException('Invalid token type');
    }

    const partnerUser = await this.partnerAuthService.validatePartner(
      payload.sub,
    );

    if (!partnerUser) {
      throw new UnauthorizedException('Partner user not found or inactive');
    }

    return {
      id: partnerUser.id,
      partnerUserId: partnerUser.id,
      partnerId: partnerUser.partnerId,
      email: partnerUser.email,
      role: partnerUser.role,
      type: 'partner',
    };
  }
}
