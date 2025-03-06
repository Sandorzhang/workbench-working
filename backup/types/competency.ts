export interface CompetencyDimension {
  id: string;
  name: string;
  color: string;
  level: 1 | 2 | 3;
  parentId?: string;
  progress?: number;
  status?: 'completed' | 'in-progress' | 'pending';
  score?: number;
  description?: string;
  lastUpdated?: string;
  skills?: string[];
  children?: CompetencyDimension[];
}

// Additional competency-related types can be added here 