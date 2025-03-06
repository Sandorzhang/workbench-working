/**
 * Client-side API methods for competency-wheel
 */
import { buildApiPath, handleRequest, ApiResponse } from '@/shared/api/core';
import { CompetencyDimension } from '../types';

// Feature name - used to create all API paths consistently
const FEATURE = 'student';

/**
 * 能力轮API客户端
 */
export const competencyWheelApi = {
  /**
   * 获取学生能力维度数据
   * 返回学生的所有能力维度数据，包括一级、二级维度及其进度状态
   */
  getCompetencies: async (): Promise<ApiResponse<CompetencyDimension[]>> => {
    return handleRequest(buildApiPath(FEATURE, '/competencies'));
  },

  /**
   * 获取指定学生的能力维度数据
   * @param studentId 学生ID
   */
  getStudentCompetencies: async (studentId: string): Promise<ApiResponse<CompetencyDimension[]>> => {
    return handleRequest(buildApiPath(FEATURE, `/${studentId}/competencies`));
  },

  /**
   * 更新能力维度进度
   * @param dimensionId 维度ID
   * @param data 更新数据，包括进度、状态等
   */
  updateDimensionProgress: async (
    dimensionId: string, 
    data: {
      progress: number;
      status?: 'completed' | 'in-progress' | 'pending';
      score?: number;
      lastUpdated?: string;
    }
  ): Promise<ApiResponse<CompetencyDimension>> => {
    return handleRequest(
      buildApiPath('competencies', `/${dimensionId}/progress`),
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * 添加能力维度
   * @param data 新维度数据
   */
  addDimension: async (data: Omit<CompetencyDimension, 'id'>): Promise<ApiResponse<CompetencyDimension>> => {
    return handleRequest(
      buildApiPath('competencies', ''),
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * 更新能力维度
   * @param dimensionId 维度ID
   * @param data 更新数据
   */
  updateDimension: async (
    dimensionId: string,
    data: Partial<Omit<CompetencyDimension, 'id'>>
  ): Promise<ApiResponse<CompetencyDimension>> => {
    return handleRequest(
      buildApiPath('competencies', `/${dimensionId}`),
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * 删除能力维度
   * @param dimensionId 维度ID
   */
  deleteDimension: async (dimensionId: string): Promise<ApiResponse<void>> => {
    return handleRequest(
      buildApiPath('competencies', `/${dimensionId}`),
      { method: 'DELETE' }
    );
  },

  /**
   * 生成学生能力维度报告
   * @param studentId 学生ID
   */
  generateCompetencyReport: async (studentId: string): Promise<ApiResponse<{
    studentId: string;
    reportUrl: string;
    summary: {
      strengths: string[];
      improvements: string[];
      recommendations: string[];
    }
  }>> => {
    return handleRequest(buildApiPath(FEATURE, `/${studentId}/competency-report`));
  }
};
