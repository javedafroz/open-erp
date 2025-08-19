import 'reflect-metadata';
import Fastify, { FastifyInstance } from 'fastify';
import { createLogger } from '@erp/utils';
import { config } from './config';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { AuthMiddleware } from './middleware/auth.middleware';

// Create logger
const logger = createLogger('AuthServiceApp');

class AuthServiceApp {
  private server: FastifyInstance;
  private authService: AuthService;
  private authController: AuthController;
  private authMiddleware: AuthMiddleware;

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
    this.authService = new AuthService();
    this.authController = new AuthController(this.authService);
    this.authMiddleware = new AuthMiddleware(this.authService);
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
            title: 'ERP Authentication Service API',
            description: 'Authentication and authorization service with Keycloak integration',
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

  private async setupRoutes(): Promise<void> {
    // Health check endpoint
    this.server.get('/health', async () => ({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      version: '1.0.0',
    }));

    // Ready check endpoint
    this.server.get('/ready', async () => {
      try {
        // TODO: Add actual readiness checks (database, Keycloak, Redis)
        return {
          status: 'ready',
          timestamp: new Date().toISOString(),
          service: 'auth-service',
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
      // Public routes (no authentication required)
      fastify.post('/api/v1/auth/login', this.authController.getLoginOptions(), this.authController.login);
      fastify.post('/api/v1/auth/refresh', this.authController.getRefreshTokenOptions(), this.authController.refreshToken);
      fastify.post('/api/v1/auth/validate', this.authController.validateToken);

      // Protected routes (authentication required)
      fastify.register(async (protectedRoutes) => {
        // Add authentication middleware to all routes in this context
        protectedRoutes.addHook('preHandler', this.authMiddleware.authenticate);

        // User info and session management
        protectedRoutes.get('/api/v1/auth/me', this.authController.getCurrentUser);
        protectedRoutes.get('/api/v1/auth/sessions', this.authController.getUserSessions);
        protectedRoutes.delete('/api/v1/auth/sessions/:sessionId', this.authController.revokeSession);
        protectedRoutes.delete('/api/v1/auth/sessions', this.authController.revokeAllSessions);
        protectedRoutes.post('/api/v1/auth/logout', this.authController.logout);
      });
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

        // Shutdown auth service
        await this.authService.shutdown();
        logger.info('Auth service shutdown completed');

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
      logger.info('Starting Authentication Service...');

      // Initialize auth service (Keycloak and Redis connections)
      logger.info('Initializing auth service...');
      await this.authService.initialize();

      // Setup Fastify
      await this.setupPlugins();
      await this.setupRoutes();
      this.setupErrorHandling();
      this.setupGracefulShutdown();

      // Start server
      const address = await this.server.listen({
        port: config.service.port,
        host: config.service.host,
      });

      logger.info(`🚀 Authentication Service started successfully`);
      logger.info(`📖 Server listening at ${address}`);
      
      if (process.env.SWAGGER_ENABLED === 'true' || process.env.NODE_ENV === 'development') {
        logger.info(`📚 API Documentation: ${address}/docs`);
      }

      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔐 Keycloak URL: ${config.keycloak['auth-server-url']}`);
      logger.info(`📊 Redis: ${config.redis.host}:${config.redis.port}`);

    } catch (error) {
      logger.error('Failed to start Authentication Service', { error });
      process.exit(1);
    }
  }
}

// Start the application
const app = new AuthServiceApp();
app.start().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
