// API类型定义

// 角色类型
export type Role = 'admin' | 'teacher' | 'student';

// 用户相关类型
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  username: string;
  phone?: string;
}

// 身份验证相关类型
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// 工作台相关类型
export interface WorkbenchModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  entryUrl: string;
  visibleTo: Role[];
  order: number;
  isNew?: boolean;
  isRecommended?: boolean;
}

export interface WorkbenchConfigResponse {
  modules: WorkbenchModule[];
  user: {
    id: string;
    name: string;
    role: Role;
    avatar: string;
  };
}

export interface WorkbenchPreferencesRequest {
  modules: string[]; // 模块ID列表
}

// 智能体相关类型
export interface Agent {
  id: string;
  name: string;
  avatar: string;
  description: string;
  status: 'active' | 'disabled';
  createdAt: string;
  type: string;
  capabilities: string[];
}

export interface AgentListResponse {
  agents: Agent[];
}

export interface AgentChatRequest {
  message: string;
}

export interface AgentChatResponse {
  agentId: string;
  message: string;
  timestamp: string;
}

// 日历事件相关类型
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: string;
  description?: string;
  participants?: string[];
}

export interface CalendarEventsRequest {
  startDate?: string;
  endDate?: string;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
}

// 教案相关类型
export interface TeachingPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  status: 'draft' | 'published';
  updatedAt: string;
  author: string;
  description?: string;
  content?: string;
}

export interface TeachingPlanListRequest {
  page?: number;
  pageSize?: number;
}

export interface TeachingPlanListResponse {
  plans: TeachingPlan[];
  total: number;
}

// API 错误响应
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

// 通用分页参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// 通用排序参数
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 通用API响应状态
export interface ApiResponseStatus {
  success: boolean;
  message?: string;
  updatedAt?: string;
} 