// Base Student interface with common properties
export interface Student {
  id: string;
  name: string;
  studentId: string;
  grade: string;
  class: string;
  avatar?: string;
}

// Interface for mentors
export interface Mentor {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  specialties: string[];
  isAssigned?: boolean;  // 添加isAssigned字段
  bio?: string;          // 添加bio字段
  students?: Student[];  // 添加students字段
}

// 添加IndicatorRecord接口
export interface IndicatorRecord {
  id: string;
  studentId: string;
  indicatorId: string;
  value: string | number;
  timestamp: string;
  mentorId: string;
  comment?: string;
}

// Student with mentor relationship
export interface MentorStudent extends Student {
  mentorId: string;
  mentor?: Mentor;
  major?: string;  // 添加major字段
  indicators: IndicatorRecord[];  // 添加indicators字段
}

// Student with indicators for visualization
export interface StudentWithIndicators extends Student {
  indicators: {
    id: string;
    name: string;
    value: number;
    maxValue: number;
    color?: string;
    description?: string;
  }[];
}

// Fully enriched student with all properties
export interface EnrichedStudent extends Student {
  gender?: 'male' | 'female';
  birthday?: string;
  contact?: string;
  address?: string;
  interests?: string[];
  strengths?: string[];
  areasToImprove?: string[];
  indicators: {
    id: string;
    name: string;
    value: number;
    maxValue: number;
    description?: string;
  }[];
  notes?: {
    id?: string;
    date: string;
    content: string;
    author: string;
  }[];
  academicRecords?: {
    id?: string;
    subject: string;
    score: number;
    date: string;
    type: string;
    rank?: string;
    comment?: string;
  }[];
} 