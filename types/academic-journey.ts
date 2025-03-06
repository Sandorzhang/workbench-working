// Learning Standard Definition
export interface LearningStandard {
  id: string;
  code: string;           // Standard code (e.g., "MATH.6.G.1")
  description: string;    // Full description of the standard
  shortDescription: string; // Short display text
  subject: string;        // Subject area (Math, Science, etc.)
  grade: string;          // Grade level
  category: string;       // Category within subject
  subcategory?: string;   // Optional subcategory
}

// Mastery Level Types
export type MasteryLevel = 'mastered' | 'progressing' | 'needs-improvement' | 'not-started';

// Student Progress
export interface StudentProgress {
  studentId: string;
  standardId: string;
  masteryLevel: MasteryLevel;
  lastAssessedDate: string;
  assessmentScores: {
    assessmentId: string;
    score: number;
    date: string;
  }[];
  evidence: {
    type: string;
    description: string;
    date: string;
    url?: string;
  }[];
}

// Class Overview
export interface ClassOverview {
  classId: string;
  className: string;
  teacherId: string;
  studentCount: number;
  standardsSummary: {
    standardId: string;
    masteryDistribution: {
      mastered: number;    // Count of students who mastered
      progressing: number;
      needsImprovement: number;
      notStarted: number;
    };
  }[];
  overallProgress: {
    mastered: number;      // Percentage of standards mastered across class
    progressing: number;
    needsImprovement: number;
    notStarted: number;
  };
  challengingStandards: string[];  // IDs of most challenging standards
}

// Student Summary
export interface StudentSummary {
  id: string;
  name: string;
  overallMastery: number;  // Percentage of standards mastered
  standardsCounts: {
    mastered: number;
    progressing: number;
    needsImprovement: number;
    notStarted: number;
  };
  recentProgress: {
    standardId: string;
    previousLevel: MasteryLevel;
    currentLevel: MasteryLevel;
    date: string;
  }[];
}

// Heatmap Data
export interface HeatmapData {
  studentId: string;
  timePoints: string[];    // Array of dates/time periods
  standards: {
    id: string;
    code: string;
    shortDescription: string;
  }[];
  data: {
    standardId: string;
    timeValues: {
      timePoint: string;
      masteryLevel: MasteryLevel;
    }[];
  }[];
}

// API Response Types
export interface StandardsResponse {
  standards: LearningStandard[];
}

export interface ClassOverviewResponse {
  overview: ClassOverview;
}

export interface StudentListResponse {
  students: StudentSummary[];
  total: number;
}

export interface StudentProgressResponse {
  progress: StudentProgress[];
}

export interface HeatmapResponse {
  heatmap: HeatmapData;
} 