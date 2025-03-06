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
  exam: {
    id: string;
    name: string;
    subject: string;
    grade: string;
    semester: string;
    startTime: string;
    endTime: string;
    status: 'published' | 'draft';
  };
  questions: Question[];
  totalScore: number; // 总分，由所有题目分数累加得到
} 