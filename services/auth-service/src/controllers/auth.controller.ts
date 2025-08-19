import { FastifyRequest, FastifyReply, RouteShorthandOptions } from 'fastify';
import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
import { AuthService, LoginRequest, RefreshTokenRequest } from '../services/auth.service';
import { createLogger } from '@erp/utils';

// DTOs for request validation
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LogoutDto {
  @IsString()
  @IsNotEmpty()
  refreshToken?: string;
}

export class AuthController {
  private authService: AuthService;
  private logger = createLogger('AuthController');

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  // Schema definitions for Swagger documentation
  private loginSchema: RouteShorthandOptions = {
    schema: {
      description: 'Authenticate user with username and password',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', description: 'Username or email' },
          password: { type: 'string', description: 'User password', minLength: 6 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'number' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                roles: { type: 'array', items: { type: 'string' } },
              },
            },
            sessionId: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  };

  private refreshTokenSchema: RouteShorthandOptions = {
    schema: {
      description: 'Refresh access token using refresh token',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'number' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                roles: { type: 'array', items: { type: 'string' } },
              },
            },
            sessionId: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  };

  /**
   * POST /api/v1/auth/login
   */
  login = async (
    request: FastifyRequest<{ Body: LoginRequest }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { username, password } = request.body;

      this.logger.info('Login attempt', { username });

      const loginResult = await this.authService.login({ username, password });

      await reply.status(200).send({
        success: true,
        data: loginResult,
        message: 'Login successful',
      });

      this.logger.info('Login successful', { 
        username, 
        userId: loginResult.user.id,
        sessionId: loginResult.sessionId 
      });
    } catch (error: any) {
      this.logger.error('Login failed', { 
        username: request.body?.username, 
        error: error.message 
      });

      await reply.status(401).send({
        success: false,
        error: 'Authentication Failed',
        message: error.message || 'Invalid credentials',
      });
    }
  };

  /**
   * POST /api/v1/auth/refresh
   */
  refreshToken = async (
    request: FastifyRequest<{ Body: RefreshTokenRequest }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { refreshToken } = request.body;

      this.logger.info('Token refresh attempt');

      const refreshResult = await this.authService.refreshToken({ refreshToken });

      await reply.status(200).send({
        success: true,
        data: refreshResult,
        message: 'Token refreshed successfully',
      });

      this.logger.info('Token refresh successful', { 
        userId: refreshResult.user.id,
        sessionId: refreshResult.sessionId 
      });
    } catch (error: any) {
      this.logger.error('Token refresh failed', { error: error.message });

      await reply.status(400).send({
        success: false,
        error: 'Token Refresh Failed',
        message: error.message || 'Invalid refresh token',
      });
    }
  };

  /**
   * POST /api/v1/auth/logout
   */
  logout = async (
    request: FastifyRequest<{ Body: LogoutDto }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const authHeader = request.headers.authorization;
      const { refreshToken } = request.body;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        await reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Missing access token',
        });
        return;
      }

      const accessToken = authHeader.substring(7);
      
      this.logger.info('Logout attempt', { hasRefreshToken: !!refreshToken });

      await this.authService.logout(accessToken, refreshToken);

      await reply.status(200).send({
        success: true,
        message: 'Logout successful',
      });

      this.logger.info('Logout successful');
    } catch (error: any) {
      this.logger.error('Logout failed', { error: error.message });

      await reply.status(400).send({
        success: false,
        error: 'Logout Failed',
        message: error.message || 'Logout failed',
      });
    }
  };

  /**
   * GET /api/v1/auth/me
   */
  getCurrentUser = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      await reply.status(200).send({
        success: true,
        data: {
          id: request.user.userId,
          username: request.user.username,
          email: request.user.email,
          firstName: request.user.firstName,
          lastName: request.user.lastName,
          roles: request.user.roles,
          sessionId: request.user.sessionId,
          lastActivity: request.user.lastActivity,
        },
      });
    } catch (error: any) {
      this.logger.error('Get current user failed', { error: error.message });

      await reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to get user information',
      });
    }
  };

  /**
   * GET /api/v1/auth/sessions
   */
  getUserSessions = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const sessions = await this.authService.getUserSessions(request.user.userId);

      await reply.status(200).send({
        success: true,
        data: {
          sessions: sessions.map(session => ({
            sessionId: session.sessionId,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            current: session.sessionId === request.user?.sessionId,
          })),
          total: sessions.length,
        },
      });
    } catch (error: any) {
      this.logger.error('Get user sessions failed', { error: error.message });

      await reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to get user sessions',
      });
    }
  };

  /**
   * DELETE /api/v1/auth/sessions/:sessionId
   */
  revokeSession = async (
    request: FastifyRequest<{ Params: { sessionId: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { sessionId } = request.params;

      // Check if user is revoking their own session or has admin rights
      const userSessions = await this.authService.getUserSessions(request.user.userId);
      const targetSession = userSessions.find(s => s.sessionId === sessionId);

      if (!targetSession) {
        await reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Session not found',
        });
        return;
      }

      await this.authService.revokeSession(sessionId);

      await reply.status(200).send({
        success: true,
        message: 'Session revoked successfully',
      });

      this.logger.info('Session revoked', { sessionId, userId: request.user.userId });
    } catch (error: any) {
      this.logger.error('Session revocation failed', { error: error.message });

      await reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to revoke session',
      });
    }
  };

  /**
   * DELETE /api/v1/auth/sessions
   */
  revokeAllSessions = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      await this.authService.revokeAllUserSessions(request.user.userId);

      await reply.status(200).send({
        success: true,
        message: 'All sessions revoked successfully',
      });

      this.logger.info('All sessions revoked', { userId: request.user.userId });
    } catch (error: any) {
      this.logger.error('All sessions revocation failed', { error: error.message });

      await reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to revoke all sessions',
      });
    }
  };

  /**
   * POST /api/v1/auth/validate
   */
  validateToken = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        await reply.status(400).send({
          success: false,
          valid: false,
          message: 'Missing or invalid authorization header',
        });
        return;
      }

      const token = authHeader.substring(7);
      const session = await this.authService.validateToken(token);

      if (session) {
        await reply.status(200).send({
          success: true,
          valid: true,
          data: {
            userId: session.userId,
            username: session.username,
            roles: session.roles,
            sessionId: session.sessionId,
          },
        });
      } else {
        await reply.status(200).send({
          success: true,
          valid: false,
          message: 'Invalid or expired token',
        });
      }
    } catch (error: any) {
      this.logger.error('Token validation failed', { error: error.message });

      await reply.status(500).send({
        success: false,
        valid: false,
        error: 'Internal Server Error',
        message: 'Token validation failed',
      });
    }
  };

  // Get route options
  getLoginOptions(): RouteShorthandOptions {
    return this.loginSchema;
  }

  getRefreshTokenOptions(): RouteShorthandOptions {
    return this.refreshTokenSchema;
  }
}
