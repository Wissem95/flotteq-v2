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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Partner } from './partner.entity';

export enum PartnerUserRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

@Entity('partner_users')
@Index(['email'])
@Index(['partnerId'])
export class PartnerUser {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'partner_id', type: 'uuid' })
  partnerId: string;

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @ApiProperty({ example: 'john.doe@garagemartin.fr' })
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @ApiProperty({ example: 'John' })
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty({ enum: PartnerUserRole, example: 'owner' })
  @Column({
    type: 'enum',
    enum: PartnerUserRole,
    default: PartnerUserRole.OWNER,
  })
  role: PartnerUserRole;

  @ApiProperty({ example: true })
  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @ApiPropertyOptional()
  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional()
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

  // Check if user can manage partner
  canManagePartner(): boolean {
    return (
      this.role === PartnerUserRole.OWNER ||
      this.role === PartnerUserRole.MANAGER
    );
  }

  // Check if user is owner
  isOwner(): boolean {
    return this.role === PartnerUserRole.OWNER;
  }
}
