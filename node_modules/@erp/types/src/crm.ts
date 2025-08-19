import { LeadStatus, OpportunityStage, EntityType } from '@erp/shared';
import { Address, SocialLinks } from './user';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  company?: string;
  jobTitle?: string;
  status: LeadStatus;
  source: string;
  score?: number;
  assignedToId?: string;
  convertedAccountId?: string;
  convertedContactId?: string;
  convertedOpportunityId?: string;
  convertedAt?: Date;
  lastContactedAt?: Date;
  tags?: string[];
  notes?: string;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'prospect' | 'customer' | 'partner' | 'competitor' | 'other';
  industry?: string;
  website?: string;
  phoneNumber?: string;
  email?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  description?: string;
  revenue?: number;
  employeeCount?: number;
  parentAccountId?: string;
  ownerId: string;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  mobileNumber?: string;
  jobTitle?: string;
  department?: string;
  accountId?: string;
  reportingToId?: string;
  isPrimary: boolean;
  doNotCall: boolean;
  doNotEmail: boolean;
  birthday?: Date;
  address?: Address;
  socialMedia?: SocialLinks;
  tags?: string[];
  notes?: string;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface Opportunity {
  id: string;
  name: string;
  description?: string;
  accountId: string;
  contactId?: string;
  ownerId: string;
  stage: OpportunityStage;
  amount: number;
  currency: string;
  probability: number; // 0-100
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  source: string;
  competitorIds?: string[];
  productsServices?: OpportunityProduct[];
  nextStep?: string;
  reasonLost?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  teamMembers?: OpportunityTeamMember[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

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

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'sms' | 'other';
  subject: string;
  description?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  duration?: number; // in minutes
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  entityType: EntityType;
  entityId: string;
  assignedToId?: string;
  completedAt?: Date;
  outcome?: string;
  followUpDate?: Date;
  reminderAt?: Date;
  location?: string;
  attendees?: ActivityAttendee[];
  attachments?: ActivityAttachment[];
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface ActivityAttendee {
  id: string;
  contactId?: string;
  userId?: string;
  email: string;
  name: string;
  status: 'invited' | 'accepted' | 'declined' | 'tentative';
  responseAt?: Date;
}

export interface ActivityAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedById: string;
  uploadedAt: Date;
}



// Request/Response DTOs
export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  company?: string;
  jobTitle?: string;
  source: string;
  assignedToId?: string;
  tags?: string[];
  notes?: string;
  customFields?: Record<string, any>;
}

export interface UpdateLeadRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  company?: string;
  jobTitle?: string;
  status?: LeadStatus;
  score?: number;
  assignedToId?: string;
  tags?: string[];
  notes?: string;
  customFields?: Record<string, any>;
}

export interface ConvertLeadRequest {
  createAccount: boolean;
  accountName?: string;
  createContact: boolean;
  createOpportunity: boolean;
  opportunityName?: string;
  opportunityAmount?: number;
  opportunityStage?: OpportunityStage;
  expectedCloseDate?: Date;
}

export interface CreateAccountRequest {
  name: string;
  type: 'prospect' | 'customer' | 'partner' | 'competitor' | 'other';
  industry?: string;
  website?: string;
  phoneNumber?: string;
  email?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  description?: string;
  revenue?: number;
  employeeCount?: number;
  parentAccountId?: string;
  ownerId: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateAccountRequest {
  name?: string;
  type?: 'prospect' | 'customer' | 'partner' | 'competitor' | 'other';
  industry?: string;
  website?: string;
  phoneNumber?: string;
  email?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  description?: string;
  revenue?: number;
  employeeCount?: number;
  parentAccountId?: string;
  ownerId?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  mobileNumber?: string;
  jobTitle?: string;
  department?: string;
  accountId?: string;
  reportingToId?: string;
  isPrimary?: boolean;
  birthday?: Date;
  address?: Address;
  socialMedia?: SocialLinks;
  tags?: string[];
  notes?: string;
  customFields?: Record<string, any>;
}

export interface CreateOpportunityRequest {
  name: string;
  description?: string;
  accountId: string;
  contactId?: string;
  ownerId: string;
  stage: OpportunityStage;
  amount: number;
  currency: string;
  probability: number;
  expectedCloseDate: Date;
  source: string;
  nextStep?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface CreateActivityRequest {
  type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'sms' | 'other';
  subject: string;
  description?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  priority?: 'low' | 'medium' | 'high';
  entityType: EntityType;
  entityId: string;
  assignedToId?: string;
  followUpDate?: Date;
  reminderAt?: Date;
  location?: string;
  attendees?: Omit<ActivityAttendee, 'id' | 'status' | 'responseAt'>[];
  tags?: string[];
  customFields?: Record<string, any>;
}

// Analytics and Reporting types
export interface LeadAnalytics {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  conversionRate: number;
  leadsByStatus: Record<LeadStatus, number>;
  leadsBySource: Record<string, number>;
  averageScore: number;
  topPerformingSources: Array<{ source: string; count: number; conversionRate: number }>;
}

export interface OpportunityAnalytics {
  totalOpportunities: number;
  totalValue: number;
  wonOpportunities: number;
  wonValue: number;
  winRate: number;
  opportunitiesByStage: Record<OpportunityStage, { count: number; value: number }>;
  averageDealSize: number;
  averageSalesCycle: number; // in days
  forecastValue: number;
}

export interface ActivityAnalytics {
  totalActivities: number;
  completedActivities: number;
  overrideActivities: number;
  activitiesByType: Record<string, number>;
  activitiesByStatus: Record<string, number>;
  averageResponseTime: number; // in hours
}

// Search and Filter types
export interface CRMSearchRequest {
  query?: string;
  entityTypes?: EntityType[];
  filters?: CRMFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CRMFilters {
  dateRange?: {
    startDate: Date;
    endDate: Date;
    field: string; // createdAt, updatedAt, etc.
  };
  tags?: string[];
  assignedTo?: string[];
  status?: string[];
  customFields?: Record<string, any>;
}
