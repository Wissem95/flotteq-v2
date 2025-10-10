import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price: number;

  @Column()
  maxVehicles: number; // -1 pour illimité

  @Column()
  maxUsers: number; // -1 pour illimité

  @Column()
  maxDrivers: number; // -1 pour illimité

  @Column({ default: 0 })
  trialDays: number; // 0 = pas d'essai, 14 = 14 jours d'essai

  @Column({ name: 'max_storage_mb', default: 1000 })
  maxStorageMb: number; // Quota de stockage en MB

  @Column('simple-array')
  features: string[]; // ['support_email', 'export_pdf', 'api_access']

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  stripeProductId: string;

  @Column({ nullable: true })
  stripePriceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];
}
