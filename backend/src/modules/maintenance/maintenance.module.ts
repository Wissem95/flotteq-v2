import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceTemplateService } from './maintenance-template.service';
import { MaintenanceNotificationService } from './maintenance-notification.service';
import { Maintenance } from './entities/maintenance.entity';
import { MaintenanceTemplate } from './entities/maintenance-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Maintenance, MaintenanceTemplate])],
  controllers: [MaintenanceController],
  providers: [MaintenanceService, MaintenanceTemplateService, MaintenanceNotificationService],
  exports: [MaintenanceService, MaintenanceTemplateService],
})
export class MaintenanceModule {}
