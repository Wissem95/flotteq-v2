import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MaintenanceType } from './maintenance.entity';

@Entity('maintenance_templates')
export class MaintenanceTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: MaintenanceType,
  })
  type: MaintenanceType;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  estimatedCost: number;

  @Column({ type: 'int', nullable: true })
  estimatedDurationDays: number | null;

  @Column({ type: 'int', nullable: true })
  kmInterval: number | null; // Intervalle kilométrique recommandé

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'tenant_id' })
  tenantId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
