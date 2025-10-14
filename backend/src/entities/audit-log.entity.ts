import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ',
}

@Entity('audit_logs')
@Index(['tenantId', 'entityType'])
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: number;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ name: 'entity_type', length: 100 })
  entityType: string;

  @Column({ type: 'varchar', name: 'entity_id', nullable: true })
  entityId: string | null;

  @Column('jsonb', { name: 'old_value', nullable: true })
  oldValue: any;

  @Column('jsonb', { name: 'new_value', nullable: true })
  newValue: any;

  @Column('jsonb', { nullable: true })
  metadata: {
    ip?: string;
    userAgent?: string;
    route?: string;
    method?: string;
  } | null;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;
}
