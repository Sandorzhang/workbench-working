import { http, HttpResponse, delay } from "msw";
import { db } from "../db";
import { questions } from "./question";

// 定义考试数据类型
interface ExamData {
  name?: string;
  subject?: string;
  grade?: string;
  semester?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}

// 考试相关的数据常量
const SUBJECTS = [
  "语文",
  "数学",
  "英语",
  "物理",
  "化学",
  "生物",
  "历史",
  "地理",
  "政治",
  "信息技术",
  "综合科学",
  "音乐",
  "美术",
];

const GRADES = [
  "一年级",
  "二年级",
  "三年级",
  "四年级",
  "五年级",
  "六年级",
  "初一",
  "初二",
  "初三",
  "高一",
  "高二",
  "高三",
];

const EXAM_TYPES = [
  "期中考试",
  "期末考试",
  "月考",
  "单元测试",
  "模拟考试",
  "综合素质评价",
  "能力测评",
  "竞赛选拔",
];

// 初始化考试数据库，如果还没有数据
const initExams = () => {
  // console.log('初始化考试数据...')

  try {
    const existingCount = db.exam.count();
    if (existingCount > 0) {
      // console.log(`清空${existingCount}条现有考试数据`)
      db.exam.deleteMany({ where: {} });
    }
  } catch (error) {
    // console.error('清空数据失败:', error)
  }

  // 生成当前日期，用于创建合理的考试时间
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // 判断当前学期 (1-7月为第二学期，8-12月为第一学期)
  const currentSemester =
    currentMonth >= 0 && currentMonth <= 6 ? "第二学期" : "第一学期";

  // 添加小学考试数据
  const primarySchoolGrades = [
    "一年级",
    "二年级",
    "三年级",
    "四年级",
    "五年级",
    "六年级",
  ];
  const primarySubjects = ["语文", "数学", "英语", "科学", "综合素质"];

  primarySchoolGrades.forEach((grade, gradeIndex) => {
    primarySubjects.forEach((subject, subjectIndex) => {
      // 期中考试 (3月或10月)
      const midtermMonth = currentSemester === "第一学期" ? 10 : 3;
      const midtermDate = new Date(
        currentYear,
        midtermMonth - 1,
        10 + (gradeIndex % 5)
      );

      db.exam.create({
        id: `E-${genRandomId()}`,
        name: `${currentYear}年${currentSemester}${grade}${subject}期中考试`,
        subject,
        grade,
        semester: currentSemester,
        startTime: formatDate(midtermDate, 9, 0),
        endTime: formatDate(midtermDate, 10, 30),
        status: isPastDate(midtermDate) ? "published" : "draft",
      });

      // 期末考试 (1月或6月)
      const finalMonth = currentSemester === "第一学期" ? 1 : 6;
      const finalDate = new Date(
        currentYear,
        finalMonth - 1,
        15 + (gradeIndex % 5)
      );

      db.exam.create({
        id: `E-${genRandomId()}`,
        name: `${currentYear}年${currentSemester}${grade}${subject}期末考试`,
        subject,
        grade,
        semester: currentSemester,
        startTime: formatDate(finalDate, 9, 0),
        endTime: formatDate(finalDate, 10, 30),
        status: isPastDate(finalDate) ? "published" : "draft",
      });

      // 添加一些月考
      if ((gradeIndex + subjectIndex) % 2 === 0) {
        const monthlyDate = new Date(currentYear, currentMonth, 5 + gradeIndex);

        db.exam.create({
          id: `E-${genRandomId()}`,
          name: `${currentYear}年${currentMonth + 1}月${grade}${subject}月考`,
          subject,
          grade,
          semester: currentSemester,
          startTime: formatDate(monthlyDate, 13, 30),
          endTime: formatDate(monthlyDate, 15, 0),
          status: Math.random() > 0.3 ? "published" : "draft",
        });
      }
    });
  });

  // 添加中学考试数据
  const middleSchoolGrades = ["初一", "初二", "初三"];
  const middleSubjects = [
    "语文",
    "数学",
    "英语",
    "物理",
    "化学",
    "生物",
    "历史",
    "地理",
    "政治",
  ];

  middleSchoolGrades.forEach((grade, gradeIndex) => {
    // 选择当前年级会考的科目
    const gradeSubjects = middleSubjects.filter((_, index) => {
      // 初一：主科+历史、地理
      if (grade === "初一") return index <= 4 || index === 6 || index === 7;
      // 初二：主科+所有副科
      if (grade === "初二") return true;
      // 初三：全部科目
      return true;
    });

    gradeSubjects.forEach((subject) => {
      // 期中考试
      const midtermMonth = currentSemester === "第一学期" ? 10 : 4;
      const midtermDate = new Date(
        currentYear,
        midtermMonth - 1,
        12 + (gradeIndex % 5)
      );

      db.exam.create({
        id: `E-${genRandomId()}`,
        name: `${currentYear}年${currentSemester}${grade}${subject}期中考试`,
        subject,
        grade,
        semester: currentSemester,
        startTime: formatDate(midtermDate, 8, 0),
        endTime: formatDate(midtermDate, 10, 0),
        status: isPastDate(midtermDate) ? "published" : "draft",
      });

      // 期末考试
      const finalMonth = currentSemester === "第一学期" ? 1 : 7;
      const finalDate = new Date(
        currentYear,
        finalMonth - 1,
        10 + (gradeIndex % 5)
      );

      db.exam.create({
        id: `E-${genRandomId()}`,
        name: `${currentYear}年${currentSemester}${grade}${subject}期末考试`,
        subject,
        grade,
        semester: currentSemester,
        startTime: formatDate(finalDate, 8, 0),
        endTime: formatDate(finalDate, 10, 0),
        status: isPastDate(finalDate) ? "published" : "draft",
      });

      // 中考模拟 (只适用于初三)
      if (
        grade === "初三" &&
        ["语文", "数学", "英语", "物理", "化学"].includes(subject)
      ) {
        const mockDate = new Date(currentYear, 5, 1 + gradeIndex);

        db.exam.create({
          id: `E-${genRandomId()}`,
          name: `${currentYear}年${grade}${subject}中考模拟`,
          subject,
          grade,
          semester: "第二学期",
          startTime: formatDate(mockDate, 8, 30),
          endTime: formatDate(mockDate, 11, 0),
          status: isPastDate(mockDate) ? "published" : "draft",
        });
      }
    });
  });

  // 添加高中考试数据
  const highSchoolGrades = ["高一", "高二", "高三"];
  const highSubjects = [
    "语文",
    "数学",
    "英语",
    "物理",
    "化学",
    "生物",
    "历史",
    "地理",
    "政治",
  ];

  highSchoolGrades.forEach((grade, gradeIndex) => {
    highSubjects.forEach((subject) => {
      // 期中考试
      const midtermMonth = currentSemester === "第一学期" ? 11 : 4;
      const midtermDate = new Date(
        currentYear,
        midtermMonth - 1,
        15 + (gradeIndex % 3)
      );

      db.exam.create({
        id: `E-${genRandomId()}`,
        name: `${currentYear}年${currentSemester}${grade}${subject}期中考试`,
        subject,
        grade,
        semester: currentSemester,
        startTime: formatDate(midtermDate, 8, 0),
        endTime: formatDate(midtermDate, 10, 30),
        status: isPastDate(midtermDate) ? "published" : "draft",
      });

      // 期末考试
      const finalMonth = currentSemester === "第一学期" ? 1 : 7;
      const finalDate = new Date(
        currentYear,
        finalMonth - 1,
        8 + (gradeIndex % 5)
      );

      db.exam.create({
        id: `E-${genRandomId()}`,
        name: `${currentYear}年${currentSemester}${grade}${subject}期末考试`,
        subject,
        grade,
        semester: currentSemester,
        startTime: formatDate(finalDate, 8, 0),
        endTime: formatDate(finalDate, 11, 0),
        status: isPastDate(finalDate) ? "published" : "draft",
      });

      // 高考模拟 (只适用于高三)
      if (
        grade === "高三" &&
        ["语文", "数学", "英语", "理综", "文综"].includes(subject)
      ) {
        const mockDate = new Date(currentYear, 4, 10 + gradeIndex);

        db.exam.create({
          id: `E-${genRandomId()}`,
          name: `${currentYear}年${grade}${subject}高考模拟(一)`,
          subject,
          grade,
          semester: "第二学期",
          startTime: formatDate(mockDate, 8, 30),
          endTime: formatDate(mockDate, 11, 30),
          status: isPastDate(mockDate) ? "published" : "draft",
        });

        // 再添加一次模拟考试
        const mockDate2 = new Date(currentYear, 5, 1 + gradeIndex);

        db.exam.create({
          id: `E-${genRandomId()}`,
          name: `${currentYear}年${grade}${subject}高考模拟(二)`,
          subject,
          grade,
          semester: "第二学期",
          startTime: formatDate(mockDate2, 8, 30),
          endTime: formatDate(mockDate2, 11, 30),
          status: isPastDate(mockDate2) ? "published" : "draft",
        });
      }

      // 月考
      if ((gradeIndex + subject.length) % 3 === 0) {
        const monthlyDate = new Date(
          currentYear,
          currentMonth,
          20 + gradeIndex
        );

        db.exam.create({
          id: `E-${genRandomId()}`,
          name: `${currentYear}年${currentMonth + 1}月${grade}${subject}月考`,
          subject,
          grade,
          semester: currentSemester,
          startTime: formatDate(monthlyDate, 14, 0),
          endTime: formatDate(monthlyDate, 16, 0),
          status: Math.random() > 0.4 ? "published" : "draft",
        });
      }
    });
  });

  // console.log(`成功创建${db.exam.count()}条考试数据`)
};

