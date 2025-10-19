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
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Partner } from './partner.entity';

@Entity('availabilities')
@Index(['partnerId'])
@Index(['partnerId', 'dayOfWeek'])
@Unique(['partnerId', 'dayOfWeek'])
export class Availability {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'partner_id', type: 'uuid' })
  partnerId: string;

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @ApiProperty({ example: 1, description: 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday' })
  @Column({ type: 'int', name: 'day_of_week' })
  dayOfWeek: number;

  @ApiProperty({ example: '09:00', description: 'Start time in HH:mm format' })
  @Column({ type: 'time', name: 'start_time' })
  startTime: string;

  @ApiProperty({ example: '18:00', description: 'End time in HH:mm format' })
  @Column({ type: 'time', name: 'end_time' })
  endTime: string;

  @ApiProperty({ example: 30, description: 'Slot duration in minutes (5-120)' })
  @Column({ type: 'int', name: 'slot_duration' })
  slotDuration: number;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional()
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Helper method to get day name
  getDayName(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[this.dayOfWeek];
  }

  // Helper method to validate time range
  isValidTimeRange(): boolean {
    return this.startTime < this.endTime;
  }

  // Helper method to calculate number of slots
  getTotalSlots(): number {
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const totalMinutes = endMinutes - startMinutes;
    return Math.floor(totalMinutes / this.slotDuration);
  }
}
