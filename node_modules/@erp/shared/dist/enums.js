export var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["SALES_REP"] = "sales_rep";
    UserRole["SUPPORT_AGENT"] = "support_agent";
    UserRole["MARKETING_USER"] = "marketing_user";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (UserRole = {}));
export var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["PENDING"] = "pending";
    UserStatus["SUSPENDED"] = "suspended";
})(UserStatus || (UserStatus = {}));
export var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "new";
    LeadStatus["QUALIFIED"] = "qualified";
    LeadStatus["CONTACTED"] = "contacted";
    LeadStatus["CONVERTED"] = "converted";
    LeadStatus["LOST"] = "lost";
})(LeadStatus || (LeadStatus = {}));
export var OpportunityStage;
(function (OpportunityStage) {
    OpportunityStage["PROSPECTING"] = "prospecting";
    OpportunityStage["QUALIFICATION"] = "qualification";
    OpportunityStage["NEEDS_ANALYSIS"] = "needs_analysis";
    OpportunityStage["PROPOSAL"] = "proposal";
    OpportunityStage["NEGOTIATION"] = "negotiation";
    OpportunityStage["CLOSED_WON"] = "closed_won";
    OpportunityStage["CLOSED_LOST"] = "closed_lost";
})(OpportunityStage || (OpportunityStage = {}));
export var CaseStatus;
(function (CaseStatus) {
    CaseStatus["NEW"] = "new";
    CaseStatus["IN_PROGRESS"] = "in_progress";
    CaseStatus["WAITING_CUSTOMER"] = "waiting_customer";
    CaseStatus["ESCALATED"] = "escalated";
    CaseStatus["RESOLVED"] = "resolved";
    CaseStatus["CLOSED"] = "closed";
})(CaseStatus || (CaseStatus = {}));
export var CasePriority;
(function (CasePriority) {
    CasePriority["LOW"] = "low";
    CasePriority["MEDIUM"] = "medium";
    CasePriority["HIGH"] = "high";
    CasePriority["CRITICAL"] = "critical";
})(CasePriority || (CasePriority = {}));
export var CaseOrigin;
(function (CaseOrigin) {
    CaseOrigin["EMAIL"] = "email";
    CaseOrigin["PHONE"] = "phone";
    CaseOrigin["WEB"] = "web";
    CaseOrigin["CHAT"] = "chat";
    CaseOrigin["SOCIAL"] = "social";
    CaseOrigin["WALK_IN"] = "walk_in";
})(CaseOrigin || (CaseOrigin = {}));
export var ArticleStatus;
(function (ArticleStatus) {
    ArticleStatus["DRAFT"] = "draft";
    ArticleStatus["IN_REVIEW"] = "in_review";
    ArticleStatus["PUBLISHED"] = "published";
    ArticleStatus["ARCHIVED"] = "archived";
})(ArticleStatus || (ArticleStatus = {}));
export var ArticleType;
(function (ArticleType) {
    ArticleType["FAQ"] = "faq";
    ArticleType["HOW_TO"] = "how_to";
    ArticleType["TROUBLESHOOTING"] = "troubleshooting";
    ArticleType["PRODUCT_INFO"] = "product_info";
    ArticleType["POLICY"] = "policy";
})(ArticleType || (ArticleType = {}));
export var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus["DRAFT"] = "draft";
    CampaignStatus["SCHEDULED"] = "scheduled";
    CampaignStatus["ACTIVE"] = "active";
    CampaignStatus["PAUSED"] = "paused";
    CampaignStatus["COMPLETED"] = "completed";
    CampaignStatus["CANCELLED"] = "cancelled";
})(CampaignStatus || (CampaignStatus = {}));
export var NotificationType;
(function (NotificationType) {
    NotificationType["EMAIL"] = "email";
    NotificationType["SMS"] = "sms";
    NotificationType["PUSH"] = "push";
    NotificationType["IN_APP"] = "in_app";
})(NotificationType || (NotificationType = {}));
export var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (LogLevel = {}));
export var EntityType;
(function (EntityType) {
    EntityType["LEAD"] = "lead";
    EntityType["ACCOUNT"] = "account";
    EntityType["CONTACT"] = "contact";
    EntityType["OPPORTUNITY"] = "opportunity";
    EntityType["CASE"] = "case";
    EntityType["CAMPAIGN"] = "campaign";
    EntityType["PRODUCT"] = "product";
    EntityType["QUOTE"] = "quote";
    EntityType["ORDER"] = "order";
})(EntityType || (EntityType = {}));
//# sourceMappingURL=enums.js.map