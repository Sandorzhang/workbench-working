import {
  ClassOverviewResponse,
  HeatmapResponse,
  StandardsResponse,
  StudentListResponse,
  StudentProgressResponse,
} from '@/types/academic-journey';

/**
 * 获取学习标准列表
 */
export async function getLearningStandards(): Promise<StandardsResponse> {
  const response = await fetch('/api/academic-journey/standards');
  
  if (!response.ok) {
    throw new Error('Failed to fetch learning standards');
  }
  
  return response.json();
}

/**
 * 获取班级概览数据
 * @param classId 班级ID
 */
export async function getClassOverview(classId: string): Promise<ClassOverviewResponse> {
  const response = await fetch(`/api/academic-journey/classes/${classId}/overview`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch class overview');
  }
  
  return response.json();
}

/**
 * 获取学生列表
 * @param classId 班级ID
 * @param page 页码
 * @param pageSize 每页大小
 */
export async function getStudentList(
  classId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<StudentListResponse> {
  const response = await fetch(
    `/api/academic-journey/classes/${classId}/students?page=${page}&pageSize=${pageSize}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch student list');
  }
  
  return response.json();
}

/**
 * 获取学生进度数据
 * @param studentId 学生ID
 */
export async function getStudentProgress(studentId: string): Promise<StudentProgressResponse> {
  const response = await fetch(`/api/academic-journey/students/${studentId}/progress`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch student progress');
  }
  
  return response.json();
}

/**
 * 获取学生热力图数据
 * @param studentId 学生ID
 */
export async function getStudentHeatmap(studentId: string): Promise<HeatmapResponse> {
  const response = await fetch(`/api/academic-journey/students/${studentId}/heatmap`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch student heatmap data');
  }
  
  return response.json();
} 