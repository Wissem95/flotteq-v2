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
import { Booking } from './booking.entity';

export enum CommissionStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity('commissions')
@Index(['partnerId'])
@Index(['status'])
@Index(['paidAt'])
@Index(['partnerId', 'status'])
@Index(['createdAt'])
export class Commission {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'partner_id', type: 'uuid' })
  partnerId: string;

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'booking_id', type: 'uuid', unique: true })
  bookingId: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ApiProperty({ example: 8.99, description: 'Commission amount in EUR' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ enum: CommissionStatus, example: 'pending' })
  @Column({
    type: 'enum',
    enum: CommissionStatus,
    default: CommissionStatus.PENDING,
  })
  status: CommissionStatus;

  @ApiPropertyOptional()
  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
  paidAt: Date | null;

  @ApiPropertyOptional({ example: 'BANK_TRANSFER_20251018_001' })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'payment_reference',
  })
  paymentReference: string | null;

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
  canBePaid(): boolean {
    return this.status === CommissionStatus.PENDING;
  }

  isPending(): boolean {
    return this.status === CommissionStatus.PENDING;
  }

  isPaid(): boolean {
    return this.status === CommissionStatus.PAID && !!this.paidAt;
  }
}
