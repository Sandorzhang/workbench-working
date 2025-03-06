import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import {
  LearningStandard,
  StudentProgress,
  MasteryLevel,
  ClassOverview,
  StudentSummary,
  HeatmapData,
  StandardsResponse,
  ClassOverviewResponse,
  StudentListResponse,
  StudentProgressResponse,
  HeatmapResponse
} from "@/features/academic-journey/types";

// Generate mock learning standards
const mockSubjects = ["数学", "语文", "英语", "科学", "社会"];
const mockGrades = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"];

const generateMockStandards = (): LearningStandard[] => {
  const standards: LearningStandard[] = [];
  
  // For each subject and grade, generate a few standards
  mockSubjects.forEach(subject => {
    mockGrades.forEach(grade => {
      // Generate categories for the subject
      const categories = Array.from({ length: faker.number.int({ min: 2, max: 4 }) }, () => 
        faker.word.sample()
      );
      
      categories.forEach(category => {
        // Generate 3-8 standards per category
        const standardsCount = faker.number.int({ min: 3, max: 8 });
        
        for (let i = 0; i < standardsCount; i++) {
          const id = faker.string.uuid();
          const code = `${subject.slice(0, 1).toUpperCase()}.${grade.slice(0, 1)}.${category.slice(0, 1).toUpperCase()}.${i + 1}`;
          const description = faker.lorem.paragraph();
          const shortDescription = faker.lorem.sentence();
          
          standards.push({
            id,
            code,
            description,
            shortDescription,
            subject,
            grade,
            category,
            subcategory: faker.helpers.maybe(() => faker.word.sample(), { probability: 0.3 }),
          });
        }
      });
    });
  });
  
  return standards;
};

const mockStandards = generateMockStandards();

// Generate mock student data
const generateMockStudents = (count: number) => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
  }));
};

const mockStudents = generateMockStudents(30);

// Generate mock mastery levels for each student for each standard
const generateMockMasteryLevels = () => {
  const masteryLevels: Record<string, Record<string, MasteryLevel>> = {};
  
  mockStudents.forEach(student => {
    masteryLevels[student.id] = {};
    
    mockStandards.forEach(standard => {
      // Randomly assign a mastery level
      const levels: MasteryLevel[] = ['mastered', 'progressing', 'needs-improvement', 'not-started'];
      const weights = [0.3, 0.4, 0.2, 0.1]; // Adjusting probability distribution
      
      // Weighted random selection
      const random = Math.random();
      let sum = 0;
      let selectedLevel = levels[levels.length - 1];
      
      for (let i = 0; i < weights.length; i++) {
        sum += weights[i];
        if (random < sum) {
          selectedLevel = levels[i];
          break;
        }
      }
      
      masteryLevels[student.id][standard.id] = selectedLevel;
    });
  });
  
  return masteryLevels;
};

const mockMasteryLevels = generateMockMasteryLevels();

// Generate mock progress over time
const generateMockProgressTimeline = () => {
  const now = new Date();
  const timePoints: string[] = [];
  
  // Generate time points for the last 12 weeks
  for (let i = 0; i < 12; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7)); // Go back i weeks
    timePoints.push(date.toISOString().split('T')[0]);
  }
  
  return timePoints.reverse(); // Oldest to newest
};

const timePoints = generateMockProgressTimeline();

// Generate mock heatmap data
const generateHeatmapData = (studentId: string) => {
  const studentStandards = faker.helpers.arrayElements(mockStandards, faker.number.int({ min: 10, max: 20 }));
  
  const data = studentStandards.map(standard => {
    let currentLevel: MasteryLevel = 'not-started';
    
    const timeValues = timePoints.map((timePoint, index) => {
      // Simulate progress over time - chance to improve increases with time
      if (index > 0 && index % 2 === 0) {
        const progressChance = 0.4 + (index * 0.05); // Increasing chance of progress
        
        if (Math.random() < progressChance) {
          // Advance to the next level if not already at mastered
          if (currentLevel === 'not-started') {
            currentLevel = 'needs-improvement';
          } else if (currentLevel === 'needs-improvement') {
            currentLevel = 'progressing';
          } else if (currentLevel === 'progressing') {
            currentLevel = 'mastered';
          }
        }
      }
      
      return {
        timePoint,
        masteryLevel: currentLevel,
      };
    });
    
    return {
      standardId: standard.id,
      timeValues,
    };
  });
  
  return {
    studentId,
    timePoints,
    standards: studentStandards.map(s => ({
      id: s.id,
      code: s.code,
      shortDescription: s.shortDescription,
    })),
    data,
  };
};

