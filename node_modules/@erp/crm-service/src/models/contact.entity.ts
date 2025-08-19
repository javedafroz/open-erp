import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsEmail, IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { Account } from './account.entity';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}

@Entity('contacts')
@Index(['email'])
@Index(['organizationId'])
@Index(['accountId'])
@Index(['firstName', 'lastName'])
@Index(['createdAt'])
@Index(['isPrimary'])
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  lastName: string;

  @Column({ type: 'varchar', length: 255 })
  @IsEmail()
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  reportingToId?: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isPrimary: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  doNotCall: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  doNotEmail: boolean;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  birthday?: Date;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  address?: Address;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  socialMedia?: SocialLinks;

  @Column({ type: 'simple-array', nullable: true })
  @IsOptional()
  tags?: string[];

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

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

  // Computed properties
  @Column({ type: 'varchar', length: 201, nullable: true })
  fullName?: string;

  @Column({ type: 'integer', default: 0 })
  opportunitiesCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalOpportunityValue: number;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastEmailSentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastCallAt?: Date;

  // Relationships
  @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'accountId' })
  account?: Account;

  @ManyToOne(() => Contact, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reportingToId' })
  reportingTo?: Contact;

  // Virtual relationships (handled by services)
  directReports?: Contact[]; // Contacts reporting to this contact
  opportunities?: any[]; // Opportunity entities
  activities?: any[]; // Activity entities
  leadSource?: any; // Lead entity if converted from lead

  @BeforeInsert()
  @BeforeUpdate()
  updateComputedFields(): void {
    this.fullName = `${this.firstName} ${this.lastName}`.trim();
  }

  // Helper methods
  getDisplayName(): string {
    if (this.jobTitle) {
      return `${this.fullName} (${this.jobTitle})`;
    }
    return this.fullName || '';
  }

  getPreferredContactMethod(): 'email' | 'phone' | 'mobile' | null {
    if (this.doNotCall && this.doNotEmail) return null;
    if (this.doNotEmail && this.phoneNumber) return 'phone';
    if (this.doNotEmail && this.mobileNumber) return 'mobile';
    if (this.doNotCall) return 'email';
    
    // Default preference: email > mobile > phone
    if (this.email) return 'email';
    if (this.mobileNumber) return 'mobile';
    if (this.phoneNumber) return 'phone';
    return null;
  }

  canBeContacted(): boolean {
    return !this.doNotCall || !this.doNotEmail;
  }

  canBeCalledOn(method: 'phone' | 'mobile'): boolean {
    if (this.doNotCall) return false;
    if (method === 'phone') return !!this.phoneNumber;
    if (method === 'mobile') return !!this.mobileNumber;
    return false;
  }

  canBeEmailed(): boolean {
    return !this.doNotEmail && !!this.email;
  }

  getAge(): number | null {
    if (!this.birthday) return null;
    const today = new Date();
    const birthDate = new Date(this.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getFullAddress(): string {
    if (!this.address) return '';
    
    return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
  }

  getSocialMediaLinks(): SocialLinks {
    return this.socialMedia || {};
  }

  getDaysSinceCreated(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysSinceLastActivity(): number | null {
    if (!this.lastActivityAt) return null;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastActivityAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isUpcomingBirthday(days: number = 7): boolean {
    if (!this.birthday) return false;
    
    const today = new Date();
    const thisYear = today.getFullYear();
    const birthdayThisYear = new Date(thisYear, this.birthday.getMonth(), this.birthday.getDate());
    
    // If birthday has passed this year, check next year
    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(thisYear + 1);
    }
    
    const diffTime = birthdayThisYear.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= days && diffDays >= 0;
  }

  getEngagementScore(): number {
    // Simple engagement score based on activity recency
    // This could be made more sophisticated
    let score = 0;
    
    if (this.lastActivityAt) {
      const daysSinceActivity = this.getDaysSinceLastActivity();
      if (daysSinceActivity !== null) {
        if (daysSinceActivity <= 7) score += 30;
        else if (daysSinceActivity <= 30) score += 20;
        else if (daysSinceActivity <= 90) score += 10;
      }
    }
    
    if (this.opportunitiesCount > 0) score += 25;
    if (this.isPrimary) score += 15;
    if (this.jobTitle) score += 10;
    
    return Math.min(score, 100);
  }
}
