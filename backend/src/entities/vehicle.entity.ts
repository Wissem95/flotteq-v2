import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Driver } from './driver.entity';

export enum VehicleStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  registration: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int', nullable: true, name: 'initial_mileage' })
  initialMileage: number | null;

  @Column({ type: 'int', default: 0, name: 'current_km' })
  currentKm: number;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
  })
  status: VehicleStatus;

  @Column({ unique: true })
  vin: string;

  @Column()
  color: string;

  @Column({ type: 'date' })
  purchaseDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchasePrice: number;

  @Column({ type: String, name: 'assigned_driver_id', nullable: true })
  assignedDriverId: string | null;

  @ManyToOne(() => Driver, driver => driver.vehicles, { nullable: true })
  @JoinColumn({ name: 'assigned_driver_id' })
  assignedDriver: Driver;

  @Column({ name: 'tenant_id' })
  tenantId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}