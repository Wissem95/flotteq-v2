import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { Driver } from '../entities/driver.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { DashboardModule } from './dashboard/dashboard.module';
import { TenantsModule } from './tenants/tenants.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, Vehicle]), DashboardModule, TenantsModule, SubscriptionsModule],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
