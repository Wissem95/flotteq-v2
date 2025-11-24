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

@Entity('unavailabilities')
@Index(['partnerId'])
@Index(['partnerId', 'date'])
@Index(['date'])
export class Unavailability {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'partner_id', type: 'uuid' })
  partnerId: string;

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @ApiProperty({ example: '2025-10-20', description: 'Date of unavailability' })
  @Column({ type: 'date' })
  date: Date;

  @ApiProperty({ example: 'Holiday', description: 'Reason for unavailability' })
  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @ApiProperty({ example: true, description: 'Is full day unavailable?' })
  @Column({ type: 'boolean', default: true, name: 'is_full_day' })
  isFullDay: boolean;

  @ApiPropertyOptional({
    example: '09:00',
    description: 'Start time if partial unavailability',
  })
  @Column({ type: 'time', nullable: true, name: 'start_time' })
  startTime: string | null;

  @ApiPropertyOptional({
    example: '12:00',
    description: 'End time if partial unavailability',
  })
  @Column({ type: 'time', nullable: true, name: 'end_time' })
  endTime: string | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional()
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Helper method to check if a time slot is blocked
  blocksTimeSlot(time: string): boolean {
    if (this.isFullDay) {
      return true;
    }

    if (!this.startTime || !this.endTime) {
      return false;
    }

    return time >= this.startTime && time < this.endTime;
  }

  // Helper method to check if a time range overlaps
  overlapsTimeRange(startTime: string, endTime: string): boolean {
    if (this.isFullDay) {
      return true;
    }

    if (!this.startTime || !this.endTime) {
      return false;
    }

    // Check if ranges overlap
    return this.startTime < endTime && startTime < this.endTime;
  }
}
