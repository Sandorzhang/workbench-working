/**
 * 教育相关实体模型定义
 */
import { BaseEntity } from "./base";

/**
 * 年级信息接口
 */
export interface Grade extends BaseEntity {
  name: string;
  gradeLevel: string; // 年级文本描述（一年级、二年级等）
  gradeNumber: number; // 年级数字编码（1、2、3等）
  academicYear: string; // 学年（例如：2023-2024）
  description?: string; // 年级描述（可选）
  classCount?: number; // 班级数（计算属性）
  studentCount?: number; // 学生数（计算属性）
}

/**
 * 班级信息接口
 */
export interface Class extends BaseEntity {
  name: string; // 班级名称
  gradeId: string; // 所属年级ID
  academicYear: string; // 所属学年
  grade?: Grade; // 所属年级（关联属性）
  headTeacherId?: string; // 班主任ID
  teacherIds: string[]; // 任课教师ID数组
  studentIds: string[]; // 学生ID数组
  roomNumber?: string; // 教室编号
  description?: string; // 班级描述
  studentCount?: number; // 学生数（计算属性）
}

/**
 * 班级信息（带年级名称）
 */
export interface ClassWithGradeName extends Class {
  gradeName: string; // 年级名称
}

/**
 * 教师信息接口
 */
export interface Teacher extends BaseEntity {
  name: string; // 姓名
  gender: "男" | "女" | string; // 性别
  birthDate: string; // 出生日期
  subject: string; // 任教学科
  title: string; // 职称
  email: string; // 电子邮箱
  phone: string; // 联系电话
  avatar?: string; // 头像URL
  address?: string; // 地址
  entryDate: string; // 入职日期
  education?: string; // 学历
  status: "在职" | "休假" | "离职" | string; // 状态
  classIds?: string[]; // 任教班级ID
}

/**
 * 学生信息接口
 */
export interface Student extends BaseEntity {
  name: string; // 姓名
  gender: "男" | "女" | string; // 性别
  enrollmentYear: string; // 入学年份
  birthDate: string; // 出生日期
  studentNumber: string; // 学籍号
  classId?: string; // 班级ID
  gradeId?: string; // 年级ID
  avatar?: string; // 头像URL
  phone?: string; // 联系电话
  address?: string; // 地址
  guardian?: string; // 监护人
  guardianPhone?: string; // 监护人联系电话
  status: "在读" | "休学" | "毕业" | "转校" | string; // 状态
  externalAppIds?: Record<string, string>; // 外部应用ID
}

/**
 * 响应类型定义
 */
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

/**
 * 考试相关模型定义
 */

export interface Exam {
  id: string;
  name: string;
  subject: string;
  grade: string;
  semester: string;
  startTime: string;
  endTime: string;
  status: "published" | "draft";
}

export interface Question {
  id: string;
  examId: string;
  questionNumber: string; // 题号，如 "1", "2a", "2b" 等
  learningObjective: string; // 学业目标
  score: number; // 分值
  description?: string; // 题目描述，可选
  imageUrl?: string; // 添加图片URL字段
  createdAt: string;
  updatedAt: string;
}

export interface LearningObjective {
  id: string;
  code: string; // 如 "PLB-00300228"
  description: string; // 如 "能通过小数的加减法运算，解决行小数加减运算问题"
  category?: string; // 分类，可选
}

// 考试详情，包括题目
export interface ExamDetail {
  exam: Exam;
  questions: Question[];
  totalScore: number; // 总分，由所有题目分数累加得到
}

/**
 * 课程信息接口
 */
export interface Course extends BaseEntity {
  name: string; // 课程名称
  code: string; // 课程代码
  description: string; // 课程描述
  schoolId: string; // 所属学校ID
  gradeLevel: string; // 年级
  subject: string; // 学科
  teacherId: string; // 教师ID
  status: "active" | "inactive" | "archived"; // 课程状态
  startDate: string; // 开始日期
  endDate: string; // 结束日期
  enrollmentLimit: number; // 最大学生数
  enrollmentCount: number; // 当前学生数
  schedule: string; // 课程安排
  location: string; // 上课地点
  textbooks: Array<{
    // 教材信息
    id: string;
    title: string;
    author: string;
    publisher: string;
    year: number;
    isbn: string;
  }>;
  syllabus: string; // 教学大纲
}

/**
 * 课程注册信息接口
 */
export interface CourseEnrollment extends BaseEntity {
  courseId: string; // 课程ID
  studentId: string; // 学生ID
  enrollmentDate: string; // 注册日期
  status: "enrolled" | "dropped" | "completed"; // 注册状态
  finalGrade: string | null; // 最终成绩
}
