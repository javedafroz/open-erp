import Keycloak from 'keycloak-js';

// Keycloak configuration
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'erp-system',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'erp-frontend',
};

// Initialize Keycloak
const keycloak = new Keycloak(keycloakConfig);

// Keycloak initialization options
export const initOptions = {
  onLoad: 'check-sso' as const,
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  checkLoginIframe: false,
  pkceMethod: 'S256' as const,
};

export default keycloak;

// Keycloak utility functions
export const keycloakService = {
  // Initialize Keycloak
  async init() {
    try {
      const authenticated = await keycloak.init(initOptions);
      
      // Set up token refresh
      if (authenticated) {
        // Refresh token 30 seconds before it expires
        const refreshTime = (keycloak.tokenParsed?.exp || 0) - Math.floor(Date.now() / 1000) - 30;
        if (refreshTime > 0) {
          setTimeout(() => {
            this.refreshToken();
          }, refreshTime * 1000);
        }
      }
      
      return authenticated;
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
      throw error;
    }
  },

  // Login user
  async login() {
    try {
      await keycloak.login({
        redirectUri: window.location.origin,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      await keycloak.logout({
        redirectUri: window.location.origin,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  // Refresh token
  async refreshToken() {
    try {
      const refreshed = await keycloak.updateToken(30);
      if (refreshed) {
        console.log('Token refreshed');
        // Schedule next refresh
        const refreshTime = (keycloak.tokenParsed?.exp || 0) - Math.floor(Date.now() / 1000) - 30;
        if (refreshTime > 0) {
          setTimeout(() => {
            this.refreshToken();
          }, refreshTime * 1000);
        }
      }
      return refreshed;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh fails, redirect to login
      this.login();
      throw error;
    }
  },

  // Get access token
  getToken() {
    return keycloak.token;
  },

  // Get parsed token
  getParsedToken() {
    return keycloak.tokenParsed;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return keycloak.authenticated;
  },

  // Get user info
  getUserInfo() {
    if (!keycloak.tokenParsed) return null;
    
    return {
      id: keycloak.tokenParsed.sub || 'unknown',
      username: keycloak.tokenParsed.preferred_username,
      email: keycloak.tokenParsed.email,
      firstName: keycloak.tokenParsed.given_name,
      lastName: keycloak.tokenParsed.family_name,
      fullName: keycloak.tokenParsed.name,
      roles: keycloak.tokenParsed.realm_access?.roles || [],
      organizationId: keycloak.tokenParsed.organization_id, // Custom claim
    };
  },

  // Check if user has role
  hasRole(role: string) {
    return keycloak.hasRealmRole(role);
  },

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]) {
    return roles.some(role => this.hasRole(role));
  },

  // Get authorization header
  getAuthorizationHeader() {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  },

  // Account management
  async accountManagement() {
    try {
      await keycloak.accountManagement();
    } catch (error) {
      console.error('Failed to open account management:', error);
      throw error;
    }
  },

  // Register user
  async register() {
    try {
      await keycloak.register({
        redirectUri: window.location.origin,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },
};

// Event handlers
keycloak.onAuthSuccess = () => {
  console.log('Authentication successful');
};

keycloak.onAuthError = (error) => {
  console.error('Authentication error:', error);
};

keycloak.onAuthLogout = () => {
  console.log('User logged out');
};

keycloak.onTokenExpired = () => {
  console.log('Token expired, refreshing...');
  keycloakService.refreshToken();
};

// Export types
export interface KeycloakUserInfo {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  roles: string[];
  organizationId?: string;
}
