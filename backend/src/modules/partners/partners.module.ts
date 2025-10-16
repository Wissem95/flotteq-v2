import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Partner } from '../../entities/partner.entity';
import { PartnerUser } from '../../entities/partner-user.entity';
import { PartnerService } from '../../entities/partner-service.entity';
import { PartnersService } from './partners.service';
import { PartnerAuthService } from './partner-auth.service';
import { PartnersController } from './partners.controller';
import { PartnerAuthController } from './partner-auth.controller';
import { PartnerJwtStrategy } from './auth/strategies/partner-jwt.strategy';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partner, PartnerUser, PartnerService]),
    PassportModule.register({ defaultStrategy: 'partner-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_PARTNER_SECRET'),
        signOptions: {
          expiresIn: configService.get('PARTNER_TOKEN_EXPIRY') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
    NotificationsModule,
    AuditModule,
  ],
  controllers: [PartnersController, PartnerAuthController],
  providers: [PartnersService, PartnerAuthService, PartnerJwtStrategy],
  exports: [PartnersService, PartnerAuthService],
})
export class PartnersModule {}
