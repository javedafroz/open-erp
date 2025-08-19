import { generateUUID, createLogger } from '@erp/utils';
import { KeycloakService, KeycloakTokenResponse, KeycloakUserInfo } from './keycloak.service';
import { RedisService } from './redis.service';

export interface AuthSession {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  sessionId: string;
  createdAt: Date;
  lastActivity: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
  sessionId: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export class AuthService {
  private keycloakService: KeycloakService;
  private redisService: RedisService;
  private logger = createLogger('AuthService');

  constructor() {
    this.keycloakService = new KeycloakService();
    this.redisService = new RedisService();
  }

  async initialize(): Promise<void> {
    try {
      await Promise.all([
        this.keycloakService.initialize(),
        this.redisService.connect(),
      ]);
      this.logger.info('Auth service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize auth service', { error });
      throw error;
    }
  }

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    try {
      // Authenticate with Keycloak
      const tokenResponse: KeycloakTokenResponse = await this.keycloakService.authenticateUser(
        loginRequest.username,
        loginRequest.password
      );

      // Get user information
      const userInfo: KeycloakUserInfo = await this.keycloakService.getUserInfo(tokenResponse.access_token);

      // Create session
      const sessionId = generateUUID();
      const session: AuthSession = {
        userId: userInfo.sub,
        username: userInfo.preferred_username,
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        roles: [], // TODO: Extract roles from token
        sessionId,
        createdAt: new Date(),
        lastActivity: new Date(),
      };

      // Store session in Redis
      await this.redisService.setSession(sessionId, session, tokenResponse.expires_in);

      // Store tokens in Redis for validation
      await this.redisService.set(
        `token:${tokenResponse.access_token}`,
        { userId: userInfo.sub, sessionId },
        tokenResponse.expires_in
      );

      await this.redisService.set(
        `refresh_token:${tokenResponse.refresh_token}`,
        { userId: userInfo.sub, sessionId },
        tokenResponse.refresh_expires_in
      );

      this.logger.info('User logged in successfully', { 
        userId: userInfo.sub, 
        username: userInfo.preferred_username,
        sessionId 
      });

      return {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresIn: tokenResponse.expires_in,
        user: {
          id: userInfo.sub,
          username: userInfo.preferred_username,
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          roles: [], // TODO: Extract roles from token
        },
        sessionId,
      };
    } catch (error) {
      this.logger.error('Login failed', { username: loginRequest.username, error });
      throw error;
    }
  }

  async refreshToken(request: RefreshTokenRequest): Promise<LoginResponse> {
    try {
      // Check if refresh token exists in Redis
      const tokenData = await this.redisService.get(`refresh_token:${request.refreshToken}`);
      if (!tokenData) {
        throw new Error('Invalid refresh token');
      }

      // Refresh token with Keycloak
      const tokenResponse = await this.keycloakService.refreshToken(request.refreshToken);

      // Get user information
      const userInfo = await this.keycloakService.getUserInfo(tokenResponse.access_token);

      // Update session
      const session = await this.redisService.getSession<AuthSession>(tokenData.sessionId);
      if (session) {
        session.lastActivity = new Date();
        await this.redisService.setSession(tokenData.sessionId, session, tokenResponse.expires_in);
      }

      // Clean up old tokens
      await Promise.all([
        this.redisService.delete(`refresh_token:${request.refreshToken}`),
        this.redisService.blacklistToken(request.refreshToken, tokenResponse.refresh_expires_in),
      ]);

      // Store new tokens
      await this.redisService.set(
        `token:${tokenResponse.access_token}`,
        { userId: userInfo.sub, sessionId: tokenData.sessionId },
        tokenResponse.expires_in
      );

      await this.redisService.set(
        `refresh_token:${tokenResponse.refresh_token}`,
        { userId: userInfo.sub, sessionId: tokenData.sessionId },
        tokenResponse.refresh_expires_in
      );

      this.logger.info('Token refreshed successfully', { userId: userInfo.sub });

      return {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresIn: tokenResponse.expires_in,
        user: {
          id: userInfo.sub,
          username: userInfo.preferred_username,
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          roles: [],
        },
        sessionId: tokenData.sessionId,
      };
    } catch (error) {
      this.logger.error('Token refresh failed', { error });
      throw error;
    }
  }

  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      // Get token data from Redis
      const tokenData = await this.redisService.get(`token:${accessToken}`);
      
