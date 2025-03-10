// API类型定义

// 角色类型
export type Role = "superadmin" | "admin" | "teacher" | "student";

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
  status: "active" | "disabled";
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
  status: "draft" | "published";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  sortOrder?: "asc" | "desc";
}

// 通用API响应状态
export interface ApiResponseStatus {
  success: boolean;
  message?: string;
  updatedAt?: string;
}

// 区域相关类型
export interface Region {
  id: string; // 六位数字编码ID
  name: string; // 区域名称
  status: boolean; // 启用/停用状态
}

export interface RegionListResponse {
  regions: Region[];
  total: number;
}

// 学校阶段学制枚举
export enum SchoolType {
  PRIMARY_FIVE = "小学（五年制）",
  PRIMARY_SIX = "小学（六年制）",
  MIDDLE_THREE = "初中（三年制）",
  MIDDLE_FOUR = "初中（四年制）",
  HIGH_THREE = "普通高中",
  NINE_YEAR = "九年一贯制",
  COMPLETE_SIX = "完全中学（六年制）",
  COMPLETE_SEVEN = "完全中学（七年制）",
  TWELVE_YEAR = "十二年一贯制",
}

// 学校相关类型
export interface School {
  id: string; // 系统生成的唯一ID
  name: string; // 学校名称
  code: string; // 学校编号（3位数字编码）
  regionId: string; // 所属区域ID
  regionName?: string; // 所属区域名称
  type: SchoolType; // 阶段学制
  grades: string[]; // 学校年级（数组）
  status: boolean; // 启用/停用状态
  createdAt: string; // 创建时间
}

export interface SchoolListResponse {
  schools: School[];
  total: number;
}
