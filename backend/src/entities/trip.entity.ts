import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Vehicle } from './vehicle.entity';
import { Driver } from './driver.entity';
import { Tenant } from './tenant.entity';

export enum TripStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface VehicleDefect {
  id: string;
  type: 'scratch' | 'dent' | 'broken' | 'dirty' | 'missing' | 'other';
  location: string;
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  photos: string[];
}

export interface Location {
  lat: number;
  lng: number;
}

@Entity('trips')
@Index(['vehicleId'])
@Index(['driverId'])
@Index(['tenantId'])
@Index(['status'])
@Index(['startedAt'])
export class Trip {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'driver_id', type: 'uuid' })
  driverId: string;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ApiProperty({ type: 'number' })
  @Column({ name: 'tenant_id', type: 'int' })
  tenantId: number;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ApiProperty({ enum: TripStatus, example: TripStatus.IN_PROGRESS })
  @Column({
    type: 'enum',
    enum: TripStatus,
    default: TripStatus.IN_PROGRESS,
  })
  status: TripStatus;

  // ===== ÉTAT DES LIEUX DÉPART =====
  @ApiProperty({ example: 102823, description: 'Kilométrage au départ' })
  @Column({ type: 'int', name: 'start_km' })
  startKm: number;

  @ApiProperty({ example: 75, description: 'Niveau carburant départ (0-100%)' })
  @Column({ type: 'int', name: 'start_fuel_level' })
  startFuelLevel: number;

  @ApiPropertyOptional({ type: [String], description: 'URLs photos état départ' })
  @Column({ type: 'simple-array', nullable: true, name: 'start_photos' })
  startPhotos: string[] | null;

  @ApiPropertyOptional({ example: 'RAS', description: 'Notes état départ' })
  @Column({ type: 'text', nullable: true, name: 'start_notes' })
  startNotes: string | null;

  @ApiPropertyOptional({ type: Array, description: 'Liste défauts constatés départ' })
  @Column({ type: 'jsonb', nullable: true, name: 'start_defects' })
  startDefects: VehicleDefect[] | null;

  @ApiProperty({ description: 'Date/heure départ' })
  @Column({ type: 'timestamp', name: 'started_at' })
  startedAt: Date;

  @ApiPropertyOptional({ type: Object, description: 'Géolocalisation départ' })
  @Column({ type: 'jsonb', nullable: true, name: 'start_location' })
  startLocation: Location | null;

  // ===== ÉTAT DES LIEUX RETOUR =====
  @ApiPropertyOptional({ example: 103150, description: 'Kilométrage au retour' })
  @Column({ type: 'int', nullable: true, name: 'end_km' })
  endKm: number | null;

  @ApiPropertyOptional({ example: 45, description: 'Niveau carburant retour (0-100%)' })
  @Column({ type: 'int', nullable: true, name: 'end_fuel_level' })
  endFuelLevel: number | null;

  @ApiPropertyOptional({ type: [String], description: 'URLs photos état retour' })
  @Column({ type: 'simple-array', nullable: true, name: 'end_photos' })
  endPhotos: string[] | null;

  @ApiPropertyOptional({ example: 'Nouveau défaut constaté', description: 'Notes état retour' })
  @Column({ type: 'text', nullable: true, name: 'end_notes' })
  endNotes: string | null;

  @ApiPropertyOptional({ type: Array, description: 'Liste défauts constatés retour' })
  @Column({ type: 'jsonb', nullable: true, name: 'end_defects' })
  endDefects: VehicleDefect[] | null;

  @ApiPropertyOptional({ description: 'Date/heure retour' })
  @Column({ type: 'timestamp', nullable: true, name: 'ended_at' })
  endedAt: Date | null;

  @ApiPropertyOptional({ type: Object, description: 'Géolocalisation retour' })
  @Column({ type: 'jsonb', nullable: true, name: 'end_location' })
  endLocation: Location | null;

  // ===== DONNÉES CALCULÉES =====
  @ApiPropertyOptional({ example: 327, description: 'Distance parcourue en km' })
  @Column({ type: 'int', nullable: true, name: 'distance_km' })
  distanceKm: number | null;

  @ApiPropertyOptional({ example: 180, description: 'Durée en minutes' })
  @Column({ type: 'int', nullable: true, name: 'duration_minutes' })
  durationMinutes: number | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ===== MÉTHODES HELPER =====
  canBeEnded(): boolean {
    return this.status === TripStatus.IN_PROGRESS;
  }

  canBeCancelled(): boolean {
    return this.status === TripStatus.IN_PROGRESS;
  }

  isInProgress(): boolean {
    return this.status === TripStatus.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this.status === TripStatus.COMPLETED;
  }

  getNewDefects(): VehicleDefect[] {
    if (!this.endDefects || !this.startDefects) return this.endDefects || [];

    const startDefectIds = new Set(this.startDefects.map(d => d.id));
    return this.endDefects.filter(d => !startDefectIds.has(d.id));
  }
}
