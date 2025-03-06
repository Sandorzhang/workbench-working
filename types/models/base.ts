/**
 * 基础模型定义
 * 包含所有实体共享的基本属性和类型
 */

/**
 * 基础实体接口
 * 所有实体模型应继承此接口
 */
export interface BaseEntity {
  id: string;
}

/**
 * 外部应用ID信息接口
 */
export interface ExternalAppId {
  appId: string;
  appName: string;
  externalId: string;
}

/**
 * 请求参数接口
 */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 列表响应接口
 */
export interface ListResponse<T> {
  data: T[];
  total: number;
} 