// 日期格式化辅助函数
function formatDate(date: Date, hours: number, minutes: number): string {
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString().replace("T", " ").substring(0, 19);
}

// 判断日期是否为过去日期
function isPastDate(date: Date): boolean {
  return date < new Date();
}

// 生成随机ID
function genRandomId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// 确保在导出处理程序前初始化数据
initExams();

// 添加一个获取考试详情及相关题目的API处理器
export const examHandlers = [
  // 获取考试列表
  http.get("/api/exams", async () => {
    await delay(500);
    // console.log('[MSW] 处理请求: GET /api/exams')

    const exams = db.exam.getAll();
    return HttpResponse.json({
      exams,
      total: exams.length,
    });
  }),

  // 获取单个考试详情
  http.get("/api/exams/:id", async ({ params }) => {
    await delay(300);

    const id = typeof params.id === "string" ? params.id : String(params.id);
    // console.log(`[MSW] 处理请求: GET /api/exams/${id}`)

    const exam = db.exam.findFirst({
      where: { id: { equals: id } },
    });

    if (!exam) {
      // console.log(`[MSW] 考试不存在: ${id}`)
      return new HttpResponse(JSON.stringify({ error: "Exam not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // console.log(`[MSW] 返回考试详情: ${exam.name}`)
    return HttpResponse.json(exam);
  }),

  // 获取考试详情与题目 (新增)
  http.get("/api/exams/:id/details", async ({ params }) => {
    await delay(500);

    const id = typeof params.id === "string" ? params.id : String(params.id);
    // console.log(`[MSW] 处理请求: GET /api/exams/${id}/details`)

    const exam = db.exam.findFirst({
      where: { id: { equals: id } },
    });

    if (!exam) {
      // console.log(`[MSW] 考试不存在: ${id}`)
      return new HttpResponse(JSON.stringify({ error: "Exam not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // 获取该考试的所有题目
    const examQuestions = questions.filter((q) => q.examId === id);

    // 计算总分
    const totalScore = examQuestions.reduce(
      (sum, question) => sum + question.score,
      0
    );

    // console.log(`[MSW] 返回考试详情及题目: ${exam.name}, 题目数量: ${examQuestions.length}`)
    return HttpResponse.json({
      ...exam,
      questions: examQuestions,
      totalScore,
    });
  }),

  // 创建新考试
  http.post("/api/exams", async ({ request }) => {
    await delay(800);

    // console.log('[MSW] 处理请求: POST /api/exams')

    try {
      const requestData = (await request.json()) as ExamData;
      // console.log('[MSW] 接收到的考试数据:', requestData)

      // 生成新的考试ID
      const newId = `E-${genRandomId()}`;

      // 确保数据的类型正确
      const newExam = db.exam.create({
        id: newId,
        name: String(requestData.name || ""),
        subject: String(requestData.subject || ""),
        grade: String(requestData.grade || ""),
        semester: String(requestData.semester || ""),
        startTime: String(requestData.startTime || ""),
        endTime: String(requestData.endTime || ""),
        status: String(requestData.status || "draft"),
      });

      // console.log(`[MSW] 创建新考试成功: ${newExam.name} (ID: ${newExam.id})`)
      return HttpResponse.json(newExam, { status: 201 });
    } catch (error) {
      // console.error('[MSW] 创建考试失败:', error)
      return HttpResponse.json(
        { error: "创建考试失败", details: String(error) },
        { status: 500 }
      );
    }
  }),

  // 更新考试
  http.put("/api/exams/:id", async ({ params, request }) => {
    await delay(600);

    const id = typeof params.id === "string" ? params.id : String(params.id);
    // console.log(`[MSW] 处理请求: PUT /api/exams/${id}`)

    try {
      const exam = db.exam.findFirst({
        where: { id: { equals: id } },
      });
      if (!exam) {
        // console.log(`[MSW] 考试不存在: ${id}`)
        return HttpResponse.json({ error: "Exam not found" }, { status: 404 });
      }

      const requestData = (await request.json()) as ExamData;
      // console.log('[MSW] 接收到的更新数据:', requestData)

      // 更新考试，确保类型正确
      const updatedExam = db.exam.update({
        where: { id: { equals: id } },
        data: {
          name:
            requestData.name !== undefined
              ? String(requestData.name)
              : undefined,
          subject:
            requestData.subject !== undefined
              ? String(requestData.subject)
              : undefined,
          grade:
            requestData.grade !== undefined
              ? String(requestData.grade)
              : undefined,
          semester:
            requestData.semester !== undefined
              ? String(requestData.semester)
              : undefined,
          startTime:
            requestData.startTime !== undefined
              ? String(requestData.startTime)
              : undefined,
          endTime:
            requestData.endTime !== undefined
              ? String(requestData.endTime)
              : undefined,
          status:
            requestData.status !== undefined
              ? String(requestData.status)
              : undefined,
        },
      });

      if (!updatedExam) {
        console.error(`[MSW] 更新考试时出错: ${id}`);
        return HttpResponse.json({ error: "更新考试失败" }, { status: 500 });
      }

      console.log(`[MSW] 更新考试成功: ${updatedExam.name}`);
      return HttpResponse.json(updatedExam);
    } catch (error) {
      console.error("[MSW] 更新考试失败:", error);
      return HttpResponse.json(
        { error: "更新考试失败", details: String(error) },
        { status: 500 }
      );
    }
  }),

  // 删除考试
  http.delete("/api/exams/:id", async ({ params }) => {
    await delay(500);

    const id = typeof params.id === "string" ? params.id : String(params.id);
    console.log(`[MSW] 处理请求: DELETE /api/exams/${id}`);

    try {
      const exam = db.exam.findFirst({
        where: { id: { equals: id } },
      });

      if (!exam) {
        console.log(`[MSW] 考试不存在: ${id}`);
        return HttpResponse.json({ error: "Exam not found" }, { status: 404 });
      }

      db.exam.delete({
        where: { id: { equals: id } },
      });

      console.log(`[MSW] 删除考试成功: ${id}`);
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      console.error("[MSW] 删除考试失败:", error);
      return HttpResponse.json(
        { error: "删除考试失败", details: String(error) },
        { status: 500 }
      );
    }
  }),
];
