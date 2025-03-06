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
 * 学校信息接口
 */
export interface School extends BaseEntity {
  name: string;              // 学校名称
  code: string;              // 学校编号（3位数字编码）
  regionId: string;          // 所属区域ID
  type: string;              // 学校类型/教育阶段
  grades: string[];          // 学校年级数组
  status: boolean;           // 启用/停用状态
  createdAt: string;         // 创建时间
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