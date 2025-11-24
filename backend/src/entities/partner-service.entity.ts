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

@Entity('partner_services')
@Index(['partnerId'])
@Index(['partnerId', 'isActive'])
export class PartnerService {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'partner_id', type: 'uuid' })
  partnerId: string;

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @ApiProperty({ example: 'Vidange complète' })
  @Column()
  name: string;

  @ApiPropertyOptional({
    example: 'Vidange moteur + filtre à huile + filtre à air',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ example: 89.99, description: 'Price in EUR' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ example: 60, description: 'Duration in minutes' })
  @Column({ type: 'int', name: 'duration_minutes' })
  durationMinutes: number;

  @ApiProperty({ example: true })
  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional()
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Check if service is bookable
  isBookable(): boolean {
    return this.isActive && !this.deletedAt;
  }

  // Get formatted price
  getFormattedPrice(): string {
    return `${this.price.toFixed(2)} €`;
  }

  // Get formatted duration
  getFormattedDuration(): string {
    const hours = Math.floor(this.durationMinutes / 60);
    const minutes = this.durationMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h${minutes}`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}min`;
    }
  }
}
