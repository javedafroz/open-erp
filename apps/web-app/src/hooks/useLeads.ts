import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmAPI } from '../services/api';
import toast from 'react-hot-toast';

// Query keys for React Query
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (params: any) => [...leadKeys.lists(), params] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
  analytics: () => [...leadKeys.all, 'analytics'] as const,
  sources: () => [...leadKeys.all, 'sources'] as const,
};

// List leads with filtering and pagination
export const useLeads = (params?: {
  search?: string;
  status?: string[];
  page?: number;
  limit?: number;
  [key: string]: any;
}) => {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => crmAPI.leads.list(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single lead
export const useLead = (id: string, enabled = true) => {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => crmAPI.leads.get(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Get lead analytics
export const useLeadAnalytics = () => {
  return useQuery({
    queryKey: leadKeys.analytics(),
    queryFn: () => crmAPI.leads.analytics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get lead sources
export const useLeadSources = () => {
  return useQuery({
    queryKey: leadKeys.sources(),
    queryFn: () => crmAPI.leads.sources(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Create lead mutation
export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => crmAPI.leads.create(data),
    onSuccess: (response) => {
      // Invalidate leads list to refetch
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.analytics() });
      
      toast.success(response.message || 'Lead created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create lead');
    },
  });
};

// Update lead mutation
export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      crmAPI.leads.update(id, data),
    onSuccess: (response, variables) => {
      // Update cached data
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.analytics() });
      
      toast.success(response.message || 'Lead updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update lead');
    },
  });
};

// Delete lead mutation
export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crmAPI.leads.delete(id),
    onSuccess: (response) => {
      // Invalidate leads list
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.analytics() });
      
      toast.success(response.message || 'Lead deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete lead');
    },
  });
};

// Convert lead mutation
export const useConvertLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      crmAPI.leads.convert(id, data),
    onSuccess: (response, variables) => {
      // Update cached data
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.analytics() });
      
      // Also invalidate accounts and contacts if they were created
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      
      toast.success(response.message || 'Lead converted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to convert lead');
    },
  });
};

// Assign lead mutation
export const useAssignLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedToId }: { id: string; assignedToId: string }) =>
      crmAPI.leads.assign(id, assignedToId),
    onSuccess: (response, variables) => {
      // Update cached data
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      
      toast.success(response.message || 'Lead assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign lead');
    },
  });
};

// Bulk assign leads mutation
export const useBulkAssignLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadIds, assignedToId }: { leadIds: string[]; assignedToId: string }) =>
      crmAPI.leads.bulkAssign(leadIds, assignedToId),
    onSuccess: (response) => {
      // Invalidate all lead queries
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
      
      toast.success(response.message || 'Leads assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign leads');
    },
  });
};

// Bulk update lead status mutation
export const useBulkUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadIds, status }: { leadIds: string[]; status: string }) =>
      crmAPI.leads.bulkUpdateStatus(leadIds, status),
    onSuccess: (response) => {
      // Invalidate all lead queries
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
      
      toast.success(response.message || 'Lead status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update lead status');
    },
  });
};

// Custom hook for lead management
export const useLeadManagement = () => {
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();
  const convertMutation = useConvertLead();
  const assignMutation = useAssignLead();
  const bulkAssignMutation = useBulkAssignLeads();
  const bulkStatusMutation = useBulkUpdateLeadStatus();

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    convert: convertMutation.mutate,
    assign: assignMutation.mutate,
    bulkAssign: bulkAssignMutation.mutate,
    bulkUpdateStatus: bulkStatusMutation.mutate,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isConverting: convertMutation.isPending,
    isAssigning: assignMutation.isPending,
    isBulkAssigning: bulkAssignMutation.isPending,
    isBulkUpdatingStatus: bulkStatusMutation.isPending,
    
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    convertError: convertMutation.error,
    assignError: assignMutation.error,
    bulkAssignError: bulkAssignMutation.error,
    bulkStatusError: bulkStatusMutation.error,
  };
};
