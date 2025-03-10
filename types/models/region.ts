/**
 * 区域管理相关类型定义
 */

/**
 * 区域实体类型
 */
export interface Region {
  /**
   * 区域ID，六位数字编码
   */
  id: string;
  
  /**
   * 区域名称
   */
  name: string;
  
  /**
   * 区域状态（启用/禁用）
   */
  status: boolean;

  /**
   * 创建时间
   */
  createdAt: string;

  /**
   * 修改时间
   */
  modifiedAt: string;
}

/**
 * 通用API响应结构
 */
export interface ApiResponse<T = unknown> {
  /**
   * 响应代码，"0"表示成功
   */
  code: string;
  
  /**
   * 响应消息
   */
  msg: string;
  
  /**
   * 响应数据
   */
  data: T;
}

/**
 * 简化的API响应结构（不含data字段）
 */
export interface SimpleApiResponse {
  /**
   * 响应代码，"0"表示成功
   */
  code: string;
  
  /**
   * 响应消息
   */
  msg: string;
}

/**
 * 分页数据结构
 */
export interface PaginatedData<T> {
  /**
   * 当前页码
   */
  pageNumber: number;
  
  /**
   * 每页条数
   */
  pageSize: number;
  
  /**
   * 总页数
   */
  totalPage: number;
  
  /**
   * 总记录数
   */
  totalCount: number;
  
  /**
   * 数据列表
   */
  list: T[];
}

/**
 * 区域分页查询请求参数
 */
export interface RegionPageRequest {
  /**
   * 页码，从1开始
   */
  pageNumber: number;
  
  /**
   * 每页记录数
   */
  pageSize: number;
  
  /**
   * 区域名称（可选，用于模糊查询）
   */
  name?: string;
  
  /**
   * 状态筛选（可选）
   */
  status?: boolean;
}

/**
 * 区域分页查询响应
 */
export type RegionPageResponse = ApiResponse<PaginatedData<Region>>;

/**
 * 区域列表响应类型
 */
export interface RegionListResponse {
  /**
   * 区域列表
   */
  regions: Region[];
  
  /**
   * 区域总数
   */
  total: number;
}

/**
 * 区域创建请求类型
 */
export interface RegionCreateRequest {
  /**
   * 区域ID，六位数字编码
   */
  id: string;
  
  /**
   * 区域名称
   */
  name: string;
  
  /**
   * 区域状态（启用/禁用）
   */
  status: boolean;
}

/**
 * 区域更新请求类型
 */
export interface RegionUpdateRequest {
  /**
   * 区域名称
   */
  name?: string;
  
  /**
   * 区域状态（启用/禁用）
   */
  status?: boolean;
}

/**
 * 区域操作响应类型
 */
export interface RegionResponse {
  /**
   * 操作是否成功
   */
  success: boolean;
  
  /**
   * 操作消息
   */
  message?: string;
  
  /**
   * 区域数据
   */
  region?: Region;
} 