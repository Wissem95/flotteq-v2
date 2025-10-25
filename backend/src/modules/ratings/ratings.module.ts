import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { Rating } from '../../entities/rating.entity';
import { Booking } from '../../entities/booking.entity';
import { Partner } from '../../entities/partner.entity';
import { Tenant } from '../../entities/tenant.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rating, Booking, Partner, Tenant]),
    AuditModule,
  ],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
