/**
 * Type definitions for superadmin
 */

// 后端API实际返回格式
export interface ApiResponseDetail<T> {
  code: number;
  msg: string;
  data: T;
}

// 区域相关类型
export interface Region {
  id: string;       // 六位数字编码ID
  name: string;     // 区域名称
  status: boolean;  // 启用/停用状态
}

export interface RegionListResponse {
  list: Region[];
  pageNumber: number;
  pageSize: number;
  totalPage: number;
  totalCount: number;
}

export interface CreateRegionRequest {
  id: string;       // 六位数字编码ID
  name: string;     // 区域名称
  status: boolean;  // 启用/停用状态
}

export interface UpdateRegionRequest {
  name?: string;    // 区域名称
  status?: boolean; // 启用/停用状态
}

// 省市区数据类型
export interface AddressRegion {
  code: string;     // 区域编码
  name: string;     // 区域名称
  level: 'province' | 'city' | 'district'; // 区域级别
  parentCode?: string; // 父级区域编码
}

export interface FullAddressResponse {
  province: AddressRegion | null;
  city: AddressRegion | null;
  district: AddressRegion | null;
  detail: AddressRegion;
}

// 学校相关类型
export enum SchoolType {
  PRIMARY_FIVE = "小学（五年制）",
  PRIMARY_SIX = "小学（六年制）",
  MIDDLE_THREE = "初中（三年制）",
  MIDDLE_FOUR = "初中（四年制）",
  HIGH_THREE = "普通高中",
  NINE_YEAR = "九年一贯制",
  COMPLETE_SIX = "完全中学（六年制）",
  COMPLETE_SEVEN = "完全中学（七年制）",
  TWELVE_YEAR = "十二年一贯制"
}

export interface School {
  id: string;           // 系统生成的唯一ID
  name: string;         // 学校名称
  regionId: string;     // 所属区域ID
  regionName?: string;  // 所属区域名称
  periodId: string;     // 学校类型ID
  periodName: string;   // 学校类型名称
  logo?: string;        // 学校logo
  status: boolean;      // 启用/停用状态
}

export interface SchoolListResponse {
  list: School[];
  pageNumber: number;
  pageSize: number;
  totalPage: number;
  totalCount: number;
}

export interface CreateSchoolRequest {
  name: string;         // 学校名称
  regionId: string;     // 所属区域ID
  periodId: string;     // 学校类型ID
  status: boolean;      // 启用/停用状态
}

export interface UpdateSchoolRequest {
  name?: string;        // 学校名称
  regionId?: string;    // 所属区域ID
  periodId?: string;    // 学校类型ID
  status?: boolean;     // 启用/停用状态
}
