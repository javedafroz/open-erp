import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { keycloakService, KeycloakUserInfo } from '../services/keycloak';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: KeycloakUserInfo | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  register: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  refreshToken: () => Promise<boolean>;
  getToken: () => string | undefined;
}

// Create auth context
export const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth hook implementation
export const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<KeycloakUserInfo | null>(null);

  // Initialize authentication
  const initAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const authenticated = await keycloakService.init();
      
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userInfo = keycloakService.getUserInfo();
        setUser(userInfo);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async () => {
    try {
      await keycloakService.login();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await keycloakService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async () => {
    try {
      await keycloakService.register();
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, []);

  // Check if user has role
  const hasRole = useCallback((role: string) => {
    return keycloakService.hasRole(role);
  }, []);

  // Check if user has any role
  const hasAnyRole = useCallback((roles: string[]) => {
    return keycloakService.hasAnyRole(roles);
  }, []);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const refreshed = await keycloakService.refreshToken();
      if (refreshed) {
        const userInfo = keycloakService.getUserInfo();
        setUser(userInfo);
      }
      return refreshed;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }, []);

  // Get token
  const getToken = useCallback(() => {
    return keycloakService.getToken();
  }, []);

  // Initialize on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    register,
    hasRole,
    hasAnyRole,
    refreshToken,
    getToken,
  };
};

// Role-based access control hooks
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login();
    }
  }, [isAuthenticated, isLoading, login]);

  return { isAuthenticated, isLoading };
};

export const useRequireRole = (requiredRole: string) => {
  const { hasRole, isLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasAccess(hasRole(requiredRole));
    }
  }, [hasRole, requiredRole, isLoading]);

  return { hasAccess, isLoading };
};

export const useRequireAnyRole = (requiredRoles: string[]) => {
  const { hasAnyRole, isLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasAccess(hasAnyRole(requiredRoles));
    }
  }, [hasAnyRole, requiredRoles, isLoading]);

  return { hasAccess, isLoading };
};

// Permission-based hooks
export const useCanAccess = (resource: string, action: string) => {
  const { user, hasRole } = useAuth();
  
  // Simple role-based access control
  // In a real application, you might have more complex permission logic
  const canAccess = useCallback(() => {
    if (!user) return false;
    
    // Super admin can access everything
    if (hasRole('super_admin')) return true;
    
    // Admin can access most things
    if (hasRole('admin') && action !== 'delete') return true;
    
    // Resource-specific permissions
    switch (resource) {
      case 'leads':
        return hasRole('sales_rep') || hasRole('sales_manager') || hasRole('admin');
      case 'accounts':
        return hasRole('sales_rep') || hasRole('sales_manager') || hasRole('admin');
      case 'contacts':
        return hasRole('sales_rep') || hasRole('sales_manager') || hasRole('admin');
      case 'opportunities':
        return hasRole('sales_rep') || hasRole('sales_manager') || hasRole('admin');
      case 'reports':
        return hasRole('sales_manager') || hasRole('admin');
      case 'admin':
        return hasRole('admin') || hasRole('super_admin');
      default:
        return false;
    }
  }, [user, hasRole, resource, action]);

  return canAccess();
};
