import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from '../../entities/vehicle.entity';
import { Document } from '../../entities/document.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Document, Maintenance])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
