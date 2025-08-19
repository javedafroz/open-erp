export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALES_REP = 'sales_rep',
  SUPPORT_AGENT = 'support_agent',
  MARKETING_USER = 'marketing_user',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export enum LeadStatus {
  NEW = 'new',
  QUALIFIED = 'qualified',
  CONTACTED = 'contacted',
  CONVERTED = 'converted',
  LOST = 'lost',
}

export enum OpportunityStage {
  PROSPECTING = 'prospecting',
  QUALIFICATION = 'qualification',
  NEEDS_ANALYSIS = 'needs_analysis',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export enum CaseStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  WAITING_CUSTOMER = 'waiting_customer',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum CasePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum CaseOrigin {
  EMAIL = 'email',
  PHONE = 'phone',
  WEB = 'web',
  CHAT = 'chat',
  SOCIAL = 'social',
  WALK_IN = 'walk_in',
}

export enum ArticleStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum ArticleType {
  FAQ = 'faq',
  HOW_TO = 'how_to',
  TROUBLESHOOTING = 'troubleshooting',
  PRODUCT_INFO = 'product_info',
  POLICY = 'policy',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export enum EntityType {
  LEAD = 'lead',
  ACCOUNT = 'account',
  CONTACT = 'contact',
  OPPORTUNITY = 'opportunity',
  CASE = 'case',
  CAMPAIGN = 'campaign',
  PRODUCT = 'product',
  QUOTE = 'quote',
  ORDER = 'order',
}
