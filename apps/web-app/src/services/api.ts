import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { keycloakService } from './keycloak';
import toast from 'react-hot-toast';

// API configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 30000, // 30 seconds
};

// Create axios instance
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor to add authentication
apiClient.interceptors.request.use(
  (config) => {
    const authHeader = keycloakService.getAuthorizationHeader();
    if (authHeader) {
      config.headers.Authorization = authHeader;
    }
    
    // Add organization context if available
    const userInfo = keycloakService.getUserInfo();
    if (userInfo?.organizationId) {
      config.headers['X-Organization-ID'] = userInfo.organizationId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Unauthorized - try to refresh token
          try {
            await keycloakService.refreshToken();
            // Retry the original request
            return apiClient.request(error.config);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            keycloakService.login();
            toast.error('Session expired. Please login again.');
            return Promise.reject(refreshError);
          }
          
        case 403:
          toast.error(data?.message || 'Access denied. You don\'t have permission for this action.');
          break;
          
        case 404:
          toast.error(data?.message || 'Resource not found.');
          break;
          
        case 422:
          toast.error(data?.message || 'Validation failed. Please check your input.');
          break;
          
        case 429:
          toast.error('Too many requests. Please wait a moment and try again.');
          break;
          
        case 500:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error(data?.message || 'An unexpected error occurred.');
      }
    } else {
      // Network error
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Generic API service class
class ApiService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  // Generic GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Generic POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // Generic PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // Generic PATCH request
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // Generic DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

// Create API service instance
export const apiService = new ApiService(apiClient);

// Authentication API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    apiService.post('/api/v1/auth/login', credentials),
    
  logout: (refreshToken?: string) =>
    apiService.post('/api/v1/auth/logout', { refreshToken }),
    
  refreshToken: (refreshToken: string) =>
    apiService.post('/api/v1/auth/refresh', { refreshToken }),
    
  getCurrentUser: () =>
    apiService.get('/api/v1/auth/me'),
    
  validateToken: () =>
    apiService.post('/api/v1/auth/validate'),
};

// CRM API
export const crmAPI = {
  // Leads
  leads: {
    list: (params?: any) => apiService.get('/api/v1/crm/leads', { params }),
    get: (id: string) => apiService.get(`/api/v1/crm/leads/${id}`),
    create: (data: any) => apiService.post('/api/v1/crm/leads', data),
    update: (id: string, data: any) => apiService.put(`/api/v1/crm/leads/${id}`, data),
    delete: (id: string) => apiService.delete(`/api/v1/crm/leads/${id}`),
    convert: (id: string, data: any) => apiService.post(`/api/v1/crm/leads/${id}/convert`, data),
    assign: (id: string, assignedToId: string) => 
      apiService.put(`/api/v1/crm/leads/${id}/assign`, { assignedToId }),
    bulkAssign: (leadIds: string[], assignedToId: string) =>
      apiService.post('/api/v1/crm/leads/bulk-assign', { leadIds, assignedToId }),
    bulkUpdateStatus: (leadIds: string[], status: string) =>
      apiService.post('/api/v1/crm/leads/bulk-status', { leadIds, status }),
    analytics: () => apiService.get('/api/v1/crm/leads/analytics'),
    sources: () => apiService.get('/api/v1/crm/leads/sources'),
  },
  
  // Accounts (when implemented)
  accounts: {
    list: (params?: any) => apiService.get('/api/v1/crm/accounts', { params }),
    get: (id: string) => apiService.get(`/api/v1/crm/accounts/${id}`),
    create: (data: any) => apiService.post('/api/v1/crm/accounts', data),
    update: (id: string, data: any) => apiService.put(`/api/v1/crm/accounts/${id}`, data),
    delete: (id: string) => apiService.delete(`/api/v1/crm/accounts/${id}`),
  },
  
  // Contacts (when implemented)
  contacts: {
    list: (params?: any) => apiService.get('/api/v1/crm/contacts', { params }),
    get: (id: string) => apiService.get(`/api/v1/crm/contacts/${id}`),
    create: (data: any) => apiService.post('/api/v1/crm/contacts', data),
    update: (id: string, data: any) => apiService.put(`/api/v1/crm/contacts/${id}`, data),
    delete: (id: string) => apiService.delete(`/api/v1/crm/contacts/${id}`),
  },
  
  // Opportunities (when implemented)
  opportunities: {
    list: (params?: any) => apiService.get('/api/v1/crm/opportunities', { params }),
    get: (id: string) => apiService.get(`/api/v1/crm/opportunities/${id}`),
    create: (data: any) => apiService.post('/api/v1/crm/opportunities', data),
    update: (id: string, data: any) => apiService.put(`/api/v1/crm/opportunities/${id}`, data),
    delete: (id: string) => apiService.delete(`/api/v1/crm/opportunities/${id}`),
  },
};

// File upload helper
export const uploadFile = async (file: File, endpoint: string): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiService.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Download helper
export const downloadFile = async (url: string, filename?: string): Promise<void> => {
  try {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    toast.error('Failed to download file');
    throw error;
  }
};

export default apiClient;
