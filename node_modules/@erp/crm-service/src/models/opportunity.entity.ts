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
import { IsString, IsNumber, IsUUID, IsOptional, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { OpportunityStage } from '@erp/shared';
import { Account } from './account.entity';
import { Contact } from './contact.entity';

export interface OpportunityProduct {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  description?: string;
}

export interface OpportunityTeamMember {
  id: string;
  userId: string;
  role: string;
  accessLevel: 'read' | 'write' | 'admin';
  addedAt: Date;
  addedById: string;
}

@Entity('opportunities')
@Index(['name'])
@Index(['organizationId'])
@Index(['accountId'])
@Index(['contactId'])
@Index(['ownerId'])
@Index(['stage'])
@Index(['expectedCloseDate'])
@Index(['createdAt'])
@Index(['amount'])
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  name: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  accountId: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  ownerId: string;

  @Column({
    type: 'enum',
    enum: OpportunityStage,
    default: OpportunityStage.PROSPECTING
  })
  @IsEnum(OpportunityStage)
  stage: OpportunityStage;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @IsNumber()
  @Min(0)
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  @IsString()
  currency: string;

  @Column({ type: 'integer' })
  @IsNumber()
  @Min(0)
  @Max(100)
  probability: number;

  @Column({ type: 'date' })
  @IsDateString()
  expectedCloseDate: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  actualCloseDate?: Date;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  source: string;

  @Column({ type: 'simple-array', nullable: true })
  @IsOptional()
  competitorIds?: string[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  productsServices?: OpportunityProduct[];

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  nextStep?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  reasonLost?: string;

  @Column({ type: 'simple-array', nullable: true })
  @IsOptional()
  tags?: string[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  customFields?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  teamMembers?: OpportunityTeamMember[];

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
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  weightedAmount?: number;

  @Column({ type: 'integer', nullable: true })
  daysInStage?: number;

  @Column({ type: 'integer', nullable: true })
  totalSalesCycleDays?: number;

  @Column({ type: 'boolean', default: false })
  isWon: boolean;

  @Column({ type: 'boolean', default: false })
  isLost: boolean;

  @Column({ type: 'boolean', default: false })
  isClosed: boolean;

  @Column({ type: 'boolean', default: false })
  isOverdue: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastStageChangeAt?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  previousStage?: string;

  // Relationships
  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account?: Account;

  @ManyToOne(() => Contact, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'contactId' })
  contact?: Contact;

  // Virtual relationships (handled by services)
  owner?: any; // User entity reference
  activities?: any[]; // Activity entities
  competitors?: any[]; // Competitor entities
  quotes?: any[]; // Quote entities
  attachments?: any[]; // File entities

  @BeforeInsert()
  @BeforeUpdate()
  updateComputedFields(): void {
    // Update weighted amount
    this.weightedAmount = this.amount * (this.probability / 100);

    // Update status flags
    this.isWon = this.stage === OpportunityStage.CLOSED_WON;
    this.isLost = this.stage === OpportunityStage.CLOSED_LOST;
    this.isClosed = this.isWon || this.isLost;

    // Check if overdue
    const today = new Date();
    this.isOverdue = !this.isClosed && this.expectedCloseDate < today;

    // Calculate days in current stage
    if (this.lastStageChangeAt) {
      const diffTime = Math.abs(new Date().getTime() - this.lastStageChangeAt.getTime());
      this.daysInStage = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      const diffTime = Math.abs(new Date().getTime() - this.createdAt.getTime());
      this.daysInStage = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Calculate total sales cycle days
    if (this.isClosed && this.actualCloseDate) {
      const diffTime = Math.abs(this.actualCloseDate.getTime() - this.createdAt.getTime());
      this.totalSalesCycleDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  // Helper methods
  getStageProgress(): number {
    const stageOrder = [
      OpportunityStage.PROSPECTING,
      OpportunityStage.QUALIFICATION,
      OpportunityStage.NEEDS_ANALYSIS,
      OpportunityStage.PROPOSAL,
      OpportunityStage.NEGOTIATION,
      OpportunityStage.CLOSED_WON,
    ];
    
    const currentIndex = stageOrder.indexOf(this.stage);
    if (currentIndex === -1) return 0;
    
    return Math.round((currentIndex / (stageOrder.length - 1)) * 100);
  }

  canAdvanceStage(): boolean {
    return !this.isClosed && this.stage !== OpportunityStage.NEGOTIATION;
  }

  canRegressStage(): boolean {
    return !this.isClosed && this.stage !== OpportunityStage.PROSPECTING;
  }

  getNextStage(): OpportunityStage | null {
    const stageFlow = {
      [OpportunityStage.PROSPECTING]: OpportunityStage.QUALIFICATION,
      [OpportunityStage.QUALIFICATION]: OpportunityStage.NEEDS_ANALYSIS,
      [OpportunityStage.NEEDS_ANALYSIS]: OpportunityStage.PROPOSAL,
      [OpportunityStage.PROPOSAL]: OpportunityStage.NEGOTIATION,
      [OpportunityStage.NEGOTIATION]: OpportunityStage.CLOSED_WON,
    };
    
    return stageFlow[this.stage] || null;
  }

  getPreviousStage(): OpportunityStage | null {
    const stageFlow = {
      [OpportunityStage.QUALIFICATION]: OpportunityStage.PROSPECTING,
      [OpportunityStage.NEEDS_ANALYSIS]: OpportunityStage.QUALIFICATION,
      [OpportunityStage.PROPOSAL]: OpportunityStage.NEEDS_ANALYSIS,
      [OpportunityStage.NEGOTIATION]: OpportunityStage.PROPOSAL,
      [OpportunityStage.CLOSED_WON]: OpportunityStage.NEGOTIATION,
      [OpportunityStage.CLOSED_LOST]: OpportunityStage.NEGOTIATION,
    };
    
    return stageFlow[this.stage] || null;
  }

  getDaysUntilExpectedClose(): number {
    const today = new Date();
    const diffTime = this.expectedCloseDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysSinceCreated(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getProbabilityLevel(): 'low' | 'medium' | 'high' {
    if (this.probability >= 80) return 'high';
    if (this.probability >= 50) return 'medium';
    return 'low';
  }

  getAmountFormatted(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }

  getWeightedAmountFormatted(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
    }).format(this.weightedAmount || 0);
  }

  getTotalProductValue(): number {
    if (!this.productsServices) return 0;
    return this.productsServices.reduce((total, product) => total + product.totalPrice, 0);
  }

  getProductCount(): number {
    return this.productsServices?.length || 0;
  }

  hasTeamMembers(): boolean {
    return (this.teamMembers?.length || 0) > 0;
  }

  isTeamMember(userId: string): boolean {
    return this.teamMembers?.some(member => member.userId === userId) || false;
  }

  getTeamMemberRole(userId: string): string | null {
    const member = this.teamMembers?.find(member => member.userId === userId);
    return member?.role || null;
  }

  hasCompetitors(): boolean {
    return (this.competitorIds?.length || 0) > 0;
  }

  calculateHealthScore(): number {
    let score = 0;
    
    // Stage progression
    score += this.getStageProgress() * 0.3;
    
    // Probability
    score += this.probability * 0.4;
    
    // Activity (placeholder - would be calculated from actual activities)
    // score += activityScore * 0.2;
    
    // Time factors
    const daysUntilClose = this.getDaysUntilExpectedClose();
    if (daysUntilClose > 0 && daysUntilClose <= 30) score += 10;
    else if (daysUntilClose < 0) score -= 20; // Overdue penalty
    
    return Math.max(0, Math.min(100, score));
  }
}
