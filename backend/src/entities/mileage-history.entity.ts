import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { Tenant } from './tenant.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum MileageSource {
  MANUAL = 'manual',
  MAINTENANCE = 'maintenance',
  INSPECTION = 'inspection',
}

@Entity('mileage_history')
@Index(['vehicleId', 'recordedAt'])
export class MileageHistory {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'vehicle_id' })
  vehicleId: string;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ApiProperty({ example: 45000 })
  @Column({ type: 'int' })
  mileage: number;

  @ApiProperty({ example: 42000 })
  @Column({ type: 'int', nullable: true, name: 'previous_mileage' })
  previousMileage: number | null;

  @ApiProperty({ example: 3000 })
  @Column({ type: 'int', default: 0 })
  difference: number;

  @ApiProperty({ enum: MileageSource, example: 'manual' })
  @Column({
    type: 'enum',
    enum: MileageSource,
    default: MileageSource.MANUAL,
  })
  source: MileageSource;

  @ApiProperty({ example: 'Relevé lors de la maintenance' })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty()
  @Column({ name: 'tenant_id' })
  tenantId: number;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ApiProperty()
  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;
}
