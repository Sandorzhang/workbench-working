/**
 * Client-side API methods for mentor-system
 */
import { buildApiPath, handleRequest, ApiResponse } from '@/shared/api/core';
import { StudentRecord, RecordType, RecordStatus } from '../types';

// Feature name - used to create all API paths consistently
const FEATURE = 'student';

/**
 * 导师系统API客户端
 */
export const mentorSystemApi = {
  /**
   * 获取学生的所有记录
   * @param studentId 学生ID
   */
  getStudentRecords: async (studentId: string): Promise<ApiResponse<StudentRecord[]>> => {
    return handleRequest(buildApiPath(FEATURE, `/${studentId}/records`));
  },

  /**
   * 添加学生记录（不指定学生ID）
   * @param record 记录数据
   */
  addStudentRecord: async (record: {
    studentId: string;
    type: RecordType;
    status: RecordStatus;
    title: string;
    content: string;
    createdBy?: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<StudentRecord>> => {
    return handleRequest(
      buildApiPath(FEATURE, '/records'),
      {
        method: 'POST',
        body: JSON.stringify({
          ...record,
          createdAt: new Date().toISOString()
        })
      }
    );
  },

  /**
   * 添加学生记录（指定学生ID路径）
   * @param studentId 学生ID
   * @param record 记录数据
   */
  addStudentRecordById: async (
    studentId: string,
    record: {
      type: RecordType;
      status: RecordStatus;
      title: string;
      content: string;
      createdBy?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<ApiResponse<StudentRecord>> => {
    return handleRequest(
      buildApiPath(FEATURE, `/${studentId}/records`),
      {
        method: 'POST',
        body: JSON.stringify({
          ...record,
          createdAt: new Date().toISOString()
        })
      }
    );
  },

  /**
   * 更新学生记录
   * @param recordId 记录ID
   * @param data 要更新的数据
   */
  updateStudentRecord: async (
    recordId: string,
    data: {
      status?: RecordStatus;
      title?: string;
      content?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<ApiResponse<StudentRecord>> => {
    return handleRequest(
      buildApiPath(FEATURE, `/records/${recordId}`),
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * 删除学生记录
   * @param recordId 记录ID
   */
  deleteStudentRecord: async (recordId: string): Promise<ApiResponse<void>> => {
    return handleRequest(
      buildApiPath(FEATURE, `/records/${recordId}`),
      { method: 'DELETE' }
    );
  },

  /**
   * 获取教师的默认学生
   */
  getDefaultStudent: async (): Promise<ApiResponse<{ id: string }>> => {
    return handleRequest(buildApiPath('teacher', '/default-student'));
  }
};
