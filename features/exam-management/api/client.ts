/**
 * Client-side API methods for exam-management
 */
import { buildApiPath, handleRequest, ApiResponse } from '@/shared/api/core';
import { Question, LearningObjective, ExamDetail } from '../question-types';
import { Exam } from '../types';
// Uncomment and adapt as needed:
// import { Type1, Type2 } from '../types';

// Feature name - used to create all API paths consistently
const FEATURE = 'exams';

/**
 * Exam Management API client
 */
export const examManagementApi = {
  // 考试相关接口
  getExams: async (): Promise<ApiResponse<Exam[]>> => {
    return handleRequest(buildApiPath(FEATURE, ''));
  },

  getExamById: async (id: string): Promise<ApiResponse<Exam>> => {
    return handleRequest(buildApiPath(FEATURE, `/${id}`));
  },

  createExam: async (data: Omit<Exam, 'id'>): Promise<ApiResponse<Exam>> => {
    return handleRequest(
      buildApiPath(FEATURE, ''),
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },

  updateExam: async (id: string, data: Partial<Exam>): Promise<ApiResponse<Exam>> => {
    return handleRequest(
      buildApiPath(FEATURE, `/${id}`),
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },

  deleteExam: async (id: string): Promise<ApiResponse<void>> => {
    return handleRequest(
      buildApiPath(FEATURE, `/${id}`),
      { method: 'DELETE' }
    );
  },

  getExamDetails: async (id: string): Promise<ApiResponse<ExamDetail>> => {
    return handleRequest(buildApiPath(FEATURE, `/${id}/details`));
  },

  // 题目相关接口
  getQuestions: async (examId: string): Promise<ApiResponse<Question[]>> => {
    return handleRequest(buildApiPath(FEATURE, `/${examId}/questions`));
  },

  getQuestionById: async (id: string): Promise<ApiResponse<Question>> => {
    return handleRequest(buildApiPath('questions', `/${id}`));
  },

  createQuestion: async (data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Question>> => {
    return handleRequest(
      buildApiPath('questions', ''),
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },

  updateQuestion: async (id: string, data: Partial<Question>): Promise<ApiResponse<Question>> => {
    return handleRequest(
      buildApiPath('questions', `/${id}`),
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },

  deleteQuestion: async (id: string): Promise<ApiResponse<void>> => {
    return handleRequest(
      buildApiPath('questions', `/${id}`),
      { method: 'DELETE' }
    );
  },

  importQuestionsFromPdf: async (examId: string, file: File): Promise<ApiResponse<{
    success: boolean;
    message: string;
    questions: Question[];
    count: number;
  }>> => {
    const formData = new FormData();
    formData.append('examId', examId);
    formData.append('file', file);

    return handleRequest(
      buildApiPath('questions', '/import-pdf'),
      {
        method: 'POST',
        body: formData,
        headers: {} // 让浏览器自动设置Content-Type为multipart/form-data
      }
    );
  },

  bulkUpdateScores: async (examId: string, questions: Array<{ id: string; score: number }>): Promise<ApiResponse<{
    message: string;
    questions: Question[];
  }>> => {
    return handleRequest(
      buildApiPath('questions', '/bulk-update-scores'),
      {
        method: 'POST',
        body: JSON.stringify({
          examId,
          questions
        })
      }
    );
  },

  // 学业目标相关接口
  getLearningObjectives: async (subject?: string): Promise<ApiResponse<LearningObjective[]>> => {
    const queryParams = subject ? `?subject=${encodeURIComponent(subject)}` : '';
    return handleRequest(buildApiPath('learning-objectives', queryParams));
  }
};
