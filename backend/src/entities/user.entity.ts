import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tenant } from './tenant.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin', // Admin FlotteQ (tenantId = 1)
  SUPPORT = 'support', // Support FlotteQ (tenantId = 1)
  TENANT_ADMIN = 'tenant_admin', // Admin de l'entreprise cliente
  MANAGER = 'manager', // Manager flotte
  DRIVER = 'driver', // Conducteur
  VIEWER = 'viewer', // Lecture seule
}

@Entity('users')
@Index(['email', 'tenantId'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId: number;

  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, name: 'last_login_at' })
  lastLoginAt: Date;

  @Column({ nullable: true, name: 'refresh_token', select: false, type: 'text' })
  refreshToken: string | null;

  @Column({ nullable: true, name: 'reset_password_token' })
  resetPasswordToken: string;

  @Column({ nullable: true, name: 'reset_password_expires' })
  resetPasswordExpires: Date;

  @Column({ type: 'varchar', nullable: true, name: 'invitation_token' })
  invitationToken: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'invitation_expires_at' })
  invitationExpiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Vérifier si l'utilisateur est de FlotteQ
  isFlotteQUser(): boolean {
    return this.tenantId === 1;
  }

  // Vérifier si l'utilisateur peut gérer d'autres utilisateurs
  canManageUsers(): boolean {
    return [UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN].includes(this.role);
  }

  // Vérifier si l'utilisateur peut voir toutes les données
  canViewAllData(): boolean {
    return [UserRole.SUPER_ADMIN, UserRole.SUPPORT].includes(this.role);
  }
}
