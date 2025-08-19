import 'reflect-metadata';
import Fastify, { FastifyInstance } from 'fastify';
import { createLogger } from '@erp/utils';
import { config } from './config';
import { DatabaseService } from './config/database';
import { LeadController } from './controllers/lead.controller';

// Create logger
const logger = createLogger('CrmServiceApp');

class CrmServiceApp {
  private server: FastifyInstance;
  private databaseService: DatabaseService;
  private leadController: LeadController;

  constructor() {
    // Initialize Fastify with logging
    this.server = Fastify({
      logger: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV === 'development' ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        } : undefined,
      },
    });

    // Initialize services
    this.databaseService = DatabaseService.getInstance();
    this.leadController = new LeadController();
  }

  private async setupPlugins(): Promise<void> {
    // Register CORS
    await this.server.register(require('@fastify/cors'), {
      origin: config.service.cors.origin,
      credentials: config.service.cors.credentials,
    });

    // Register Helmet for security headers
    await this.server.register(require('@fastify/helmet'), {
      contentSecurityPolicy: false, // Disable CSP for API
    });

    // Register rate limiting
    await this.server.register(require('@fastify/rate-limit'), {
      max: config.service.rateLimit.max,
      timeWindow: config.service.rateLimit.windowMs,
      errorResponseBuilder: (request, context) => ({
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${Math.round(context.ttl / 1000)} seconds`,
        statusCode: 429,
      }),
    });

    // Register Swagger for API documentation
    if (process.env.SWAGGER_ENABLED === 'true' || process.env.NODE_ENV === 'development') {
      await this.server.register(require('@fastify/swagger'), {
        swagger: {
          info: {
            title: 'ERP CRM Service API',
            description: 'CRM service for lead, account, contact and opportunity management',
            version: '1.0.0',
          },
          host: `${config.service.host}:${config.service.port}`,
          schemes: ['http', 'https'],
          consumes: ['application/json'],
          produces: ['application/json'],
          securityDefinitions: {
            Bearer: {
              type: 'apiKey',
              name: 'Authorization',
              in: 'header',
              description: 'Enter: Bearer {your-token}',
            },
          },
        },
      });

      await this.server.register(require('@fastify/swagger-ui'), {
        routePrefix: '/docs',
        uiConfig: {
          docExpansion: 'full',
          deepLinking: false,
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
        transformSpecification: (swaggerObject) => swaggerObject,
        transformSpecificationClone: true,
      });
    }
  }

  private async setupMiddleware(): Promise<void> {
    // Simple authentication middleware (in production, use proper JWT validation)
    this.server.addHook('preHandler', async (request, reply) => {
      // Skip authentication for health checks and docs
      if (request.url.startsWith('/health') || 
          request.url.startsWith('/ready') || 
          request.url.startsWith('/metrics') ||
          request.url.startsWith('/docs')) {
        return;
      }

      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        await reply.status(401).send({
          success: false,
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header',
        });
        return;
      }

      // In production, validate JWT token with Keycloak
      // For now, we'll use a simple mock user
      (request as any).user = {
        userId: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        organizationId: 'test-org-id',
        roles: ['user'],
      };
    });
  }

  private async setupRoutes(): Promise<void> {
    // Health check endpoint
    this.server.get('/health', async () => ({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'crm-service',
      version: '1.0.0',
    }));

    // Ready check endpoint
    this.server.get('/ready', async () => {
      try {
        const isDbConnected = await this.databaseService.checkConnection();
        if (!isDbConnected) {
          throw new Error('Database not ready');
        }

        return {
          status: 'ready',
          timestamp: new Date().toISOString(),
          service: 'crm-service',
          checks: {
            database: isDbConnected ? 'healthy' : 'unhealthy',
          },
        };
      } catch (error) {
        throw new Error('Service not ready');
      }
    });

    // Metrics endpoint (for Prometheus)
    this.server.get('/metrics', async () => {
      // TODO: Implement Prometheus metrics
      return 'metrics_not_implemented 1\n';
    });

    // API Routes
    await this.server.register(async (fastify) => {
      // Lead routes
      fastify.post('/api/v1/crm/leads', this.leadController.getCreateLeadSchema(), this.leadController.createLead);
      fastify.put('/api/v1/crm/leads/:id', this.leadController.updateLead);
      fastify.get('/api/v1/crm/leads/:id', this.leadController.getLeadById);
      fastify.get('/api/v1/crm/leads', this.leadController.searchLeads);
      fastify.delete('/api/v1/crm/leads/:id', this.leadController.deleteLead);
      
      // Lead actions
      fastify.post('/api/v1/crm/leads/:id/convert', this.leadController.convertLead);
      fastify.put('/api/v1/crm/leads/:id/assign', this.leadController.assignLead);
      
      // Bulk operations
      fastify.post('/api/v1/crm/leads/bulk-assign', this.leadController.bulkAssignLeads);
      fastify.post('/api/v1/crm/leads/bulk-status', this.leadController.bulkUpdateStatus);
      
      // Analytics and utilities
      fastify.get('/api/v1/crm/leads/analytics', this.leadController.getLeadAnalytics);
      fastify.get('/api/v1/crm/leads/sources', this.leadController.getLeadSources);

      // TODO: Add routes for accounts, contacts, opportunities
      // fastify.post('/api/v1/crm/accounts', accountController.createAccount);
      // fastify.post('/api/v1/crm/contacts', contactController.createContact);
      // fastify.post('/api/v1/crm/opportunities', opportunityController.createOpportunity);
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.server.setErrorHandler(async (error, request, reply) => {
      logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
      });

      const statusCode = error.statusCode || 500;
      const response = {
        success: false,
        error: error.name || 'Internal Server Error',
        message: statusCode === 500 ? 'An unexpected error occurred' : error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      };

      await reply.status(statusCode).send(response);
    });

    // 404 handler
    this.server.setNotFoundHandler(async (request, reply) => {
      await reply.status(404).send({
        success: false,
        error: 'Not Found',
        message: `Route ${request.method} ${request.url} not found`,
      });
    });
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}, starting graceful shutdown`);

      try {
        // Close server
        await this.server.close();
        logger.info('HTTP server closed');

        // Disconnect from database
        await this.databaseService.disconnect();
        logger.info('Database connection closed');

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', { error });
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error: error.message, stack: error.stack });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', { reason, promise });
      process.exit(1);
    });
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting CRM Service...');

      // Initialize database connection
      logger.info('Connecting to database...');
      await this.databaseService.connect();

      // Run migrations in production
      if (process.env.NODE_ENV === 'production') {
        logger.info('Running database migrations...');
        await this.databaseService.runMigrations();
      }

      // Setup Fastify
      await this.setupPlugins();
      await this.setupMiddleware();
      await this.setupRoutes();
      this.setupErrorHandling();
      this.setupGracefulShutdown();

      // Start server
      const address = await this.server.listen({
        port: config.service.port,
        host: config.service.host,
      });

      logger.info(`🚀 CRM Service started successfully`);
      logger.info(`📖 Server listening at ${address}`);
      
      if (process.env.SWAGGER_ENABLED === 'true' || process.env.NODE_ENV === 'development') {
        logger.info(`📚 API Documentation: ${address}/docs`);
      }

      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🗄️  Database: ${config.database.host}:${config.database.port}/${config.database.database}`);
      logger.info(`📊 Redis: ${config.redis.host}:${config.redis.port}`);

    } catch (error) {
      logger.error('Failed to start CRM Service', { error });
      process.exit(1);
    }
  }
}

// Start the application
const app = new CrmServiceApp();
app.start().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