      if (tokenData && tokenData.sessionId) {
        // Delete session
        await this.redisService.deleteSession(tokenData.sessionId);
        this.logger.info('Session deleted', { sessionId: tokenData.sessionId });
      }

      // Blacklist tokens
      const promises = [this.redisService.blacklistToken(accessToken, 3600)];
      
      if (refreshToken) {
        promises.push(this.redisService.blacklistToken(refreshToken, 7 * 24 * 3600));
        
        // Logout from Keycloak
        try {
          await this.keycloakService.logout(refreshToken);
        } catch (error) {
          this.logger.warn('Keycloak logout failed', { error });
        }
      }

      await Promise.all(promises);

      // Clean up token storage
      await Promise.all([
        this.redisService.delete(`token:${accessToken}`),
        refreshToken ? this.redisService.delete(`refresh_token:${refreshToken}`) : Promise.resolve(),
      ]);

      this.logger.info('User logged out successfully', { userId: tokenData?.userId });
    } catch (error) {
      this.logger.error('Logout failed', { error });
      throw error;
    }
  }

  async validateToken(accessToken: string): Promise<AuthSession | null> {
    try {
      // Check if token is blacklisted
      if (await this.redisService.isTokenBlacklisted(accessToken)) {
        return null;
      }

      // Get token data from Redis
      const tokenData = await this.redisService.get(`token:${accessToken}`);
      if (!tokenData || !tokenData.sessionId) {
        return null;
      }

      // Validate with Keycloak
      const isValid = await this.keycloakService.validateToken(accessToken);
      if (!isValid) {
        return null;
      }

      // Get session
      const session = await this.redisService.getSession<AuthSession>(tokenData.sessionId);
      if (!session) {
        return null;
      }

      // Update last activity
      session.lastActivity = new Date();
      await this.redisService.setSession(tokenData.sessionId, session);

      return session;
    } catch (error) {
      this.logger.error('Token validation failed', { error });
      return null;
    }
  }

  async getSession(sessionId: string): Promise<AuthSession | null> {
    try {
      return await this.redisService.getSession<AuthSession>(sessionId);
    } catch (error) {
      this.logger.error('Failed to get session', { sessionId, error });
      return null;
    }
  }

  async getUserSessions(userId: string): Promise<AuthSession[]> {
    try {
      const sessionKeys = await this.redisService.getKeys(`session:*`);
      const sessions: AuthSession[] = [];

      for (const key of sessionKeys) {
        const sessionId = key.replace('session:', '');
        const session = await this.redisService.getSession<AuthSession>(sessionId);
        
        if (session && session.userId === userId) {
          sessions.push(session);
        }
      }

      return sessions;
    } catch (error) {
      this.logger.error('Failed to get user sessions', { userId, error });
      return [];
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    try {
      await this.redisService.deleteSession(sessionId);
      this.logger.info('Session revoked', { sessionId });
    } catch (error) {
      this.logger.error('Failed to revoke session', { sessionId, error });
      throw error;
    }
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    try {
      const sessions = await this.getUserSessions(userId);
      
      const promises = sessions.map(session => 
        this.redisService.deleteSession(session.sessionId)
      );
      
      await Promise.all(promises);
      
      this.logger.info('All user sessions revoked', { userId, count: sessions.length });
    } catch (error) {
      this.logger.error('Failed to revoke all user sessions', { userId, error });
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      await this.redisService.disconnect();
      this.logger.info('Auth service shutdown completed');
    } catch (error) {
      this.logger.error('Error during auth service shutdown', { error });
    }
  }
}
