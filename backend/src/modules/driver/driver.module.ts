import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverController } from './driver.controller';
import { DriversService } from '../drivers.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { DocumentsService } from '../../documents/documents.service';
import { ReportsModule } from '../reports/reports.module';
import { TripsModule } from '../trips/trips.module';
import { Driver } from '../../entities/driver.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Document } from '../../entities/document.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { MileageHistory } from '../../entities/mileage-history.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { Subscription } from '../../entities/subscription.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Tenant } from '../../entities/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Driver,
      Vehicle,
      Document,
      Maintenance,
      MileageHistory,
      Subscription,
      SubscriptionPlan,
      Tenant,
    ]),
    ReportsModule,
    TripsModule,
  ],
  controllers: [DriverController],
  providers: [
    DriversService,
    VehiclesService,
    DocumentsService,
    SubscriptionsService,
  ],
})
export class DriverModule {}
