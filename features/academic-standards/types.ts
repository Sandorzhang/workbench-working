// 定义基础指标类型
export interface Indicator {
  id: string;
  name: string;
  description: string;
  type: 'number' | 'text' | 'select';
  options?: string[];  // 用于select类型的选项
  unit?: string;       // 用于number类型的单位
} 