/**
 * Type definitions for teaching-design
 */

/**
 * Teaching Design Lesson
 */
export interface ITeachingDesignLesson {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  duration: number; // in minutes
  materials: string[];
  content: string;
  order: number;
}

/**
 * Teaching Design
 */
export interface ITeachingDesign {
  id: string;
  title: string;
  subject: string;
  unit: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  lessons: ITeachingDesignLesson[];
  lastModified: string;
  progress: number;
  createdBy?: string;
  createdAt?: string;
}

/**
 * Teaching Design Create Request
 */
export interface ITeachingDesignCreate {
  title: string;
  subject: string;
  unit: string;
  description: string;
}
