export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    MANAGER = "manager",
    SALES_REP = "sales_rep",
    SUPPORT_AGENT = "support_agent",
    MARKETING_USER = "marketing_user",
    VIEWER = "viewer"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    SUSPENDED = "suspended"
}
export declare enum LeadStatus {
    NEW = "new",
    QUALIFIED = "qualified",
    CONTACTED = "contacted",
    CONVERTED = "converted",
    LOST = "lost"
}
export declare enum OpportunityStage {
    PROSPECTING = "prospecting",
    QUALIFICATION = "qualification",
    NEEDS_ANALYSIS = "needs_analysis",
    PROPOSAL = "proposal",
    NEGOTIATION = "negotiation",
    CLOSED_WON = "closed_won",
    CLOSED_LOST = "closed_lost"
}
export declare enum CaseStatus {
    NEW = "new",
    IN_PROGRESS = "in_progress",
    WAITING_CUSTOMER = "waiting_customer",
    ESCALATED = "escalated",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
export declare enum CasePriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum CaseOrigin {
    EMAIL = "email",
    PHONE = "phone",
    WEB = "web",
    CHAT = "chat",
    SOCIAL = "social",
    WALK_IN = "walk_in"
}
export declare enum ArticleStatus {
    DRAFT = "draft",
    IN_REVIEW = "in_review",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
export declare enum ArticleType {
    FAQ = "faq",
    HOW_TO = "how_to",
    TROUBLESHOOTING = "troubleshooting",
    PRODUCT_INFO = "product_info",
    POLICY = "policy"
}
export declare enum CampaignStatus {
    DRAFT = "draft",
    SCHEDULED = "scheduled",
    ACTIVE = "active",
    PAUSED = "paused",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum NotificationType {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    IN_APP = "in_app"
}
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
export declare enum EntityType {
    LEAD = "lead",
    ACCOUNT = "account",
    CONTACT = "contact",
    OPPORTUNITY = "opportunity",
    CASE = "case",
    CAMPAIGN = "campaign",
    PRODUCT = "product",
    QUOTE = "quote",
    ORDER = "order"
}
//# sourceMappingURL=enums.d.ts.map