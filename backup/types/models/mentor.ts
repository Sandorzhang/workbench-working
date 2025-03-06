import { BaseEntity } from './base';
import { Student } from './education';

/**
 * 导师相关模型定义
 */

// 导师基本信息
export interface Mentor extends BaseEntity {
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  specialties: string[];
  isAssigned?: boolean;  // 是否已分配学生
  bio?: string;          // 导师简介
  students?: Student[];  // 指导的学生列表
}

// 指标记录接口
export interface IndicatorRecord extends BaseEntity {
  studentId: string;
  indicatorId: string;
  value: string | number;
  timestamp: string;
  mentorId: string;
  comment?: string;
}

// 导师学生关系
export interface MentorStudent extends Student {
  mentorId: string;
  mentor?: Mentor;
  major?: string;  // 专业
  indicators: IndicatorRecord[];  // 指标记录
}

// 带有指标的学生
export interface StudentWithIndicators extends Student {
  indicators: {
    id: string;
    name: string;
    value: number;
    maxValue: number;
    color?: string;
    description?: string;
  }[];
}

// 丰富的学生信息（用于导师视图）
export interface EnrichedStudent extends Student {
  avatar?: string;
  indicators?: {
    id: string;
    name: string;
    value: number;
    maxValue: number;
    color: string;
    description?: string;
  }[];
  academicRecords?: {
    id: string;
    subject: string;
    score: number;
    date: string;
    type: string;
    rank?: string;
  }[];
  notes?: {
    id: string;
    date: string;
    content: string;
    author: string;
  }[];
  competencyScores?: {
    dimension: string;
    score: number;
    maxScore: number;
    percentage: number;
  }[];
}

// 基础指标定义 (与competency.ts中的区分)
export interface MentorIndicator extends BaseEntity {
  name: string;
  value: number;
  maxValue: number;
  description?: string;
}

// 笔记
export interface Note extends BaseEntity {
  date: string;
  content: string;
  author: string;
}

// 学习成绩记录
export interface AcademicRecord extends BaseEntity {
  subject: string;
  score: number;
  date: string;
  type: string;
  rank?: string;
  comment?: string;
} 