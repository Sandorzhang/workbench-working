// 从models目录导入类型
import {
  Student as StudentModel,
} from '@/types/models/education';

import {
  Mentor as MentorType,
  IndicatorRecord as IndicatorRecordType,
  MentorStudent as MentorStudentType,
  EnrichedStudent as EnrichedStudentType,
} from '@/types/models/mentor';

import {
  Indicator as IndicatorModel,
} from '@/types/models/competency';

// 重新导出类型
export type Student = StudentModel;
export type Mentor = MentorType;
export type Indicator = IndicatorModel;
export type IndicatorRecord = IndicatorRecordType;
export type MentorStudent = MentorStudentType;
export type EnrichedStudent = EnrichedStudentType; 