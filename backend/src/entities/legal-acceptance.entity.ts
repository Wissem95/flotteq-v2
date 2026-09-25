import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export const CURRENT_LEGAL_DOCUMENT_VERSION = '2026-09-25';

export type LegalCustomerType = 'consumer' | 'professional';

@Entity('legal_acceptances')
export class LegalAcceptance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId: number;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'customer_type', type: 'varchar', length: 20 })
  customerType: LegalCustomerType;

  @Column({ name: 'terms_version', type: 'varchar', length: 32 })
  termsVersion: string;

  @Column({ name: 'privacy_policy_version', type: 'varchar', length: 32 })
  privacyPolicyVersion: string;

  @Column({
    name: 'immediate_service_requested',
    type: 'boolean',
    default: false,
  })
  immediateServiceRequested: boolean;

  @CreateDateColumn({ name: 'accepted_at' })
  acceptedAt: Date;
}
