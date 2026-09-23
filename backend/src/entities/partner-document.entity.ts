import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Partner } from './partner.entity';
import { PartnerUser } from './partner-user.entity';

export enum PartnerDocumentType {
  SIRET = 'siret',
  INSURANCE_CERTIFICATE = 'insurance_certificate',
}

export enum PartnerDocumentVerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('partner_documents')
export class PartnerDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'partner_id', type: 'uuid' })
  partnerId: string;

  @ManyToOne(() => Partner, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @Column({ name: 'uploaded_by_partner_user_id', type: 'uuid' })
  uploadedByPartnerUserId: string;

  @ManyToOne(() => PartnerUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploaded_by_partner_user_id' })
  uploadedByPartnerUser: PartnerUser;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'file_path', type: 'text' })
  filePath: string;

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  @Column({ type: 'integer' })
  size: number;

  @Column({ name: 'document_type', type: 'varchar', length: 40 })
  documentType: PartnerDocumentType;

  @Column({
    name: 'verification_status',
    type: 'varchar',
    length: 20,
    default: PartnerDocumentVerificationStatus.PENDING,
  })
  verificationStatus: PartnerDocumentVerificationStatus;

  @Column({ name: 'verification_notes', type: 'text', nullable: true })
  verificationNotes: string | null;

  @Column({ name: 'verified_by_id', type: 'uuid', nullable: true })
  verifiedById: string | null;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
