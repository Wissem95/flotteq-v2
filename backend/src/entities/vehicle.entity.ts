import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Driver } from './driver.entity';
import { Tenant } from './tenant.entity';
import { Document, DocumentEntityType } from './document.entity';
import { Maintenance } from '../modules/maintenance/entities/maintenance.entity';

export enum VehicleStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
  SOLD = 'sold',
}

export enum TransmissionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
}

export enum FuelType {
  GASOLINE = 'gasoline',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
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

  @Column({ type: 'varchar', length: 20, nullable: true })
  transmission: TransmissionType | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'fuelType' })
  fuelType: FuelType | null;

  @Column({ type: 'int', default: 0 })
  mileage: number;

  @Column({ type: 'timestamp', nullable: true })
  purchaseDate: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchasePrice: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'current_value',
  })
  currentValue: number | null;

  @Column({ type: 'date', nullable: true, name: 'sold_date' })
  soldDate: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'lastTechnicalInspection',
  })
  lastTechnicalInspection: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'nextTechnicalInspection',
  })
  nextTechnicalInspection: Date | null;

  @Column({ type: 'simple-array', nullable: true })
  photos: string[] | null;

  @Column({ type: 'simple-array', nullable: true, name: 'photo_thumbnails' })
  photoThumbnails: string[] | null;

  @Column({ type: String, name: 'assigned_driver_id', nullable: true })
  assignedDriverId: string | null;

  @ManyToOne(() => Driver, (driver) => driver.vehicles, { nullable: true })
  @JoinColumn({ name: 'assigned_driver_id' })
  assignedDriver: Driver | null;

  @Column({ name: 'tenant_id' })
  tenantId: number;

  @ManyToOne(() => Tenant, (tenant) => tenant.vehicles)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => Document, (document) => document.entityId, {
    eager: false,
  })
  documents: Document[];

  @OneToMany(() => Maintenance, (maintenance) => maintenance.vehicle, {
    eager: false,
  })
  maintenances: Maintenance[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
