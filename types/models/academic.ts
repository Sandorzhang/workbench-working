import { BaseEntity } from './base';

/**
 * 学术旅程相关模型定义
 */

// 学习标准定义
export interface LearningStandard extends BaseEntity {
  code: string;           // 标准编码 (例如 "MATH.6.G.1")
  description: string;    // 标准完整描述
  shortDescription: string; // 简短显示文本
  subject: string;        // 学科领域 (数学、科学等)
  grade: string;          // 年级级别
  category: string;       // 学科内分类
  subcategory?: string;   // 可选子分类
}

// 掌握程度级别类型
export type MasteryLevel = 'mastered' | 'progressing' | 'needs-improvement' | 'not-started';

// 学生进度
export interface StudentProgress extends BaseEntity {
  studentId: string;
  standardId: string;
  masteryLevel: MasteryLevel;
  lastAssessedDate: string;
  assessmentScores: {
    assessmentId: string;
    score: number;
    date: string;
  }[];
  evidence: {
    type: string;
    description: string;
    date: string;
    url?: string;
  }[];
}

// 班级概览
export interface ClassOverview extends BaseEntity {
  classId: string;
  className: string;
  teacherId: string;
  studentCount: number;
  standardsSummary: {
    standardId: string;
    masteryDistribution: {
      mastered: number;    // 掌握该标准的学生数量
      progressing: number;
      needsImprovement: number;
      notStarted: number;
    };
  }[];
  overallProgress: {
    mastered: number;      // 班级整体标准掌握百分比
    progressing: number;
    needsImprovement: number;
    notStarted: number;
  };
  challengingStandards: string[];  // 最具挑战性标准的ID
}

// 学生摘要
export interface StudentSummary extends BaseEntity {
  name: string;
  overallMastery: number;  // 标准掌握的百分比
  standardsCounts: {
    mastered: number;
    progressing: number;
    needsImprovement: number;
    notStarted: number;
  };
  recentProgress: {
    standardId: string;
    previousLevel: MasteryLevel;
    currentLevel: MasteryLevel;
    date: string;
  }[];
}

// 热图数据
export interface HeatmapData extends BaseEntity {
  studentId: string;
  timePoints: string[];    // 日期/时间段数组
  standards: {
    id: string;
    code: string;
    shortDescription: string;
  }[];
  data: {
    standardId: string;
    timeValues: {
      timePoint: string;
      masteryLevel: MasteryLevel;
    }[];
  }[];
}

// API响应类型
export interface StandardsResponse {
  standards: LearningStandard[];
}

export interface ClassOverviewResponse {
  overview: ClassOverview;
}

export interface StudentListResponse {
  students: StudentSummary[];
  total: number;
}

export interface StudentProgressResponse {
  progress: StudentProgress[];
}

export interface HeatmapResponse {
  heatmap: HeatmapData;
} 