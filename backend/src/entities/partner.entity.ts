import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PartnerType {
  GARAGE = 'garage',
  CT_CENTER = 'ct_center',
  INSURANCE = 'insurance',
  PARTS_SUPPLIER = 'parts_supplier',
}

export enum PartnerStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

@Entity('partners')
@Index(['status'])
@Index(['type'])
@Index(['city'])
@Index(['latitude', 'longitude'])
export class Partner {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Garage Martin' })
  @Column({ name: 'company_name' })
  @Index()
  companyName: string;

  @ApiProperty({ enum: PartnerType, example: 'garage' })
  @Column({
    type: 'enum',
    enum: PartnerType,
  })
  type: PartnerType;

  @ApiProperty({ example: 'contact@garagemartin.fr' })
  @Column({ unique: true })
  @Index()
  email: string;

  @ApiProperty({ example: '+33612345678' })
  @Column()
  phone: string;

  @ApiProperty({ example: '15 Rue de la République' })
  @Column()
  address: string;

  @ApiProperty({ example: 'Paris' })
  @Column()
  city: string;

  @ApiProperty({ example: '75001' })
  @Column({ name: 'postal_code' })
  postalCode: string;

  @ApiPropertyOptional({ example: 48.8566 })
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number | null;

  @ApiPropertyOptional({ example: 2.3522 })
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number | null;

  @ApiProperty({ example: 10, description: 'Commission rate percentage' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10, name: 'commission_rate' })
  commissionRate: number;

  @ApiPropertyOptional({ example: 'Spécialiste réparation véhicules utilitaires' })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ example: '12345678901234' })
  @Column({ unique: true, name: 'siret_number' })
  siretNumber: string;

  @ApiPropertyOptional({ example: 'path/to/insurance.pdf' })
  @Column({ type: 'varchar', nullable: true, name: 'insurance_document' })
  insuranceDocument: string | null;

  @ApiProperty({ example: 4.5 })
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @ApiProperty({ example: 120 })
  @Column({ type: 'int', default: 0, name: 'total_reviews' })
  totalReviews: number;

  @ApiProperty({ enum: PartnerStatus, example: 'pending' })
  @Column({
    type: 'enum',
    enum: PartnerStatus,
    default: PartnerStatus.PENDING,
  })
  status: PartnerStatus;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional()
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Check if partner is approved
  isApproved(): boolean {
    return this.status === PartnerStatus.APPROVED;
  }

  // Check if partner can offer services
  canOfferServices(): boolean {
    return this.status === PartnerStatus.APPROVED && !this.deletedAt;
  }
}
