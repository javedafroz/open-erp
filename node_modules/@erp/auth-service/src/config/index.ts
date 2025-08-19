import { KeycloakConfig, ServiceConfig, RedisConfig } from '@erp/shared';

export interface AuthServiceConfig {
  service: ServiceConfig;
  keycloak: KeycloakConfig & {
    adminUsername: string;
    adminPassword: string;
    clientSecret: string;
  };
  redis: RedisConfig;
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
}

export const config: AuthServiceConfig = {
  service: {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || '0.0.0.0',
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true,
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
  },
  keycloak: {
    realm: process.env.KEYCLOAK_REALM || 'erp-system',
    'auth-server-url': process.env.KEYCLOAK_URL || 'http://localhost:8080',
    'ssl-required': 'external',
    resource: process.env.KEYCLOAK_CLIENT_ID || 'erp-backend',
    'public-client': false,
    'confidential-port': 0,
    adminUsername: process.env.KEYCLOAK_ADMIN_USER || 'admin',
    adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin_password',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'super-secret-refresh-key',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
};

export default config;
