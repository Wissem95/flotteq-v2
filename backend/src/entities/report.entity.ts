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
import { User } from './user.entity';

export enum ReportType {
  MECHANICAL = 'mechanical',
  ACCIDENT = 'accident',
  DAMAGE = 'damage',
  CLEANING = 'cleaning',
  OTHER = 'other',
}

export enum ReportStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
}

@Entity('reports')
@Index(['vehicleId'])
@Index(['driverId'])
@Index(['tenantId'])
@Index(['status'])
@Index(['createdAt'])
export class Report {
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

  @ApiProperty({ enum: ReportType, example: ReportType.MECHANICAL })
  @Column({
    type: 'enum',
    enum: ReportType,
  })
  type: ReportType;

  @ApiProperty({ example: 'Strange noise from engine' })
  @Column({ type: 'text' })
  description: string;

  @ApiPropertyOptional({ example: 'Noticed while driving on highway' })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({ enum: ReportStatus, example: ReportStatus.OPEN })
  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.OPEN,
  })
  status: ReportStatus;

  @ApiPropertyOptional({ type: 'array', items: { type: 'string' } })
  @Column({ type: 'simple-array', nullable: true })
  photos: string[] | null;

  @ApiPropertyOptional()
  @Column({ type: 'timestamp', nullable: true, name: 'acknowledged_at' })
  acknowledgedAt: Date | null;

  @ApiPropertyOptional({ format: 'uuid' })
  @Column({ type: 'uuid', nullable: true, name: 'acknowledged_by' })
  acknowledgedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'acknowledged_by' })
  acknowledgedByUser: User | null;

  @ApiPropertyOptional()
  @Column({ type: 'timestamp', nullable: true, name: 'resolved_at' })
  resolvedAt: Date | null;

  @ApiPropertyOptional({ format: 'uuid' })
  @Column({ type: 'uuid', nullable: true, name: 'resolved_by' })
  resolvedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolved_by' })
  resolvedByUser: User | null;

  @ApiPropertyOptional({ example: 'Issue fixed, vehicle is operational' })
  @Column({ type: 'text', nullable: true, name: 'resolution_notes' })
  resolutionNotes: string | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  canBeAcknowledged(): boolean {
    return this.status === ReportStatus.OPEN;
  }

  canBeResolved(): boolean {
    return [ReportStatus.OPEN, ReportStatus.ACKNOWLEDGED].includes(this.status);
  }

  isOpen(): boolean {
    return this.status === ReportStatus.OPEN;
  }

  isResolved(): boolean {
    return this.status === ReportStatus.RESOLVED;
  }
}
