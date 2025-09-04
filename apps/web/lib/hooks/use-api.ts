import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Project, Job, Template, User, TeamMember, BillingUsage, Invoice, ApiKey, ProjectFilters, TemplateFilters } from '../types';

// Projects API hooks
export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
      
      const response = await fetch(`/api/projects?${params}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      return response.json() as Promise<Project>;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; domain?: string; pullPublicData: boolean }) => {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.domain) formData.append('domain', data.domain);
      formData.append('pullPublicData', data.pullPublicData.toString());
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create project');
      return response.json() as Promise<Project>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUploadFiles() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, files }: { projectId: string; files: File[] }) => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload files');
      return response.json();
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

export function useGenerateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}/generate`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to start generation');
      return response.json() as Promise<{ jobId: string }>;
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

// Jobs API hooks
export function useJob(id: string, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${id}`);
      if (!response.ok) throw new Error('Failed to fetch job');
      return response.json() as Promise<Job>;
    },
    enabled: !!id,
    refetchInterval: options?.refetchInterval || 4000, // Poll every 4 seconds
  });
}

// Templates API hooks
export function useTemplates(filters?: TemplateFilters) {
  return useQuery({
    queryKey: ['templates', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.industry) params.append('industry', filters.industry);
      if (filters?.search) params.append('search', filters.search);
      
      const response = await fetch(`/api/templates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json() as Promise<Template[]>;
    },
  });
}

// User API hooks
export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json() as Promise<User>;
    },
  });
}

// Team API hooks
export function useTeam() {
  return useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const response = await fetch('/api/team');
      if (!response.ok) throw new Error('Failed to fetch team');
      return response.json() as Promise<TeamMember[]>;
    },
  });
}

// Billing API hooks
export function useBillingUsage() {
  return useQuery({
    queryKey: ['billing', 'usage'],
    queryFn: async () => {
      const response = await fetch('/api/billing/usage');
      if (!response.ok) throw new Error('Failed to fetch billing usage');
      return response.json() as Promise<BillingUsage[]>;
    },
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: async () => {
      const response = await fetch('/api/billing/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return response.json() as Promise<Invoice[]>;
    },
  });
}

// API Keys hooks
export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const response = await fetch('/api/api-keys');
      if (!response.ok) throw new Error('Failed to fetch API keys');
      return response.json() as Promise<ApiKey[]>;
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to create API key');
      return response.json() as Promise<ApiKey>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

// Download hook
export function useDownloadProject() {
  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}/download`);
      if (!response.ok) throw new Error('Failed to download project');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${projectId}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}
