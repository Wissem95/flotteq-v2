import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Booking } from './booking.entity';
import { Tenant } from './tenant.entity';
import { Partner } from './partner.entity';

@Entity('ratings')
@Index(['partnerId'])
@Index(['tenantId'])
@Index(['bookingId'], { unique: true })
@Index(['createdAt'])
@Check(`"score" >= 1 AND "score" <= 5`)
export class Rating {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ApiProperty({ type: 'number' })
  @Column({ name: 'tenant_id', type: 'int' })
  tenantId: number;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'partner_id', type: 'uuid' })
  partnerId: string;

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @ApiProperty({ example: 4.5, description: 'Rating score from 1.0 to 5.0' })
  @Column({ type: 'decimal', precision: 2, scale: 1 })
  score: number;

  @ApiPropertyOptional({ example: 'Excellent service, very professional!' })
  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Helper method to validate score range
  isValidScore(): boolean {
    const numScore = Number(this.score);
    return numScore >= 1.0 && numScore <= 5.0;
  }
}
