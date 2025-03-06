export interface Exam {
  id: string;
  name: string;
  subject: string;
  grade: string;
  semester: string;
  startTime: string;
  endTime: string;
  status: 'published' | 'draft';
} 