// Calculate class overview stats
const calculateClassOverview = (classId: string) => {
  const standards = mockStandards;
  const students = mockStudents;
  
  const standardsSummary = standards.map(standard => {
    const masteryDistribution = {
      mastered: 0,
      progressing: 0,
      needsImprovement: 0,
      notStarted: 0,
    };
    
    students.forEach(student => {
      const level = mockMasteryLevels[student.id][standard.id];
      if (level === 'mastered') {
        masteryDistribution.mastered++;
      } else if (level === 'progressing') {
        masteryDistribution.progressing++;
      } else if (level === 'needs-improvement') {
        masteryDistribution.needsImprovement++;
      } else {
        masteryDistribution.notStarted++;
      }
    });
    
    return {
      standardId: standard.id,
      masteryDistribution,
    };
  });
  
  // Calculate overall progress percentages
  const totalAssessments = students.length * standards.length;
  const mastered = standardsSummary.reduce((sum, s) => sum + s.masteryDistribution.mastered, 0);
  const progressing = standardsSummary.reduce((sum, s) => sum + s.masteryDistribution.progressing, 0);
  const needsImprovement = standardsSummary.reduce((sum, s) => sum + s.masteryDistribution.needsImprovement, 0);
  const notStarted = standardsSummary.reduce((sum, s) => sum + s.masteryDistribution.notStarted, 0);
  
  const overallProgress = {
    mastered: (mastered / totalAssessments) * 100,
    progressing: (progressing / totalAssessments) * 100,
    needsImprovement: (needsImprovement / totalAssessments) * 100,
    notStarted: (notStarted / totalAssessments) * 100,
  };
  
  // Identify most challenging standards (those with lowest mastery rates)
  const challengingStandards = standardsSummary
    .sort((a, b) => 
      (a.masteryDistribution.mastered / students.length) - 
      (b.masteryDistribution.mastered / students.length)
    )
    .slice(0, 5)
    .map(s => s.standardId);
  
  return {
    classId,
    className: "一班",
    teacherId: "teacher-1",
    studentCount: students.length,
    standardsSummary,
    overallProgress,
    challengingStandards,
  };
};

// Generate student summaries
const generateStudentSummaries = () => {
  return mockStudents.map(student => {
    const standardsCounts = {
      mastered: 0,
      progressing: 0,
      needsImprovement: 0,
      notStarted: 0,
    };
    
    // Count standards by mastery level
    mockStandards.forEach(standard => {
      const level = mockMasteryLevels[student.id][standard.id];
      if (level === 'mastered') {
        standardsCounts.mastered++;
      } else if (level === 'progressing') {
        standardsCounts.progressing++;
      } else if (level === 'needs-improvement') {
        standardsCounts.needsImprovement++;
      } else {
        standardsCounts.notStarted++;
      }
    });
    
    // Calculate overall mastery percentage
    const totalStandards = mockStandards.length;
    const overallMastery = (standardsCounts.mastered / totalStandards) * 100;
    
    // Generate recent progress updates
    const recentProgress = faker.helpers.arrayElements(
      mockStandards,
      faker.number.int({ min: 1, max: 5 })
    ).map(standard => {
      const levels: MasteryLevel[] = ['not-started', 'needs-improvement', 'progressing', 'mastered'];
      const currentIndex = levels.indexOf(mockMasteryLevels[student.id][standard.id]);
      const previousIndex = Math.max(0, currentIndex - 1);
      
      return {
        standardId: standard.id,
        previousLevel: levels[previousIndex],
        currentLevel: levels[currentIndex],
        date: faker.date.recent({ days: 14 }).toISOString().split('T')[0],
      };
    });
    
    return {
      id: student.id,
      name: student.name,
      overallMastery,
      standardsCounts,
      recentProgress,
    };
  });
};

export const academicJourneyHandlers = [
  // Get learning standards
  http.get("/api/academic-journey/standards", () => {
    const response: StandardsResponse = {
      standards: mockStandards,
    };
    return HttpResponse.json(response);
  }),
  
  // Get class overview statistics
  http.get("/api/academic-journey/classes/:classId/overview", ({ params }) => {
    const { classId } = params;
    const overview = calculateClassOverview(classId as string);
    
    const response: ClassOverviewResponse = {
      overview,
    };
    return HttpResponse.json(response);
  }),
  
  // Get student list with summary metrics
  http.get("/api/academic-journey/classes/:classId/students", ({ params, request }) => {
    const { classId } = params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    
    const studentSummaries = generateStudentSummaries();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedStudents = studentSummaries.slice(start, end);
    
    const response: StudentListResponse = {
      students: paginatedStudents,
      total: studentSummaries.length,
    };
    return HttpResponse.json(response);
  }),
  
  // Get individual student progress data
  http.get("/api/academic-journey/students/:studentId/progress", ({ params }) => {
    const { studentId } = params;
    
    // Generate progress data for each standard
    const progress = mockStandards.map(standard => {
      const masteryLevel = mockMasteryLevels[studentId as string][standard.id];
      const lastAssessedDate = faker.date.recent({ days: 30 }).toISOString().split('T')[0];
      
      // Generate assessment scores
      const assessmentCount = faker.number.int({ min: 1, max: 5 });
      const assessmentScores = Array.from({ length: assessmentCount }, () => ({
        assessmentId: faker.string.uuid(),
        score: faker.number.int({ min: 60, max: 100 }),
        date: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
      }));
      
      // Generate evidence
      const evidenceCount = faker.number.int({ min: 0, max: 3 });
      const evidence = Array.from({ length: evidenceCount }, () => ({
        type: faker.helpers.arrayElement(['quiz', 'homework', 'project', 'exam']),
        description: faker.lorem.sentence(),
        date: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
        url: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.5 }),
      }));
      
      return {
        studentId: studentId as string,
        standardId: standard.id,
        masteryLevel,
        lastAssessedDate,
        assessmentScores,
        evidence,
      };
    });
    
    const response: StudentProgressResponse = {
      progress,
    };
    return HttpResponse.json(response);
  }),
  
  // Get heatmap data for individual student
  http.get("/api/academic-journey/students/:studentId/heatmap", ({ params }) => {
    const { studentId } = params;
    const heatmapData = generateHeatmapData(studentId as string);
    
    const response: HeatmapResponse = {
      heatmap: heatmapData,
    };
    return HttpResponse.json(response);
  }),
]; 