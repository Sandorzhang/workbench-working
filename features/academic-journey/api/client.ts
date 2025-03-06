/**
 * Client-side API methods for academic-journey
 */
import { buildApiPath, handleRequest, ApiResponse } from '@/shared/lib/api-utils';
import {
  ClassOverviewResponse,
  HeatmapResponse,
  StandardsResponse,
  StudentListResponse,
  StudentProgressResponse,
} from '../types';

// Feature name - used to create all API paths consistently
const FEATURE = 'academic-journey';

/**
 * academic-journey API client with standardized paths
 */
export const academicJourneyApi = {
  /**
   * 获取学习标准列表
   */
  getLearningStandards: async (): Promise<ApiResponse<StandardsResponse>> => {
    return handleRequest(buildApiPath(FEATURE, '/standards'));
  },

  /**
   * 获取班级概览数据
   * @param classId 班级ID
   */
  getClassOverview: async (classId: string): Promise<ApiResponse<ClassOverviewResponse>> => {
    return handleRequest(buildApiPath(FEATURE, `/classes/${classId}/overview`));
  },

  /**
   * 获取学生列表
   * @param classId 班级ID
   * @param page 页码
   * @param pageSize 每页大小
   */
  getStudentList: async (
    classId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<StudentListResponse>> => {
    return handleRequest(
      buildApiPath(FEATURE, `/classes/${classId}/students?page=${page}&pageSize=${pageSize}`)
    );
  },

  /**
   * 获取学生进度数据
   * @param studentId 学生ID
   */
  getStudentProgress: async (studentId: string): Promise<ApiResponse<StudentProgressResponse>> => {
    return handleRequest(buildApiPath(FEATURE, `/students/${studentId}/progress`));
  },

  /**
   * 获取学生热力图数据
   * @param studentId 学生ID
   */
  getStudentHeatmap: async (studentId: string): Promise<ApiResponse<HeatmapResponse>> => {
    return handleRequest(buildApiPath(FEATURE, `/students/${studentId}/heatmap`));
  }
};
