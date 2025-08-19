import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsEmail, IsOptional, IsString, IsEnum, IsNumber, IsUUID, IsUrl, Min } from 'class-validator';

export enum AccountType {
  PROSPECT = 'prospect',
  CUSTOMER = 'customer',
  PARTNER = 'partner',
  COMPETITOR = 'competitor',
  OTHER = 'other',
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

@Entity('accounts')
@Index(['name'])
@Index(['organizationId'])
@Index(['type'])
@Index(['ownerId'])
@Index(['createdAt'])
@Index(['industry'])
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @Index()
  name: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.PROSPECT
  })
  @IsEnum(AccountType)
  type: AccountType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsUrl()
  website?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  billingAddress?: Address;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  shippingAddress?: Address;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  revenue?: number;

  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  employeeCount?: number;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  parentAccountId?: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  ownerId: string;

  @Column({ type: 'simple-array', nullable: true })
  @IsOptional()
  tags?: string[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  customFields?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid' })
  @IsUUID()
  createdById: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  organizationId: string;

  // Computed fields
  @Column({ type: 'boolean', default: false })
  isParentAccount: boolean;

  @Column({ type: 'integer', default: 0 })
  childAccountsCount: number;

  @Column({ type: 'integer', default: 0 })
  contactsCount: number;

  @Column({ type: 'integer', default: 0 })
  opportunitiesCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalOpportunityValue: number;

  // Self-referencing relationship for parent/child accounts
  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'parentAccountId' })
  parentAccount?: Account;

  @OneToMany(() => Account, account => account.parentAccount)
  childAccounts?: Account[];

  // Virtual relationships (handled by services)
  owner?: any; // User entity reference
  contacts?: any[]; // Contact entities
  opportunities?: any[]; // Opportunity entities
  activities?: any[]; // Activity entities

  @BeforeInsert()
  @BeforeUpdate()
  updateComputedFields(): void {
    // These will be updated by triggers or service methods
    // Kept here for schema completeness
  }

  // Helper methods
  isCustomer(): boolean {
    return this.type === AccountType.CUSTOMER;
  }

  isProspect(): boolean {
    return this.type === AccountType.PROSPECT;
  }

  hasParent(): boolean {
    return !!this.parentAccountId;
  }

  hasChildren(): boolean {
    return this.childAccountsCount > 0;
  }

  getAccountSize(): 'small' | 'medium' | 'large' | 'enterprise' {
    if (!this.employeeCount) return 'small';
    if (this.employeeCount >= 1000) return 'enterprise';
    if (this.employeeCount >= 100) return 'large';
    if (this.employeeCount >= 10) return 'medium';
    return 'small';
  }

  getRevenueRange(): string {
    if (!this.revenue) return 'Unknown';
    if (this.revenue >= 100000000) return '$100M+';
    if (this.revenue >= 10000000) return '$10M - $100M';
    if (this.revenue >= 1000000) return '$1M - $10M';
    if (this.revenue >= 100000) return '$100K - $1M';
    return 'Under $100K';
  }

  getFullAddress(type: 'billing' | 'shipping' = 'billing'): string {
    const address = type === 'billing' ? this.billingAddress : this.shippingAddress;
    if (!address) return '';
    
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  }

  getDaysSinceCreated(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysSinceLastUpdate(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.updatedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
