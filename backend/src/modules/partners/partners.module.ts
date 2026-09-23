import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Partner } from '../../entities/partner.entity';
import { PartnerUser } from '../../entities/partner-user.entity';
import { PartnerService } from '../../entities/partner-service.entity';
import { PartnerDocument } from '../../entities/partner-document.entity';
import { PartnersService } from './partners.service';
import { PartnerAuthService } from './partner-auth.service';
import { SearchService } from './search.service';
import { PartnersController } from './partners.controller';
import { PartnerAuthController } from './partner-auth.controller';
import { PartnerJwtStrategy } from './auth/strategies/partner-jwt.strategy';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { AvailabilitiesModule } from '../availabilities/availabilities.module';
import { SimpleCacheService } from '../../common/cache/simple-cache.service';
import { StripeModule } from '../../stripe/stripe.module';
import { DocumentsModule } from '../../documents/documents.module';
import { PartnerDocumentsController } from './partner-documents.controller';
import { PartnerDocumentsService } from './partner-documents.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Partner,
      PartnerUser,
      PartnerService,
      PartnerDocument,
    ]),
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
    AvailabilitiesModule,
    StripeModule,
    DocumentsModule,
  ],
  controllers: [
    PartnersController,
    PartnerAuthController,
    PartnerDocumentsController,
  ],
  providers: [
    PartnersService,
    PartnerAuthService,
    SearchService,
    PartnerJwtStrategy,
    SimpleCacheService,
    PartnerDocumentsService,
  ],
  exports: [PartnersService, PartnerAuthService],
})
export class PartnersModule {}
