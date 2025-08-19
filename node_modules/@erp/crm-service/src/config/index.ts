import { ServiceConfig, RedisConfig } from '@erp/shared';

export interface CrmServiceConfig {
  service: ServiceConfig;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    schema: string;
    ssl: boolean;
  };
  redis: RedisConfig;
  auth: {
    keycloakUrl: string;
    realm: string;
    clientId: string;
  };
  elasticsearch: {
    node: string;
    indexPrefix: string;
  };
  messaging: {
    rabbitmqUrl: string;
    exchange: string;
  };
}

export const config: CrmServiceConfig = {
  service: {
    port: parseInt(process.env.PORT || '3003', 10),
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
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'erp_user',
    password: process.env.DB_PASSWORD || 'erp_password',
    database: process.env.DB_NAME || 'erp_db',
    schema: process.env.DB_SCHEMA || 'crm',
    ssl: process.env.DB_SSL === 'true',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '2', 10),
  },
  auth: {
    keycloakUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
    realm: process.env.KEYCLOAK_REALM || 'erp-system',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'erp-backend',
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    indexPrefix: process.env.ELASTICSEARCH_INDEX_PREFIX || 'erp-crm',
  },
  messaging: {
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://erp_user:erp_password@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'erp.events',
  },
};

export default config;
