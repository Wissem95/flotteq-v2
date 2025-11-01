import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from '../../entities/trip.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Driver } from '../../entities/driver.entity';
import { MileageHistory } from '../../entities/mileage-history.entity';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, Vehicle, Driver, MileageHistory]),
    ReportsModule,
  ],
  providers: [TripsService],
  controllers: [TripsController],
  exports: [TripsService],
})
export class TripsModule {}
