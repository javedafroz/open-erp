import { CaseStatus, CasePriority } from '@erp/shared';

export interface Case {
  id: string;
  number: string;
  subject: string;
  description?: string;
  status: CaseStatus;
  priority: CasePriority;
  type: 'question' | 'problem' | 'feature_request' | 'bug' | 'other';
  origin: 'phone' | 'email' | 'web' | 'chat' | 'social' | 'other';
  accountId?: string;
  contactId: string;
  assignedToId?: string;
  escalatedToId?: string;
  escalatedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  resolution?: string;
  internalNotes?: string;
  publicNotes?: string;
  tags?: string[];
  slaViolated: boolean;
  responseTime?: number; // in hours
  resolutionTime?: number; // in hours
  customFields?: Record<string, any>;
  attachments?: CaseAttachment[];
  activities?: CaseActivity[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface CaseAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedById: string;
  uploadedAt: Date;
}

export interface CaseActivity {
  id: string;
  type: 'comment' | 'status_change' | 'assignment' | 'escalation' | 'attachment';
  description: string;
  isPublic: boolean;
  performedById: string;
  performedAt: Date;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  categoryId: string;
  subcategoryId?: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  type: 'faq' | 'howto' | 'troubleshooting' | 'policy' | 'other';
  tags?: string[];
  keywords?: string[];
  language: string;
  viewCount: number;
  helpfulCount: number;
  unhelpfulCount: number;
  publishedAt?: Date;
  archivedAt?: Date;
  authorId: string;
  reviewerId?: string;
  reviewedAt?: Date;
  attachments?: ArticleAttachment[];
  relatedArticles?: string[];
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

export interface ArticleAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedById: string;
  uploadedAt: Date;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  articlesCount: number;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

export interface ServiceContract {
  id: string;
  name: string;
  accountId: string;
  contactId?: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  type: 'standard' | 'premium' | 'enterprise' | 'custom';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  termsAndConditions?: string;
  serviceLevel: ServiceLevel;
  entitlements: ServiceEntitlement[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface ServiceLevel {
  id: string;
  name: string;
  description?: string;
  responseTime: number; // in hours
  resolutionTime: number; // in hours
  availability: number; // percentage
  supportChannels: string[];
  businessHours: BusinessHours;
}

export interface BusinessHours {
  monday: TimeRange;
  tuesday: TimeRange;
  wednesday: TimeRange;
  thursday: TimeRange;
  friday: TimeRange;
  saturday?: TimeRange;
  sunday?: TimeRange;
  timezone: string;
}

export interface TimeRange {
  start: string; // HH:mm format
  end: string; // HH:mm format
  isWorkingDay: boolean;
}

export interface ServiceEntitlement {
  id: string;
  name: string;
  description?: string;
  type: 'cases' | 'hours' | 'incidents' | 'users' | 'other';
  totalAmount: number;
  usedAmount: number;
  remainingAmount: number;
  resetPeriod?: 'monthly' | 'quarterly' | 'yearly' | 'contract';
  lastResetDate?: Date;
  nextResetDate?: Date;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  caseId?: string;
  contactId: string;
  accountId?: string;
  responses: SurveyAnswer[];
  overallRating?: number;
  comments?: string;
  completedAt: Date;
  createdAt: Date;
  organizationId: string;
}

export interface SurveyAnswer {
  questionId: string;
  question: string;
  answer: string | number | boolean | string[];
  rating?: number;
}

// Request/Response DTOs
export interface CreateCaseRequest {
  subject: string;
  description?: string;
  priority: CasePriority;
  type: 'question' | 'problem' | 'feature_request' | 'bug' | 'other';
  origin: 'phone' | 'email' | 'web' | 'chat' | 'social' | 'other';
  accountId?: string;
  contactId: string;
  assignedToId?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateCaseRequest {
  subject?: string;
  description?: string;
  status?: CaseStatus;
  priority?: CasePriority;
  assignedToId?: string;
  resolution?: string;
  internalNotes?: string;
  publicNotes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface CreateKnowledgeArticleRequest {
  title: string;
  content: string;
  summary?: string;
  categoryId: string;
  subcategoryId?: string;
  type: 'faq' | 'howto' | 'troubleshooting' | 'policy' | 'other';
  tags?: string[];
  keywords?: string[];
  language: string;
}

// Analytics types
export interface ServiceAnalytics {
  totalCases: number;
  openCases: number;
  resolvedCases: number;
  averageResponseTime: number; // in hours
  averageResolutionTime: number; // in hours
  slaViolations: number;
  casesByStatus: Record<CaseStatus, number>;
  casesByPriority: Record<CasePriority, number>;
  customerSatisfactionScore: number;
  firstCallResolutionRate: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  casesHandled: number;
  casesResolved: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  customerSatisfactionScore: number;
  slaViolations: number;
}
