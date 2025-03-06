import { BaseEntity } from './base';

/**
 * 能力和指标相关模型定义
 */

// 能力维度
export interface CompetencyDimension extends BaseEntity {
  name: string;
  color: string;
  level: 1 | 2 | 3;
  parentId?: string;
  progress?: number;
  status?: 'completed' | 'in-progress' | 'pending';
  score?: number;
  description?: string;
  lastUpdated?: string;
  skills?: string[];
  children?: CompetencyDimension[];
}

// 基础指标类型
export interface Indicator extends BaseEntity {
  name: string;
  description: string;
  type: 'number' | 'text' | 'select';
  options?: string[];  // 用于select类型的选项
  unit?: string;       // 用于number类型的单位
} 