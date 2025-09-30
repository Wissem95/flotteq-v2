import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceNotificationService } from './maintenance-notification.service';
import { Maintenance } from './entities/maintenance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Maintenance])],
  controllers: [MaintenanceController],
  providers: [MaintenanceService, MaintenanceNotificationService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
