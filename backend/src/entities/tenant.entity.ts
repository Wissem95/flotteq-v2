import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';
import { Driver } from './driver.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum TenantStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  INCOMPLETE = 'incomplete',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  name: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true, name: 'postal_code' })
  postalCode: string;

  @Column({ nullable: true })
  country: string;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.TRIAL,
  })
  status: TenantStatus;

  @Column({ nullable: true, name: 'stripe_customer_id' })
  stripeCustomerId: string;

  @Column({ nullable: true, name: 'stripe_subscription_id' })
  stripeSubscriptionId: string;

  @Column({
    type: 'enum',
    enum: ['trial', 'active', 'past_due', 'cancelled', 'incomplete'],
    default: 'trial',
    name: 'subscription_status',
  })
  subscriptionStatus: string;

  @Column({ type: 'timestamp', nullable: true, name: 'trial_ends_at' })
  trialEndsAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'subscription_started_at' })
  subscriptionStartedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'subscription_ended_at' })
  subscriptionEndedAt: Date;

  @Column({ name: 'storage_used_bytes', type: 'bigint', default: '0' })
  storageUsedBytes: string; // bigint stocké comme string en TypeScript

  @Column({ name: 'custom_storage_quota_mb', nullable: true })
  customStorageQuotaMb?: number; // Quota personnalisé (remplace celui du plan si défini)

  @Column({ name: 'onboarding_completed', default: false })
  onboardingCompleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true, name: 'plan_id' })
  planId: number;

  // Relations
  @ManyToOne(() => SubscriptionPlan, { nullable: true })
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Vehicle, (vehicle) => vehicle.tenant)
  vehicles: Vehicle[];

  @OneToMany(() => Driver, (driver) => driver.tenant)
  drivers: Driver[];
}
