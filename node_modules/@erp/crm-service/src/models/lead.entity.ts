import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToOne,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsEmail, IsOptional, IsString, IsEnum, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { LeadStatus } from '@erp/shared';

@Entity('leads')
@Index(['email'])
@Index(['organizationId'])
@Index(['status'])
@Index(['assignedToId'])
@Index(['createdAt'])
@Index(['score'])
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  company?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW
  })
  @IsEnum(LeadStatus)
  status: LeadStatus;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  source: string;

  @Column({ type: 'integer', nullable: true, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  convertedAccountId?: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  convertedContactId?: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  convertedOpportunityId?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  convertedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  lastContactedAt?: Date;

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

  @Column({ type: 'boolean', default: false })
  isConverted: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  updateComputedFields(): void {
    this.fullName = `${this.firstName} ${this.lastName}`.trim();
    this.isConverted = !!(this.convertedAt && (
      this.convertedAccountId || 
      this.convertedContactId || 
      this.convertedOpportunityId
    ));
  }

  // Virtual relationships (handled by services)
  assignedTo?: any; // User entity reference
  convertedAccount?: any; // Account entity reference
  convertedContact?: any; // Contact entity reference  
  convertedOpportunity?: any; // Opportunity entity reference
  activities?: any[]; // Activity entities
  
  // Helper methods
  isQualified(): boolean {
    return this.status === LeadStatus.QUALIFIED;
  }

  canBeConverted(): boolean {
    return this.status === LeadStatus.QUALIFIED && !this.isConverted;
  }

  getScoreLevel(): 'low' | 'medium' | 'high' {
    if (!this.score) return 'low';
    if (this.score >= 80) return 'high';
    if (this.score >= 50) return 'medium';
    return 'low';
  }

  getDaysSinceCreated(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysSinceLastContact(): number | null {
    if (!this.lastContactedAt) return null;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastContactedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
