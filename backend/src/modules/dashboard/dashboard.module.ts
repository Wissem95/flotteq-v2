import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Vehicle } from '../../entities/vehicle.entity';
import { Driver } from '../../entities/driver.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Driver, Maintenance])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
