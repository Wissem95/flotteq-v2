import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilitiesController } from './availabilities.controller';
import { AvailabilitiesService } from './availabilities.service';
import { Availability } from '../../entities/availability.entity';
import { Unavailability } from '../../entities/unavailability.entity';
import { Partner } from '../../entities/partner.entity';
import { Booking } from '../../entities/booking.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Availability, Unavailability, Partner, Booking]),
    AuditModule,
  ],
  controllers: [AvailabilitiesController],
  providers: [AvailabilitiesService],
  exports: [AvailabilitiesService],
})
export class AvailabilitiesModule {}
