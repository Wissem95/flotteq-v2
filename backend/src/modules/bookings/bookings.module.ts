import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsPaymentService } from './bookings-payment.service';
import { Booking } from '../../entities/booking.entity';
import { Partner } from '../../entities/partner.entity';
import { PartnerService } from '../../entities/partner-service.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Commission } from '../../entities/commission.entity';
import { Rating } from '../../entities/rating.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { CommissionsModule } from '../commissions/commissions.module';
import { StripeModule } from '../../stripe/stripe.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Partner, PartnerService, Vehicle, Commission, Rating]),
    NotificationsModule,
    AuditModule,
    StripeModule,
    forwardRef(() => CommissionsModule),
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsPaymentService],
  exports: [BookingsService, BookingsPaymentService],
})
export class BookingsModule {}
