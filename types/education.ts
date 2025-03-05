// 基础接口类型
export interface BaseEntity {
  id: string;
}

// 外部应用ID信息接口
export interface ExternalAppId {
  appId: string;
  appName: string;
  externalId: string;
}

// 教师信息
export interface Teacher {
  id: string;
  name: string;
  gender: "男" | "女" | string;
  birthDate: string;
  subject: string;
  title: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  entryDate: string;
  education?: string;
  status: "在职" | "休假" | "离职" | string;
  classIds?: string[];
}

// 学生信息
export interface Student {
  id: string;
  name: string;
  gender: "男" | "女" | string;
  enrollmentYear: string;
  birthDate: string;
  studentNumber: string;
  classId?: string;
  gradeId?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  guardian?: string;
  guardianPhone?: string;
  status: "在读" | "休学" | "毕业" | "转校" | string;
  externalAppIds?: Record<string, string>;
}

// 年级信息
export interface Grade {
  id: string;
  name: string;
  year: string;
  description?: string;
  classCount?: number;
  studentCount?: number;
}

// 班级信息
export interface Class {
  id: string;
  name: string;
  gradeId: string;
  grade?: Grade;
  headTeacherId?: string;
  teacherIds: string[];
  studentIds: string[];
  roomNumber?: string;
  description?: string;
  studentCount?: number;
}

// 班级信息（带年级名称）
export interface ClassWithGradeName extends Class {
  gradeName: string;
}

// 分页响应接口
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 列表响应接口
export interface ListResponse<T> {
  data: T[];
  total: number;
}

// 请求参数接口
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface TeachersResponse {
  items: Teacher[];
  total: number;
}

export interface StudentsResponse {
  items: Student[];
  total: number;
}

export interface GradesResponse {
  items: Grade[];
  total: number;
}

export interface ClassesResponse {
  items: Class[];
  total: number;
} 