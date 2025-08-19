import KcAdminClient from '@keycloak/keycloak-admin-client';
import axios, { AxiosResponse } from 'axios';
import { createLogger } from '@erp/utils';
import { User } from '@erp/types';
import { config } from '../config';

export interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  id_token?: string;
  scope: string;
}

export interface KeycloakUserInfo {
  sub: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
}

export class KeycloakService {
  private kcAdminClient: KcAdminClient;
  private logger = createLogger('KeycloakService');

  constructor() {
    this.kcAdminClient = new KcAdminClient({
      baseUrl: config.keycloak['auth-server-url'],
      realmName: 'master', // Admin operations use master realm
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.kcAdminClient.auth({
        username: config.keycloak.adminUsername,
        password: config.keycloak.adminPassword,
        grantType: 'password',
        clientId: 'admin-cli',
      });

      this.logger.info('Keycloak admin client initialized successfully');
      
      // Set up automatic token refresh
      setInterval(async () => {
        try {
          await this.kcAdminClient.auth({
            username: config.keycloak.adminUsername,
            password: config.keycloak.adminPassword,
            grantType: 'password',
            clientId: 'admin-cli',
          });
        } catch (error) {
          this.logger.error('Failed to refresh Keycloak admin token', { error });
        }
      }, 58 * 60 * 1000); // Refresh every 58 minutes
    } catch (error) {
      this.logger.error('Failed to initialize Keycloak admin client', { error });
      throw error;
    }
  }

  async authenticateUser(username: string, password: string): Promise<KeycloakTokenResponse> {
    try {
      const tokenUrl = `${config.keycloak['auth-server-url']}/realms/${config.keycloak.realm}/protocol/openid-connect/token`;
      
      const response: AxiosResponse<KeycloakTokenResponse> = await axios.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'password',
          client_id: config.keycloak.resource,
          client_secret: config.keycloak.clientSecret,
          username,
          password,
          scope: 'openid profile email',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.logger.info('User authenticated successfully', { username });
      return response.data;
    } catch (error: any) {
      this.logger.error('Authentication failed', { username, error: error.message });
      throw new Error('Authentication failed');
    }
  }

  async refreshToken(refreshToken: string): Promise<KeycloakTokenResponse> {
    try {
      const tokenUrl = `${config.keycloak['auth-server-url']}/realms/${config.keycloak.realm}/protocol/openid-connect/token`;
      
      const response: AxiosResponse<KeycloakTokenResponse> = await axios.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: config.keycloak.resource,
          client_secret: config.keycloak.clientSecret,
          refresh_token: refreshToken,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.logger.info('Token refreshed successfully');
      return response.data;
    } catch (error: any) {
      this.logger.error('Token refresh failed', { error: error.message });
      throw new Error('Token refresh failed');
    }
  }

  async getUserInfo(accessToken: string): Promise<KeycloakUserInfo> {
    try {
      const userInfoUrl = `${config.keycloak['auth-server-url']}/realms/${config.keycloak.realm}/protocol/openid-connect/userinfo`;
      
      const response: AxiosResponse<KeycloakUserInfo> = await axios.get(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to get user info', { error: error.message });
      throw new Error('Failed to get user info');
    }
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const introspectUrl = `${config.keycloak['auth-server-url']}/realms/${config.keycloak.realm}/protocol/openid-connect/token/introspect`;
      
      const response = await axios.post(
        introspectUrl,
        new URLSearchParams({
          token: accessToken,
          client_id: config.keycloak.resource,
          client_secret: config.keycloak.clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.active === true;
    } catch (error: any) {
      this.logger.error('Token validation failed', { error: error.message });
      return false;
    }
  }

  async createUser(userData: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    enabled?: boolean;
  }): Promise<string> {
    try {
      // Set realm for user operations
      this.kcAdminClient.setConfig({
        realmName: config.keycloak.realm,
      });

      const user = await this.kcAdminClient.users.create({
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: userData.enabled ?? true,
        emailVerified: true,
      });

      if (userData.password) {
        await this.kcAdminClient.users.resetPassword({
          id: user.id,
          credential: {
            temporary: false,
            type: 'password',
            value: userData.password,
          },
        });
      }

      this.logger.info('User created successfully', { userId: user.id, username: userData.username });
      return user.id;
    } catch (error: any) {
      this.logger.error('Failed to create user', { error: error.message });
      throw new Error('Failed to create user');
    }
  }

  async updateUser(userId: string, userData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    enabled?: boolean;
  }): Promise<void> {
    try {
      this.kcAdminClient.setConfig({
        realmName: config.keycloak.realm,
      });

      await this.kcAdminClient.users.update(
        { id: userId },
        {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          enabled: userData.enabled,
        }
      );

      this.logger.info('User updated successfully', { userId });
    } catch (error: any) {
      this.logger.error('Failed to update user', { userId, error: error.message });
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      this.kcAdminClient.setConfig({
        realmName: config.keycloak.realm,
      });

      await this.kcAdminClient.users.del({ id: userId });
      this.logger.info('User deleted successfully', { userId });
    } catch (error: any) {
      this.logger.error('Failed to delete user', { userId, error: error.message });
      throw new Error('Failed to delete user');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const logoutUrl = `${config.keycloak['auth-server-url']}/realms/${config.keycloak.realm}/protocol/openid-connect/logout`;
      
      await axios.post(
        logoutUrl,
        new URLSearchParams({
          client_id: config.keycloak.resource,
          client_secret: config.keycloak.clientSecret,
          refresh_token: refreshToken,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.logger.info('User logged out successfully');
    } catch (error: any) {
      this.logger.error('Logout failed', { error: error.message });
      throw new Error('Logout failed');
    }
  }
}
