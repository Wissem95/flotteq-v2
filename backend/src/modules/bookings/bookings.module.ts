import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from '../../entities/booking.entity';
import { Partner } from '../../entities/partner.entity';
import { PartnerService } from '../../entities/partner-service.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Partner, PartnerService, Vehicle]),
    NotificationsModule,
    AuditModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
