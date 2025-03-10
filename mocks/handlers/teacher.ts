import { http, HttpResponse } from "msw";
import { db } from "../db";
import { Student } from "@/lib/types";

// 定义学生详细信息的类型
interface StudentDetail {
  id: string;
  name: string;
  studentId: string;
  grade: string;
  class: string;
  avatar: string;
  gender: string;
  birthday: string;
  contact: string;
  address: string;
  interests: string[];
  strengths: string[];
  areasToImprove: string[];
  lastInteraction: string;
  mentoringProgress: number;
  competencyDetail: Record<string, any>;
  notes: Array<{ id: string; date: string; content: string; author: string }>;
  academicRecords: Array<{
    id: string;
    subject: string;
    score: number;
    date: string;
    type: string;
    rank: string;
    comment: string;
  }>;
}

// 定义学生记录的映射
interface StudentDetailsMap {
  [key: string]: StudentDetail;
}

// 教师数据处理程序
export const teacherHandlers = [
  // 获取当前登录教师的信息
  http.get("/api/teacher/me", () => {
    // console.log('MSW: 接收到获取当前教师信息的请求');
    // 模拟从认证系统获取当前用户ID (本例中固定返回ID为2的教师)
    const teacherId = "2";

    const teacher = db.user.findFirst({
      where: {
        id: {
          equals: teacherId,
        },
        role: {
          equals: "teacher",
        },
      },
    });

    if (!teacher) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(teacher);
  }),

  // 获取教师作为导师管理的学生列表
  http.get("/api/teacher/mentored-students", () => {
    // console.log('收到获取教师管理的学生列表请求')

    return HttpResponse.json([
      {
        id: "s1",
        name: "张明",
        studentId: "20220101",
        grade: "高一",
        class: "3",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        gender: "male",
        lastInteraction: "2023-05-15",
        mentoringProgress: 75,
        competencyStatus: {
          academic: 82,
          social: 68,
          personal: 90,
          engineering: 75,
        },
      },
      {
        id: "s2",
        name: "李华",
        studentId: "20220102",
        grade: "高一",
        class: "3",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        gender: "male",
        lastInteraction: "2023-05-20",
        mentoringProgress: 60,
        competencyStatus: {
          academic: 75,
          social: 85,
          personal: 70,
          engineering: 65,
        },
      },
      {
        id: "s3",
        name: "王芳",
        studentId: "20220103",
        grade: "高一",
        class: "2",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
        gender: "female",
        lastInteraction: "2023-05-10",
        mentoringProgress: 85,
        competencyStatus: {
          academic: 90,
          social: 75,
          personal: 80,
          engineering: 60,
        },
      },
      {
        id: "s4",
        name: "陈婷",
        studentId: "20220104",
        grade: "高一",
        class: "1",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        gender: "female",
        lastInteraction: "2023-05-18",
        mentoringProgress: 65,
        competencyStatus: {
          academic: 85,
          social: 90,
          personal: 75,
          engineering: 60,
        },
      },
      {
        id: "s5",
        name: "赵强",
        studentId: "20220105",
        grade: "高一",
        class: "1",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=William",
        gender: "male",
        lastInteraction: "2023-05-12",
        mentoringProgress: 50,
        competencyStatus: {
          academic: 65,
          social: 70,
          personal: 75,
          engineering: 85,
        },
      },
    ]);
  }),

  // 获取特定学生的详细信息，包括素养评估数据
  http.get("/api/teacher/student/:studentId", ({ params }) => {
    // console.log(`收到获取学生${params.studentId}的详细信息请求`);

    // 基于学生ID返回不同的详细信息
    const studentDetails: StudentDetailsMap = {
      s1: {
        id: "s1",
        name: "张明",
        studentId: "20220101",
        grade: "高一",
        class: "3",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        gender: "male",
        birthday: "2006-08-15",
        contact: "13800138001",
        address: "北京市海淀区中关村南大街5号",
        interests: ["编程", "篮球", "阅读"],
        strengths: ["数学思维", "逻辑推理", "团队合作"],
        areasToImprove: ["英语口语", "时间管理"],
        lastInteraction: "2023-05-15",
        mentoringProgress: 75,
        competencyDetail: {
          academic: {
            id: "academic",
            name: "学术素养",
            color: "#4f46e5",
            level: 1,
            progress: 82,
            description: "关注数理逻辑和学科知识的掌握与应用",
            lastUpdated: "2023-05-10",
            children: [
              {
                id: "academic-math",
                name: "数学能力",
                color: "#4f46e5",
                level: 2,
                parentId: "academic",
                progress: 90,
                status: "completed",
                description: "数学思维和问题解决能力",
                lastUpdated: "2023-05-08",
                children: [
                  {
                    id: "academic-math-algebra",
                    name: "代数",
                    color: "#4f46e5",
                    level: 3,
                    parentId: "academic-math",
                    progress: 95,
                    status: "completed",
                    score: 95,
                    skills: ["方程式解析", "函数理解", "数学模型构建"],
                  },
                  {
                    id: "academic-math-geometry",
                    name: "几何",
                    color: "#4f46e5",
                    level: 3,
                    parentId: "academic-math",
                    progress: 85,
                    status: "completed",
                    score: 85,
                    skills: ["空间想象", "几何证明", "图形分析"],
                  },
                ],
              },
              {
                id: "academic-science",
                name: "科学素养",
                color: "#4f46e5",
                level: 2,
                parentId: "academic",
                progress: 75,
                status: "in-progress",
                description: "科学思维和探究能力",
                lastUpdated: "2023-05-05",
                children: [
                  {
                    id: "academic-science-physics",
                    name: "物理",
                    color: "#4f46e5",
                    level: 3,
                    parentId: "academic-science",
                    progress: 80,
                    status: "in-progress",
                    score: 80,
                    skills: ["力学理解", "实验设计", "物理现象解析"],
                  },
                  {
                    id: "academic-science-chemistry",
                    name: "化学",
                    color: "#4f46e5",
                    level: 3,
                    parentId: "academic-science",
                    progress: 70,
                    status: "in-progress",
                    score: 70,
                    skills: ["化学反应分析", "元素周期表理解", "实验操作"],
                  },
                ],
              },
            ],
          },
          engineering: {
            id: "engineering",
            name: "工程素养",
            color: "#f59e0b",
            level: 1,
            progress: 75,
            description: "关注实践能力和解决实际问题的能力",
            lastUpdated: "2023-05-12",
            children: [
              {
                id: "engineering-coding",
                name: "编程能力",
                color: "#f59e0b",
                level: 2,
                parentId: "engineering",
                progress: 85,
                status: "in-progress",
                description: "代码编写和软件开发能力",
                lastUpdated: "2023-05-10",
                children: [
                  {
                    id: "engineering-coding-language",
                    name: "编程语言",
                    color: "#f59e0b",
                    level: 3,
                    parentId: "engineering-coding",
                    progress: 90,
                    status: "completed",
                    score: 90,
                    skills: ["Python", "JavaScript", "算法设计"],
                  },
                  {
                    id: "engineering-coding-web",
                    name: "Web开发",
                    color: "#f59e0b",
                    level: 3,
                    parentId: "engineering-coding",
                    progress: 80,
                    status: "in-progress",
                    score: 80,
                    skills: ["HTML/CSS", "React", "响应式设计"],
                  },
                ],
              },
              {
                id: "engineering-hardware",
                name: "硬件设计",
                color: "#f59e0b",
                level: 2,
                parentId: "engineering",
                progress: 65,
                status: "in-progress",
                description: "电子硬件设计和制作能力",
                lastUpdated: "2023-05-08",
                children: [
                  {
                    id: "engineering-hardware-circuit",
                    name: "电路设计",
                    color: "#f59e0b",
                    level: 3,
                    parentId: "engineering-hardware",
                    progress: 70,
                    status: "in-progress",
                    score: 70,
                    skills: ["电路原理", "电路板设计", "元器件选择"],
                  },
                  {
                    id: "engineering-hardware-microcontroller",
                    name: "单片机应用",
                    color: "#f59e0b",
                    level: 3,
                    parentId: "engineering-hardware",
                    progress: 60,
                    status: "in-progress",
                    score: 60,
                    skills: ["Arduino", "传感器应用", "控制系统"],
                  },
                ],
              },
            ],
          },
          social: {
            id: "social",
            name: "社交素养",
            color: "#10b981",
            level: 1,
            progress: 68,
            description: "关注人际交往和团队协作能力",
            lastUpdated: "2023-05-08",
            children: [
              {
                id: "social-communication",
                name: "沟通能力",
                color: "#10b981",
                level: 2,
                parentId: "social",
                progress: 75,
                status: "in-progress",
                description: "有效表达和沟通的能力",
                lastUpdated: "2023-05-05",
                children: [
                  {
                    id: "social-communication-verbal",
                    name: "语言表达",
                    color: "#10b981",
                    level: 3,
                    parentId: "social-communication",
                    progress: 80,
                    status: "in-progress",
                    score: 80,
                    skills: ["口头表达", "演讲能力", "表达清晰度"],
                  },
                  {
                    id: "social-communication-written",
                    name: "书面表达",
                    color: "#10b981",
                    level: 3,
                    parentId: "social-communication",
                    progress: 70,
                    status: "in-progress",
                    score: 70,
                    skills: ["文章写作", "报告撰写", "内容组织"],
                  },
                ],
              },
              {
                id: "social-teamwork",
                name: "团队协作",
                color: "#10b981",
                level: 2,
                parentId: "social",
                progress: 60,
                status: "in-progress",
                description: "在团队中合作解决问题的能力",
                lastUpdated: "2023-05-02",
                children: [
                  {
                    id: "social-teamwork-collaboration",
                    name: "协作能力",
                    color: "#10b981",
                    level: 3,
                    parentId: "social-teamwork",
                    progress: 65,
                    status: "in-progress",
                    score: 65,
                    skills: ["任务分工", "共同解决问题", "相互支持"],
                  },
                  {
                    id: "social-teamwork-leadership",
                    name: "领导能力",
                    color: "#10b981",
                    level: 3,
                    parentId: "social-teamwork",
                    progress: 55,
                    status: "in-progress",
                    score: 55,
                    skills: ["团队激励", "决策制定", "目标设定"],
                  },
                ],
              },
            ],
          },
          personal: {
            id: "personal",
            name: "个人素养",
            color: "#ef4444",
            level: 1,
            progress: 90,
            description: "关注自我管理和个人发展能力",
            lastUpdated: "2023-05-15",
            children: [
              {
                id: "personal-selfmanagement",
                name: "自我管理",
                color: "#ef4444",
                level: 2,
                parentId: "personal",
                progress: 95,
                status: "completed",
                description: "规划和管理自己的能力",
                lastUpdated: "2023-05-12",
                children: [
                  {
                    id: "personal-selfmanagement-time",
                    name: "时间管理",
                    color: "#ef4444",
                    level: 3,
                    parentId: "personal-selfmanagement",
                    progress: 90,
                    status: "completed",
                    score: 90,
                    skills: ["任务优先级", "计划制定", "高效执行"],
                  },
                  {
                    id: "personal-selfmanagement-goal",
                    name: "目标设定",
                    color: "#ef4444",
                    level: 3,
                    parentId: "personal-selfmanagement",
                    progress: 100,
                    status: "completed",
                    score: 100,
                    skills: ["SMART目标", "长期规划", "进度跟踪"],
                  },
                ],
              },
              {
                id: "personal-resilience",
                name: "抗压能力",
                color: "#ef4444",
                level: 2,
                parentId: "personal",
                progress: 85,
                status: "completed",
                description: "面对挑战和压力的能力",
                lastUpdated: "2023-05-10",
                children: [
                  {
                    id: "personal-resilience-stress",
                    name: "压力管理",
                    color: "#ef4444",
                    level: 3,
                    parentId: "personal-resilience",
                    progress: 80,
                    status: "in-progress",
                    score: 80,
                    skills: ["情绪调节", "压力缓解技巧", "心理健康"],
                  },
                  {
                    id: "personal-resilience-adaptability",
                    name: "适应能力",
                    color: "#ef4444",
                    level: 3,
                    parentId: "personal-resilience",
                    progress: 90,
                    status: "completed",
                    score: 90,
                    skills: ["变化适应", "灵活思考", "积极调整"],
                  },
                ],
              },
            ],
          },
        },
        notes: [
          {
            id: "1",
            date: "2023-05-15",
            content:
              "张明在数学学科表现出色，特别是在代数方面。他对编程也表现出很强的兴趣，建议可以引导他参加相关的编程竞赛。",
            author: "李老师",
          },
          {
            id: "2",
            date: "2023-04-20",
            content:
              "最近的小组项目中，张明展示了良好的团队合作能力，能够帮助其他同学解决问题。但在时间管理方面还需要提高。",
            author: "李老师",
          },
          {
            id: "3",
            date: "2023-03-10",
            content:
              "期中考试后与张明进行了辅导，他在化学科目上有些困难，已提供了一些学习方法和资源。",
            author: "李老师",
          },
        ],
        academicRecords: [
          {
            id: "1",
            subject: "数学",
            score: 95,
            date: "2023-04-15",
            type: "期中考试",
            rank: "班级第1名",
            comment: "表现优秀，特别是在代数部分",
          },
          {
            id: "2",
            subject: "物理",
            score: 88,
            date: "2023-04-15",
            type: "期中考试",
            rank: "班级第3名",
            comment: "理解物理概念清晰，计算能力强",
          },
          {
            id: "3",
            subject: "化学",
            score: 75,
            date: "2023-04-15",
            type: "期中考试",
            rank: "班级第10名",
            comment: "基础知识有些薄弱，需要加强",
          },
          {
            id: "4",
            subject: "英语",
            score: 82,
            date: "2023-04-15",
            type: "期中考试",
            rank: "班级第5名",
            comment: "阅读理解能力强，但写作和口语需要提高",
          },
          {
            id: "5",
            subject: "语文",
            score: 85,
            date: "2023-04-15",
            type: "期中考试",
            rank: "班级第4名",
            comment: "文学理解和分析能力强，作文结构需要改进",
          },
        ],
      },
      // 可以添加其他学生的详细信息
      s2: {
        id: "s2",
        name: "李华",
        studentId: "20220102",
        grade: "高一",
        class: "3",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        gender: "male",
        birthday: "2006-06-10",
        contact: "13800138002",
        address: "北京市朝阳区建国路88号",
        interests: ["足球", "电子游戏", "音乐"],
        strengths: ["英语口语", "创意思维", "艺术表达"],
        areasToImprove: ["数学计算", "注意力集中"],
        lastInteraction: "2023-05-20",
        mentoringProgress: 60,
        competencyDetail: {
          academic: {
            id: "academic",
            name: "学术素养",
            color: "#4f46e5",
            level: 1,
            progress: 75,
            description: "关注数理逻辑和学科知识的掌握与应用",
            lastUpdated: "2023-05-18",
            children: [],
          },
          engineering: {
            id: "engineering",
            name: "工程素养",
            color: "#f59e0b",
            level: 1,
            progress: 65,
            description: "关注实践能力和解决实际问题的能力",
            lastUpdated: "2023-05-15",
            children: [],
          },
          social: {
            id: "social",
            name: "社交素养",
            color: "#10b981",
            level: 1,
            progress: 85,
            description: "关注人际交往和团队协作能力",
            lastUpdated: "2023-05-20",
            children: [],
          },
          personal: {
            id: "personal",
            name: "个人素养",
            color: "#ef4444",
            level: 1,
            progress: 70,
            description: "关注自我管理和个人发展能力",
            lastUpdated: "2023-05-17",
            children: [],
          },
        },
        notes: [
          {
            id: "1",
            date: "2023-05-20",
            content:
              "李华在英语和艺术课程表现优秀，特别是口语表达能力很强。建议可以参加英语演讲比赛。",
            author: "李老师",
          },
          {
            id: "2",
            date: "2023-04-25",
            content:
              "李华在团队项目中展现了良好的创意能力，但需要提高数学逻辑思维。建议增加相关练习。",
            author: "李老师",
          },
        ],
        academicRecords: [
          {
            id: "1",
            subject: "英语",
            score: 92,
            date: "2023-04-15",
            type: "期中考试",
            rank: "班级第2名",
            comment: "口语和听力表现优秀",
          },
          {
            id: "2",
            subject: "数学",
            score: 75,
            date: "2023-04-15",
            type: "期中考试",
            rank: "班级第15名",
            comment: "需要加强数学基础知识和计算能力",
          },
        ],
      },
    };

    // 返回请求的学生详细信息，如果不存在则返回404
    const studentId = params.studentId as string;
    if (studentDetails[studentId]) {
      return HttpResponse.json(studentDetails[studentId]);
    } else {
      return new HttpResponse(null, { status: 404 });
    }
  }),

  // 更新学生笔记
  http.post(
    "/api/teacher/student/:studentId/notes",
    async ({ params, request }) => {
      // console.log(`收到添加学生${params.studentId}笔记请求`);

      try {
        const noteData = (await request.json()) as { content: string };
        // console.log("笔记内容:", noteData);

        // 在实际应用中，这里会将笔记保存到数据库
        // 这里仅模拟成功响应
        return HttpResponse.json({
          success: true,
          message: "笔记添加成功",
          note: {
            id: Date.now().toString(),
            date: new Date().toISOString().split("T")[0],
            content: noteData.content,
            author: "李老师",
          },
        });
      } catch (error) {
        console.error("处理笔记请求时出错:", error);
        return new HttpResponse(null, { status: 400 });
      }
    }
  ),
];
