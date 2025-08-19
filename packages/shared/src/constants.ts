export const API_ENDPOINTS = {
  AUTH: '/api/v1/auth',
  USERS: '/api/v1/users',
  CRM: '/api/v1/crm',
  SALES: '/api/v1/sales',
  SERVICE: '/api/v1/service',
  MARKETING: '/api/v1/marketing',
  ANALYTICS: '/api/v1/analytics',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de'] as const;

export const CACHE_KEYS = {
  USER_PROFILE: 'user:profile',
  USER_PERMISSIONS: 'user:permissions',
  ORGANIZATION: 'org',
} as const;

export const JWT_TOKEN_EXPIRY = 3600; // 1 hour
export const REFRESH_TOKEN_EXPIRY = 604800; // 7 days

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
