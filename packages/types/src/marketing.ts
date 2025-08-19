import { CampaignStatus, NotificationType } from '@erp/shared';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: 'email' | 'sms' | 'social' | 'webinar' | 'event' | 'direct_mail' | 'advertising';
  status: CampaignStatus;
  startDate: Date;
  endDate?: Date;
  budget?: number;
  currency?: string;
  actualCost?: number;
  targetAudience: string;
  expectedResponse?: number;
  expectedRevenue?: number;
  actualResponse?: number;
  actualRevenue?: number;
  ownerId: string;
  template?: EmailTemplate;
  segments?: MarketingSegment[];
  metrics: CampaignMetrics;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  replied: number;
  converted: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  unsubscribeRate: number;
  bounceRate: number;
  replyRate: number;
  roi: number; // Return on investment
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  preheader?: string;
  category: string;
  isActive: boolean;
  variables?: TemplateVariable[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'list';
  defaultValue?: any;
  required: boolean;
}

export interface MarketingList {
  id: string;
  name: string;
  description?: string;
  type: 'static' | 'dynamic';
  status: 'active' | 'inactive';
  totalContacts: number;
  activeContacts: number;
  criteria?: ListCriteria;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastUpdatedAt?: Date;
  createdById: string;
  organizationId: string;
}

export interface ListCriteria {
  conditions: ListCondition[];
  operator: 'AND' | 'OR';
}

export interface ListCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between';
  value: any;
  values?: any[]; // for between operator
}

