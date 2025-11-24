import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Partner } from './partner.entity';
import { PartnerService } from './partner-service.entity';
import { Tenant } from './tenant.entity';
import { Vehicle } from './vehicle.entity';
import { Driver } from './driver.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

@Entity('bookings')
@Index(['partnerId'])
@Index(['tenantId'])
@Index(['vehicleId'])
@Index(['status'])
@Index(['scheduledDate'])
export class Booking {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'partner_id', type: 'uuid' })
  partnerId: string;

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @ApiProperty({ type: 'number' })
  @Column({ name: 'tenant_id', type: 'int' })
  tenantId: number;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ApiPropertyOptional({ format: 'uuid' })
  @Column({ name: 'driver_id', type: 'uuid', nullable: true })
  driverId: string | null;

  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver | null;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => PartnerService)
  @JoinColumn({ name: 'service_id' })
  service: PartnerService;

  @ApiProperty({ example: '2025-10-20' })
  @Column({ type: 'date', name: 'scheduled_date' })
  scheduledDate: Date;

  @ApiProperty({ example: '14:00' })
  @Column({ type: 'time', name: 'scheduled_time' })
  scheduledTime: string;

  @ApiProperty({ example: '16:00' })
  @Column({ type: 'time', name: 'end_time' })
  endTime: string;

  @ApiProperty({ enum: BookingStatus, example: 'pending' })
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @ApiProperty({ example: 89.99, description: 'Service price in EUR' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ example: 8.99, description: 'Commission amount in EUR' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    name: 'commission_amount',
  })
  commissionAmount: number;

  @ApiPropertyOptional({ example: 'Please check the brakes too' })
  @Column({ type: 'text', nullable: true, name: 'customer_notes' })
  customerNotes: string | null;

  @ApiPropertyOptional({ example: 'Replaced brake pads' })
  @Column({ type: 'text', nullable: true, name: 'partner_notes' })
  partnerNotes: string | null;

  @ApiPropertyOptional({ example: 'Not available at this time' })
  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason: string | null;

  @ApiPropertyOptional({ example: 'Customer request' })
  @Column({ type: 'text', nullable: true, name: 'cancellation_reason' })
  cancellationReason: string | null;

  @ApiPropertyOptional()
  @Column({ type: 'timestamp', nullable: true, name: 'confirmed_at' })
  confirmedAt: Date | null;

  @ApiPropertyOptional()
  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt: Date | null;

  @ApiPropertyOptional({ enum: ['pending', 'paid', 'refunded'] })
  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
    name: 'payment_status',
  })
  paymentStatus: 'pending' | 'paid' | 'refunded';

  @ApiPropertyOptional()
  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
  paidAt: Date | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional()
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Helper methods
  canBeConfirmed(): boolean {
    return this.status === BookingStatus.PENDING;
  }

  canBeRejected(): boolean {
    return this.status === BookingStatus.PENDING;
  }

  canBeStarted(): boolean {
    return this.status === BookingStatus.CONFIRMED;
  }

  canBeCompleted(): boolean {
    return this.status === BookingStatus.IN_PROGRESS;
  }

  canBeCancelled(): boolean {
    return [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(
      this.status,
    );
  }

  canBeRescheduled(): boolean {
    return [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(
      this.status,
    );
  }

  isPaid(): boolean {
    return this.status === BookingStatus.COMPLETED && !!this.paidAt;
  }
}
