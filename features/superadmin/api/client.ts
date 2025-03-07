/**
 * Client-side API methods for superadmin
 */
import { buildApiPath, handleRequest, ApiResponse } from '@/shared/lib/api-utils';
// 导入用户和区域类型
import {
  Region,
  RegionListResponse,
  CreateRegionRequest,
  UpdateRegionRequest,
  FullAddressResponse,
  AddressRegion,
  School,
  SchoolListResponse,
  CreateSchoolRequest,
  UpdateSchoolRequest,
  SchoolType,
  ApiResponseDetail
} from '../types';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  status: 'active' | 'inactive' | 'locked';
  schoolId?: string;
  schoolName?: string;
  lastLogin?: string;
  createdAt: string;
}

// Feature name - used to create all API paths consistently
const FEATURE = 'superadmin';

// 请求头设置
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Cache-Control': 'no-cache',
  'X-Requested-With': 'XMLHttpRequest',
  'X-Admin-Request': 'true' // 表明这是来自管理员的请求
};

// 请求配置
const requestConfig = {
  headers,
  credentials: 'same-origin' as RequestCredentials,
  cache: 'no-store' as RequestCache
};

/**
 * superadmin API client with standardized paths
 */
export const superadminApi = {
  // ===== 用户管理 API =====
  /**
   * 获取所有用户
   */
  getUsers: (): Promise<ApiResponse<User[]>> => {
    return handleRequest(buildApiPath(FEATURE, '/users'), requestConfig);
  },

  /**
   * 获取单个用户
   */
  getUser: (id: string): Promise<ApiResponse<User>> => {
    return handleRequest(buildApiPath(FEATURE, `/users/${id}`), requestConfig);
  },

  /**
   * 创建用户
   */
  createUser: (data: Partial<User>): Promise<ApiResponse<User>> => {
    return handleRequest(
      buildApiPath(FEATURE, '/users'),
      {
        ...requestConfig,
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * 更新用户
   */
  updateUser: (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    return handleRequest(
      buildApiPath(FEATURE, `/users/${id}`),
      {
        ...requestConfig,
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * 删除用户
   */
  deleteUser: (id: string): Promise<ApiResponse<void>> => {
    return handleRequest(
      buildApiPath(FEATURE, `/users/${id}`),
      { 
        ...requestConfig,
        method: 'DELETE' 
      }
    );
  },

  /**
   * 更新用户状态（锁定/解锁）
   */
  updateUserStatus: (id: string, status: 'active' | 'inactive' | 'locked'): Promise<ApiResponse<void>> => {
    return handleRequest(
      buildApiPath(FEATURE, `/users/${id}/status`),
      {
        ...requestConfig,
        method: 'PATCH',
        body: JSON.stringify({ status })
      }
    );
  },

  // ===== 区域管理 API =====
  /**
   * 获取区域列表（带分页）
   */
  getRegions: (page = 1, size = 10): Promise<ApiResponseDetail<RegionListResponse>> => {
    const url = buildApiPath('auth', `/region/page?page=${page-1}&size=${size}`);
    console.log(`获取区域数据，URL: ${url}`);
    return handleRequest(url, requestConfig);
  },

  /**
   * 获取单个区域
   */
  getRegion: (id: string): Promise<ApiResponseDetail<Region>> => {
    return handleRequest(buildApiPath('auth', `/region/${id}`), requestConfig);
  },

  /**
   * 创建区域
   */
  createRegion: (data: CreateRegionRequest): Promise<ApiResponseDetail<Region>> => {
    return handleRequest(
      buildApiPath('auth', '/region'),
      {
        ...requestConfig,
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * 更新区域
   */
  updateRegion: (id: string, data: UpdateRegionRequest): Promise<ApiResponseDetail<Region>> => {
    return handleRequest(
      buildApiPath('auth', `/region/${id}`),
      {
        ...requestConfig,
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * 删除区域
   */
  deleteRegion: (id: string): Promise<ApiResponseDetail<void>> => {
    return handleRequest(
      buildApiPath('auth', `/region/${id}`),
      { 
        ...requestConfig,
        method: 'DELETE' 
      }
    );
  },

  /**
   * 获取省份列表
   */
  getProvinces: (): Promise<ApiResponse<AddressRegion[]>> => {
    return handleRequest(buildApiPath('regions', '/provinces'), requestConfig);
  },

  /**
   * 获取指定省份的城市列表
   */
  getCities: (provinceCode: string): Promise<ApiResponse<AddressRegion[]>> => {
    return handleRequest(buildApiPath('regions', `/cities/${provinceCode}`), requestConfig);
  },

  /**
   * 获取指定城市的区/县列表
   */
  getDistricts: (cityCode: string): Promise<ApiResponse<AddressRegion[]>> => {
    return handleRequest(buildApiPath('regions', `/districts/${cityCode}`), requestConfig);
  },

  /**
   * 获取完整地址信息
   */
  getFullAddress: (code: string): Promise<ApiResponse<FullAddressResponse>> => {
    return handleRequest(buildApiPath('regions', `/full-address/${code}`), requestConfig);
  },

  // ===== 学校管理 API =====
  /**
   * 获取学校列表（带分页）
   */
  getSchools: (page = 1, size = 10, query = {}): Promise<ApiResponseDetail<SchoolListResponse>> => {
    // 构建查询参数
    const params = new URLSearchParams();
    params.append('page', String(page-1)); // 后端从0开始，前端从1开始
    params.append('size', String(size));
    
    // 添加其他查询参数
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const url = buildApiPath('auth', `/school/page${queryString}`);
    console.log(`获取学校数据，URL: ${url}`);
    return handleRequest(url, requestConfig);
  },

  /**
   * 获取单个学校
   */
  getSchool: (id: string): Promise<ApiResponseDetail<School>> => {
    return handleRequest(buildApiPath('auth', `/school/${id}`), requestConfig);
  },

  /**
   * 创建学校
   */
  createSchool: (data: CreateSchoolRequest): Promise<ApiResponseDetail<School>> => {
    return handleRequest(
      buildApiPath('auth', '/school'),
      {
        ...requestConfig,
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * 更新学校
   */
  updateSchool: (id: string, data: UpdateSchoolRequest): Promise<ApiResponseDetail<School>> => {
    return handleRequest(
      buildApiPath('auth', `/school/${id}`),
      {
        ...requestConfig,
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },
  
  /**
   * 获取学校类型列表
   */
  getSchoolTypes: (): Promise<ApiResponseDetail<string[]>> => {
    const url = buildApiPath('auth', '/school/types');
    console.log(`获取学校类型，URL: ${url}`);
    return handleRequest(url, requestConfig);
  },

  /**
   * 删除学校
   */
  deleteSchool: (id: string): Promise<ApiResponseDetail<void>> => {
    return handleRequest(
      buildApiPath('auth', `/school/${id}`),
      { 
        ...requestConfig,
        method: 'DELETE' 
      }
    );
  },
};
