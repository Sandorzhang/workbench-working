// 学生类型定义
export interface Student {
  id: string;
  name: string;
  studentId: string;
  grade: string;
  major: string;
  class: string;
  mentorId: string;
  avatar?: string;
}

// 导师类型定义
export interface Mentor {
  id: string;
  name: string;
  title: string;
  department: string;
  phone: string;
  email: string;
  bio?: string;
  avatar?: string;
  specialties: string[];
  isAssigned: boolean;
  students?: Student[];
}

export interface Indicator {
  id: string;
  name: string;
  description: string;
  type: 'number' | 'text' | 'select';
  options?: string[];  // 用于select类型的选项
  unit?: string;      // 用于number类型的单位
}

export interface IndicatorRecord {
  id: string;
  studentId: string;
  indicatorId: string;
  value: string | number;
  timestamp: string;
  mentorId: string;
  comment?: string;
}

export interface MentorStudent extends Student {
  indicators: IndicatorRecord[];
} 