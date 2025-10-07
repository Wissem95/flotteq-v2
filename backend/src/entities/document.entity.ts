import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';
import { Tenant } from './tenant.entity';

export enum DocumentEntityType {
  VEHICLE = 'vehicle',
  DRIVER = 'driver',
  MAINTENANCE = 'maintenance',
}

@Entity('documents')
export class Document {
  @ApiProperty({ format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'facture-maintenance.pdf' })
  @Column()
  fileName: string;

  @ApiProperty({ example: '/uploads/documents/abc123.pdf' })
  @Column()
  fileUrl: string;

  @ApiProperty({ example: 'application/pdf' })
  @Column()
  mimeType: string;

  @ApiProperty({ description: 'Taille en bytes', example: 2048576 })
  @Column()
  size: number;

  @ApiProperty({ enum: DocumentEntityType, example: 'vehicle' })
  @Column({
    type: 'enum',
    enum: DocumentEntityType,
  })
  entityType: DocumentEntityType;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  entityId: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'uploaded_by_id' })
  uploadedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: User;

  @ApiProperty()
  @Column({ name: 'tenant_id' })
  tenantId: number;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiPropertyOptional()
  @DeleteDateColumn()
  deletedAt?: Date;
}
