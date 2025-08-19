import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService, AuthSession } from '../services/auth.service';
import { createLogger } from '@erp/utils';
import { UserRole } from '@erp/shared';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthSession;
    sessionId?: string;
  }
}

export class AuthMiddleware {
  private authService: AuthService;
  private logger = createLogger('AuthMiddleware');

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * Middleware to authenticate requests using Bearer token
   */
  authenticate = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const authHeader = request.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        await reply.status(401).send({
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header',
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      const session = await this.authService.validateToken(token);
      
      if (!session) {
        await reply.status(401).send({
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        });
        return;
      }

      // Attach user session to request
      request.user = session;
      request.sessionId = session.sessionId;

      this.logger.debug('User authenticated', { 
        userId: session.userId, 
        username: session.username,
        sessionId: session.sessionId 
      });
    } catch (error) {
      this.logger.error('Authentication failed', { error });
      await reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication failed',
      });
    }
  };

  /**
   * Middleware to authorize requests based on required roles
   */
  authorize = (requiredRoles: UserRole[] = []) => {
    return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        if (!request.user) {
          await reply.status(401).send({
            error: 'Unauthorized',
            message: 'Authentication required',
          });
          return;
        }

        if (requiredRoles.length === 0) {
          return; // No specific role required
        }

        const userRoles = request.user.roles || [];
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
          this.logger.warn('Authorization failed', {
            userId: request.user.userId,
            userRoles,
            requiredRoles,
          });

          await reply.status(403).send({
            error: 'Forbidden',
            message: 'Insufficient permissions',
          });
          return;
        }

        this.logger.debug('User authorized', {
          userId: request.user.userId,
          userRoles,
          requiredRoles,
        });
      } catch (error) {
        this.logger.error('Authorization failed', { error });
        await reply.status(403).send({
          error: 'Forbidden',
          message: 'Authorization failed',
        });
      }
    };
  };

  /**
   * Optional authentication middleware - doesn't fail if no token provided
   */
  optionalAuth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const authHeader = request.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return; // No token provided, continue without authentication
      }

      const token = authHeader.substring(7);
      const session = await this.authService.validateToken(token);
      
      if (session) {
        request.user = session;
        request.sessionId = session.sessionId;
        
        this.logger.debug('Optional authentication successful', { 
          userId: session.userId,
          sessionId: session.sessionId 
        });
      }
    } catch (error) {
      this.logger.warn('Optional authentication failed', { error });
      // Continue without authentication
    }
  };

  /**
   * Middleware to check if user owns resource or has admin role
   */
  ownerOrAdmin = (getUserIdFromParams: (request: FastifyRequest) => string) => {
    return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        if (!request.user) {
          await reply.status(401).send({
            error: 'Unauthorized',
            message: 'Authentication required',
          });
          return;
        }

        const resourceUserId = getUserIdFromParams(request);
        const currentUserId = request.user.userId;
        const isAdmin = request.user.roles.includes(UserRole.ADMIN) || 
                       request.user.roles.includes(UserRole.SUPER_ADMIN);

        if (currentUserId !== resourceUserId && !isAdmin) {
          this.logger.warn('Access denied: user not owner and not admin', {
            currentUserId,
            resourceUserId,
            userRoles: request.user.roles,
          });

          await reply.status(403).send({
            error: 'Forbidden',
            message: 'Access denied: insufficient permissions',
          });
          return;
        }

        this.logger.debug('Owner or admin access granted', {
          currentUserId,
          resourceUserId,
          isAdmin,
        });
      } catch (error) {
        this.logger.error('Owner/admin check failed', { error });
        await reply.status(403).send({
          error: 'Forbidden',
          message: 'Access check failed',
        });
      }
    };
  };

  /**
   * Middleware to ensure user account is active
   */
  requireActiveUser = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      // Get fresh session to check if user is still active
      const session = await this.authService.getSession(request.user.sessionId);
      
      if (!session) {
        await reply.status(401).send({
          error: 'Unauthorized',
          message: 'Session expired or invalid',
        });
        return;
      }

      // Update request with fresh session data
      request.user = session;
    } catch (error) {
      this.logger.error('Active user check failed', { error });
      await reply.status(401).send({
        error: 'Unauthorized',
        message: 'User status verification failed',
      });
    }
  };

  /**
   * Rate limiting for authentication endpoints
   */
  authRateLimit = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // This would be implemented with a proper rate limiting strategy
    // For now, we'll rely on Fastify's rate limit plugin
    return;
  };
}