export interface MarketingSegment {
  id: string;
  name: string;
  description?: string;
  listIds: string[];
  contactCount: number;
  criteria?: SegmentCriteria;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface SegmentCriteria {
  demographic?: DemographicCriteria;
  behavioral?: BehavioralCriteria;
  geographic?: GeographicCriteria;
  engagement?: EngagementCriteria;
}

export interface DemographicCriteria {
  ageRange?: { min: number; max: number };
  gender?: string[];
  jobTitles?: string[];
  industries?: string[];
  companySize?: { min: number; max: number };
  income?: { min: number; max: number };
}

export interface BehavioralCriteria {
  purchaseHistory?: PurchaseCriteria;
  websiteActivity?: WebActivityCriteria;
  emailEngagement?: EmailEngagementCriteria;
  productUsage?: ProductUsageCriteria;
}

export interface PurchaseCriteria {
  totalSpent?: { min: number; max: number };
  lastPurchaseDate?: { after: Date; before: Date };
  productCategories?: string[];
  frequency?: { min: number; max: number };
}

export interface WebActivityCriteria {
  pagesVisited?: string[];
  timeOnSite?: { min: number; max: number };
  lastVisit?: { after: Date; before: Date };
  downloadedContent?: string[];
}

export interface EmailEngagementCriteria {
  openRate?: { min: number; max: number };
  clickRate?: { min: number; max: number };
  lastOpened?: { after: Date; before: Date };
  lastClicked?: { after: Date; before: Date };
}

export interface ProductUsageCriteria {
  featuresUsed?: string[];
  loginFrequency?: { min: number; max: number };
  lastLogin?: { after: Date; before: Date };
  supportTickets?: { min: number; max: number };
}

export interface GeographicCriteria {
  countries?: string[];
  states?: string[];
  cities?: string[];
  zipCodes?: string[];
  timezone?: string[];
}

export interface EngagementCriteria {
  emailSubscriptionStatus?: 'subscribed' | 'unsubscribed' | 'bounced';
  communicationPreference?: NotificationType[];
  engagementScore?: { min: number; max: number };
  lastEngagement?: { after: Date; before: Date };
}

export interface EmailCampaign {
  id: string;
  campaignId: string;
  templateId: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  preheader?: string;
  scheduledAt?: Date;
  sentAt?: Date;
  recipients: EmailRecipient[];
  abTestConfig?: ABTestConfig;
  trackingEnabled: boolean;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface EmailRecipient {
  id: string;
  contactId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  unsubscribedAt?: Date;
  opens: number;
  clicks: number;
  personalizedContent?: Record<string, any>;
}

export interface ABTestConfig {
  enabled: boolean;
  testType: 'subject' | 'content' | 'sender' | 'send_time';
  variations: ABTestVariation[];
  splitPercentage: number;
  winnerCriteria: 'open_rate' | 'click_rate' | 'conversion_rate' | 'revenue';
  testDuration: number; // in hours
  automaticWinner: boolean;
}

export interface ABTestVariation {
  id: string;
  name: string;
  content: any; // varies based on test type
  percentage: number;
  recipients: number;
  metrics: CampaignMetrics;
}

export interface MarketingAutomation {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft';
  trigger: AutomationTrigger;
  workflow: WorkflowStep[];
  enrollmentCriteria?: ListCriteria;
  exitCriteria?: ListCriteria;
  totalEnrolled: number;
  activeEnrolled: number;
  completed: number;
  goals?: AutomationGoal[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface AutomationTrigger {
  type: 'contact_created' | 'list_membership' | 'form_submission' | 'email_opened' | 'link_clicked' | 'date_based' | 'behavior' | 'api';
  configuration: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  type: 'wait' | 'send_email' | 'send_sms' | 'create_task' | 'update_contact' | 'add_to_list' | 'remove_from_list' | 'webhook' | 'condition';
  name: string;
  configuration: Record<string, any>;
  nextStepId?: string;
  alternateStepId?: string; // for conditions
  delay?: number; // in hours
}

export interface AutomationGoal {
  id: string;
  name: string;
  type: 'email_open' | 'link_click' | 'form_submission' | 'purchase' | 'custom_event';
  configuration: Record<string, any>;
  achieved: number;
  target: number;
}

export interface LandingPage {
  id: string;
  name: string;
  title: string;
  url: string;
  customDomain?: string;
  status: 'published' | 'draft' | 'archived';
  purpose: 'lead_generation' | 'event_registration' | 'product_promotion' | 'survey' | 'other';
  htmlContent: string;
  cssContent?: string;
  jsContent?: string;
  mobileOptimized: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  forms?: LandingPageForm[];
  analytics: LandingPageAnalytics;
  abTestConfig?: ABTestConfig;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  createdById: string;
  organizationId: string;
}

export interface LandingPageForm {
  id: string;
  name: string;
  fields: FormField[];
  submitText: string;
  thankYouMessage: string;
  redirectUrl?: string;
  autoResponder?: AutoResponderConfig;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number';
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select, checkbox, radio
  validation?: FieldValidation;
  mapping?: string; // maps to contact field
}

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface AutoResponderConfig {
  enabled: boolean;
  templateId: string;
  delay?: number; // in minutes
  subject: string;
}

export interface LandingPageAnalytics {
  visits: number;
  uniqueVisits: number;
  submissions: number;
  conversionRate: number;
  bounceRate: number;
  averageTimeOnPage: number; // in seconds
  trafficSources: Record<string, number>;
  deviceBreakdown: Record<string, number>;
}

// Request/Response DTOs
export interface CreateCampaignRequest {
  name: string;
  description?: string;
  type: 'email' | 'sms' | 'social' | 'webinar' | 'event' | 'direct_mail' | 'advertising';
  startDate: Date;
  endDate?: Date;
  budget?: number;
  currency?: string;
  targetAudience: string;
  expectedResponse?: number;
  expectedRevenue?: number;
  ownerId: string;
  segmentIds?: string[];
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface CreateEmailTemplateRequest {
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  preheader?: string;
  category: string;
  variables?: TemplateVariable[];
}

export interface CreateMarketingListRequest {
  name: string;
  description?: string;
  type: 'static' | 'dynamic';
  criteria?: ListCriteria;
  tags?: string[];
}

// Analytics types
export interface MarketingAnalytics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeadsGenerated: number;
  totalRevenue: number;
  averageROI: number;
  campaignsByStatus: Record<CampaignStatus, number>;
  leadsBySource: Record<string, number>;
  conversionFunnel: ConversionStage[];
}

export interface ConversionStage {
  stage: string;
  count: number;
  percentage: number;
  conversionRate: number;
}
