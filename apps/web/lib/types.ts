export type ProjectStatus = "processing" | "complete" | "error" | "queued";

export interface Project {
  id: string;
  name: string;
  domain?: string | null;
  createdAt: string;
  status: ProjectStatus;
  costCents?: number;
  tags?: string[];
  files: UploadedFile[];
  jobId?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  kind: "template" | "financials" | "documents";
}

export interface Job {
  id: string;
  projectId: string;
  stage: "queued" | "parsing_financials" | "mining_documents" | "fetching_public_data" | "building_slides" | "finalizing" | "complete" | "error";
  progress: number;
  logs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  industry: string;
  thumbnailUrl: string;
  slides: TemplateSlide[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSlide {
  id: string;
  title: string;
  order: number;
  visible: boolean;
  content: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
  language: string;
  role: "owner" | "editor" | "viewer";
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "editor" | "viewer";
  status: "active" | "pending" | "inactive";
  invitedAt: string;
}

export interface BillingUsage {
  date: string;
  cost: number;
  projects: number;
}

export interface Invoice {
  id: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  createdAt: string;
  dueAt: string;
  downloadUrl: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsed?: string;
  createdAt: string;
  expiresAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form types
export interface CreateProjectForm {
  name: string;
  domain?: string;
  pullPublicData: boolean;
  templateFile: File;
  financialsFile?: File;
  documentsFile?: File;
}

export interface CreateTemplateForm {
  name: string;
  description: string;
  industry: string;
  templateFile: File;
}

// Filter and search types
export interface ProjectFilters {
  status?: ProjectStatus;
  tags?: string[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TemplateFilters {
  industry?: string;
  search?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Command palette types
export interface Command {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  keywords: string[];
  category: string;
}
