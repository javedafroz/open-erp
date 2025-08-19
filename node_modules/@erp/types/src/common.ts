export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: any;
  statusCode: number;
  timestamp: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface SearchRequest {
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  query: string;
  filters?: Record<string, any>;
  executionTime: number; // in milliseconds
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'import';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes?: ChangeSet[];
  performedBy: string;
  performedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  organizationId: string;
}

export interface ChangeSet {
  field: string;
  oldValue: any;
  newValue: any;
  dataType: string;
}

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'multi_select' | 'textarea' | 'url' | 'email' | 'phone';
  entityType: string;
  required: boolean;
  defaultValue?: any;
  options?: CustomFieldOption[];
  validation?: CustomFieldValidation;
  sortOrder: number;
  isActive: boolean;
  description?: string;
  helpText?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface CustomFieldOption {
  value: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CustomFieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  color?: string;
  entityTypes: string[];
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface Note {
  id: string;
  title?: string;
  content: string;
  entityType: string;
  entityId: string;
  isPrivate: boolean;
  tags?: string[];
  attachments?: NoteAttachment[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface NoteAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedById: string;
  uploadedAt: Date;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  readAt?: Date;
  recipientId: string;
  senderId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('in_app' | 'email' | 'sms' | 'push')[];
  scheduledAt?: Date;
  sentAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  organizationId: string;
}

export interface FileUpload {
  id: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  entityType?: string;
  entityId?: string;
  uploadedById: string;
  uploadedAt: Date;
  isPublic: boolean;
  metadata?: FileMetadata;
  organizationId: string;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number; // for videos
  pages?: number; // for PDFs
  exifData?: Record<string, any>; // for images
  checksum?: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isDefault: boolean;
  isSystemRole: boolean;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface ImportJob {
  id: string;
  name: string;
  entityType: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  fileName: string;
  fileSize: number;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  duplicateRecords: number;
  errors?: ImportError[];
  mapping?: FieldMapping[];
  duplicateHandling: 'skip' | 'update' | 'create_new';
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  createdById: string;
  organizationId: string;
}

export interface ImportError {
  row: number;
  field?: string;
  error: string;
  value?: any;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  defaultValue?: any;
}

export interface ExportJob {
  id: string;
  name: string;
  entityType: string;
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  status: 'pending' | 'running' | 'completed' | 'failed';
  criteria?: Record<string, any>;
  fields: string[];
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  recordCount?: number;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  createdById: string;
  organizationId: string;
}

export interface Integration {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'configuring';
  configuration: Record<string, any>;
  credentials?: Record<string, any>;
  webhooks?: WebhookConfig[];
  lastSyncAt?: Date;
  syncInterval?: number; // in minutes
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;
  headers?: Record<string, string>;
  retries: number;
  timeout: number; // in seconds
}

export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'json' | 'array';
  category: string;
  description?: string;
  isEditable: boolean;
  isSecret: boolean;
  validationRules?: Record<string, any>;
  updatedAt: Date;
  updatedById: string;
  organizationId?: string; // null for global config
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  isDefault: boolean;
  isPublic: boolean;
  sharedWith?: string[]; // user IDs
  filters?: DashboardFilter[];
  refreshInterval?: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gridSize: number;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'list' | 'progress' | 'map' | 'text';
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: Record<string, any>;
  dataSource: string;
  query?: string;
  refreshInterval?: number;
  isVisible: boolean;
  permissions?: string[];
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'date_range' | 'select' | 'multi_select' | 'text' | 'number_range';
  options?: any[];
  defaultValue?: any;
  appliesTo: string[]; // widget IDs
}
