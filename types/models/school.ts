/**
 * 学校和区域相关实体模型定义
 */
import { BaseEntity } from './base';

/**
 * 区域信息接口
 */
export interface Region extends BaseEntity {
  name: string;              // 区域名称
  status: boolean;           // 启用/停用状态
}

/**
 * 学校管理相关类型定义
 */

/**
 * 学校阶段学制枚举
 */
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

/**
 * 学校实体类型
 */
export interface School extends BaseEntity {
  /**
   * 学校唯一ID
   */
  id: string;
  
  /**
   * 学校名称
   */
  name: string;
  
  /**
   * 学校编码（3位数字）
   */
  code: string;
  
  /**
   * 所属区域ID
   */
  regionId: string;
  
  /**
   * 所属区域名称（冗余字段）
   */
  regionName?: string;
  
  /**
   * 学校阶段学制
   */
  type: SchoolType;
  
  /**
   * 学校年级列表
   */
  grades: string[];
  
  /**
   * 学校状态（启用/禁用）
   */
  status: boolean;
  
  /**
   * 创建时间
   */
  createdAt: string;
}

/**
 * 学校列表响应类型
 */
export interface SchoolListResponse {
  /**
   * 学校列表
   */
  schools: School[];
  
  /**
   * 学校总数
   */
  total: number;
}

/**
 * 学校创建请求类型
 */
export interface SchoolCreateRequest {
  /**
   * 学校名称
   */
  name: string;
  
  /**
   * 学校编码（3位数字）
   */
  code: string;
  
  /**
   * 所属区域ID
   */
  regionId: string;
  
  /**
   * 学校阶段学制
   */
  type: SchoolType;
  
  /**
   * 学校年级列表
   */
  grades: string[];
  
  /**
   * 学校状态（启用/禁用）
   */
  status: boolean;
}

/**
 * 学校更新请求类型
 */
export interface SchoolUpdateRequest {
  /**
   * 学校名称
   */
  name?: string;
  
  /**
   * 学校编码（3位数字）
   */
  code?: string;
  
  /**
   * 所属区域ID
   */
  regionId?: string;
  
  /**
   * 学校阶段学制
   */
  type?: SchoolType;
  
  /**
   * 学校年级列表
   */
  grades?: string[];
  
  /**
   * 学校状态（启用/禁用）
   */
  status?: boolean;
}

/**
 * 学校操作响应类型
 */
export interface SchoolResponse {
  /**
   * 操作是否成功
   */
  success: boolean;
  
  /**
   * 操作消息
   */
  message?: string;
  
  /**
   * 学校数据
   */
  school?: School;
}

/**
 * 学校创建/更新请求数据
 */
export interface SchoolData {
  id?: string;               // ID（可选，创建时自动生成）
  name: string;              // 学校名称
  code: string;              // 学校编号（3位数字编码）
  regionId: string;          // 所属区域ID
  type: string;              // 学校类型/教育阶段
  grades: string[];          // 学校年级数组
  status?: boolean;          // 启用/停用状态（可选）
} 