/**
 * 数据库类型定义
 * 用于MSW模拟数据库
 */
import { 
  // 教育相关类型
  Grade as GradeModel, 
  Class as ClassModel,
  Teacher as TeacherModel,
  Student as StudentModel,
  Exam as ExamModel,
  Question as QuestionModel,
  LearningObjective as LearningObjectiveModel,
  Course as CourseModel,
  CourseEnrollment as CourseEnrollmentModel,
} from './models/education';

import {
  // 学校相关类型
  School as SchoolModel,
  Region as RegionModel,
} from './models/school';

import {
  // 学术旅程相关类型
  LearningStandard as LearningStandardModel,
  StudentProgress as StudentProgressModel,
  ClassOverview as ClassOverviewModel,
  StudentSummary as StudentSummaryModel,
} from './models/academic';

import {
  // 能力指标相关类型
  CompetencyDimension as CompetencyDimensionModel,
  Indicator as IndicatorModel,
} from './models/competency';

import {
  // 学生记录相关类型
  StudentRecord as StudentRecordModel,
} from './models/record';

import {
  // 导师相关类型
  Mentor as MentorModel,
  IndicatorRecord as IndicatorRecordModel,
  Note as NoteModel,
  AcademicRecord as AcademicRecordModel,
} from './models/mentor';

/**
 * 数据库中的教师类型
 * 精简版，只包含存储在数据库中的字段
 */
export type Teacher = Omit<TeacherModel, 'classIds'> & {
  externalAppIds: Array<{
    appId: string;
    appName: string;
    externalId: string;
  }>;
};

/**
 * 数据库中的学生类型
 * 精简版，只包含存储在数据库中的字段
 */
export type Student = Omit<StudentModel, 'externalAppIds'> & {
  gender: 'male' | 'female';
  enrollmentYear: number;
  externalAppIds: Array<{
    appId: string;
    appName: string;
    externalId: string;
  }>;
};

/**
 * 数据库中的年级类型
 * 精简版，只包含存储在数据库中的字段
 */
export type Grade = Omit<GradeModel, 'classCount' | 'studentCount'>;

/**
 * 数据库中的班级类型
 * 精简版，只包含存储在数据库中的字段
 */
export type Class = Omit<ClassModel, 'grade' | 'headTeacherId' | 'teacherIds' | 'studentIds' | 'studentCount'>;

/**
 * 数据库中的学校类型
 */
export type School = SchoolModel;

/**
 * 数据库中的区域类型
 */
export type Region = RegionModel;

/**
 * 数据库中的考试类型
 */
export type Exam = ExamModel;

/**
 * 数据库中的问题类型
 */
export type Question = QuestionModel;

/**
 * 数据库中的学习目标类型
 */
export type LearningObjective = LearningObjectiveModel;

/**
 * 数据库中的学习标准类型
 */
export type LearningStandard = LearningStandardModel;

/**
 * 数据库中的学生进度类型
 */
export type StudentProgress = StudentProgressModel;

/**
 * 数据库中的班级概览类型
 */
export type ClassOverview = ClassOverviewModel;

/**
 * 数据库中的学生摘要类型
 */
export type StudentSummary = StudentSummaryModel;

/**
 * 数据库中的能力维度类型
 */
export type CompetencyDimension = CompetencyDimensionModel;

/**
 * 数据库中的指标类型
 */
export type Indicator = IndicatorModel;

/**
 * 数据库中的学生记录类型
 */
export type StudentRecord = StudentRecordModel;

/**
 * 数据库中的导师类型
 */
export type Mentor = MentorModel;

/**
 * 数据库中的指标记录类型
 */
export type IndicatorRecord = IndicatorRecordModel;

/**
 * 数据库中的笔记类型
 */
export type Note = NoteModel;

/**
 * 数据库中的学业记录类型
 */
export type AcademicRecord = AcademicRecordModel;

/**
 * 数据库中的课程类型
 */
export type Course = CourseModel;

/**
 * 数据库中的课程注册类型
 */
export type CourseEnrollment = CourseEnrollmentModel; 