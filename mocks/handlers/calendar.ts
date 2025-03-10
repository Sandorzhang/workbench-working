import { http, HttpResponse, delay } from "msw";
import { db } from "../db";

// 日历事件类型
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  description: string;
  participants: string[];
}

// 获取YYYY-MM-DD格式的日期字符串
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 模拟日历事件数据
const mockEvents = [
  {
    id: "1",
    title: "教师会议",
    date: "2024-03-20",
    startTime: "09:00",
    endTime: "10:30",
    location: "会议室A",
    type: "meeting",
    description: "讨论本学期教学计划",
    participants: ["张老师", "李老师", "王老师"],
  },
  {
    id: "2",
    title: "高等数学课",
    date: "2024-03-20",
    startTime: "14:00",
    endTime: "15:30",
    location: "教室201",
    type: "class",
    description: "微积分基础",
    participants: ["一年级数学班"],
  },
  {
    id: "3",
    title: "期中考试",
    date: "2024-03-25",
    startTime: "09:00",
    endTime: "11:00",
    location: "考场1",
    type: "exam",
    description: "高等数学期中考试",
    participants: ["一年级全体学生"],
  },
  {
    id: "4",
    title: "校园文化节",
    date: "2024-03-28",
    startTime: "13:00",
    endTime: "17:00",
    location: "学校操场",
    type: "activity",
    description: "年度校园文化节活动",
    participants: ["全校师生"],
  },
  {
    id: "5",
    title: "清明节放假",
    date: "2024-04-05",
    startTime: "00:00",
    endTime: "23:59",
    location: "",
    type: "holiday",
    description: "清明节假期",
    participants: [],
  },
  {
    id: "6",
    title: "数学课堂印象",
    date: "2024-03-22",
    startTime: "10:00",
    endTime: "11:30",
    location: "教室301",
    type: "classroom-impression",
    description: "recordId:cr-001",
    participants: ["张老师", "初三(2)班"],
  },
  {
    id: "7",
    title: "物理实验课记录",
    date: "2024-03-23",
    startTime: "14:00",
    endTime: "15:30",
    location: "物理实验室",
    type: "classroom-impression",
    description: "recordId:cr-002",
    participants: ["李老师", "高一(3)班"],
  },
  {
    id: "8",
    title: "语文课堂印象",
    date: "2024-03-25",
    startTime: "08:00",
    endTime: "09:30",
    location: "教室102",
    type: "classroom-impression",
    description: "recordId:cr-003",
    participants: ["王老师", "六年级(1)班"],
  },
];

// 将事件数据添加到数据库
db.calendar = {
  events: mockEvents,
  create: (data: any) => {
    const event = {
      id: String(Date.now()),
      ...data,
    };
    mockEvents.push(event);
    return event;
  },
  getAll: () => mockEvents,
  findById: (id: string) => mockEvents.find((event) => event.id === id),
  update: (id: string, data: any) => {
    const index = mockEvents.findIndex((event) => event.id === id);
    if (index === -1) return null;
    mockEvents[index] = { ...mockEvents[index], ...data };
    return mockEvents[index];
  },
  delete: (id: string) => {
    const index = mockEvents.findIndex((event) => event.id === id);
    if (index === -1) return false;
    mockEvents.splice(index, 1);
    return true;
  },
};

// 为测试目的，创建一个有效的会话
const createTestSession = () => {
  // 检查是否已存在测试会话
  const existingSession = db.session.findFirst({
    where: {
      userId: {
        equals: "1", // 管理员用户ID
      },
    },
  });

  if (!existingSession) {
    // 创建一个新的测试会话
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24小时有效期

    db.session.create({
      id: String(Date.now()),
      userId: "1", // 管理员用户ID
      token: "test-token-for-calendar",
      expiresAt: expiresAt.toISOString(),
    });

    console.log("已创建测试会话用于日历API");
  }
};

// 确保有一个测试会话可用
createTestSession();

export const calendarHandlers = [
  // 获取月份事件
  http.get("/api/calendar/month/:year/:month", async ({ params }) => {
    await delay(300);

    const { year, month } = params;
    console.log(`获取日历月度数据: ${year}年${month}月`);

    try {
      // 验证年月参数
      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string);

      if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return new HttpResponse(JSON.stringify({ error: "无效的日期参数" }), {
          status: 400,
        });
      }

      // 获取指定月份的所有日历事件
      const events = db.calendar.findMany({
        where: {
          date: {
            // 使用起始日期匹配月份 (例如 2024-03-*)
            startsWith: `${yearNum}-${String(monthNum).padStart(2, "0")}`,
          },
        },
      });

      return HttpResponse.json(events);
    } catch (error) {
      console.error("获取月度日历失败:", error);
      return new HttpResponse(JSON.stringify({ error: "获取日历数据失败" }), {
        status: 500,
      });
    }
  }),

  // 获取日期事件
  http.get("/api/calendar/date/:date", async ({ params }) => {
    await delay(300);

    const { date } = params;
    console.log(`获取日期事件: ${date}`);

    try {
      // 验证日期格式 (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date as string)) {
        return new HttpResponse(
          JSON.stringify({ error: "无效的日期格式，请使用YYYY-MM-DD" }),
          { status: 400 }
        );
      }

      // 获取特定日期的所有事件
      const events = db.calendar.findMany({
        where: {
          date: {
            equals: date as string,
          },
        },
      });

      return HttpResponse.json(events);
    } catch (error) {
      console.error("获取日期事件失败:", error);
      return new HttpResponse(JSON.stringify({ error: "获取日历数据失败" }), {
        status: 500,
      });
    }
  }),

  // 创建新事件
  http.post("/api/calendar/event", async ({ request }) => {
    await delay(400);

    try {
      const eventData = await request.json();

      // 验证必要字段
      if (
        !eventData.title ||
        !eventData.date ||
        !eventData.startTime ||
        !eventData.endTime
      ) {
        return new HttpResponse(
          JSON.stringify({ error: "标题、日期、开始时间和结束时间不能为空" }),
          { status: 400 }
        );
      }

      // 创建新事件
      const newEvent = db.calendar.create({
        ...eventData,
        id: String(Date.now()),
      });

      return HttpResponse.json(newEvent, { status: 201 });
    } catch (error) {
      console.error("创建日历事件失败:", error);
      return new HttpResponse(JSON.stringify({ error: "创建事件失败" }), {
        status: 500,
      });
    }
  }),

  // 更新事件
  http.put("/api/calendar/event/:id", async ({ params, request }) => {
    await delay(400);

    const { id } = params;

    try {
      // 检查事件是否存在
      const existingEvent = db.calendar.findFirst({
        where: {
          id: {
            equals: id as string,
          },
        },
      });

      if (!existingEvent) {
        return new HttpResponse(JSON.stringify({ error: "事件不存在" }), {
          status: 404,
        });
      }

      // 获取更新数据
      const updateData = await request.json();

      // 更新事件
      const updatedEvent = db.calendar.update({
        where: {
          id: {
            equals: id as string,
          },
        },
        data: updateData,
      });

      return HttpResponse.json(updatedEvent);
    } catch (error) {
      console.error("更新日历事件失败:", error);
      return new HttpResponse(JSON.stringify({ error: "更新事件失败" }), {
        status: 500,
      });
    }
  }),

  // 删除事件
  http.delete("/api/calendar/event/:id", async ({ params }) => {
    await delay(300);

    const { id } = params;

    try {
      // 检查事件是否存在
      const existingEvent = db.calendar.findFirst({
        where: {
          id: {
            equals: id as string,
          },
        },
      });

      if (!existingEvent) {
        return new HttpResponse(JSON.stringify({ error: "事件不存在" }), {
          status: 404,
        });
      }

      // 删除事件
      db.calendar.delete({
        where: {
          id: {
            equals: id as string,
          },
        },
      });

      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      console.error("删除日历事件失败:", error);
      return new HttpResponse(JSON.stringify({ error: "删除事件失败" }), {
        status: 500,
      });
    }
  }),

  // 获取单个事件
  http.get("/api/calendar/event/:id", async ({ params }) => {
    await delay(200);

    const { id } = params;

    try {
      // 查找事件
      const event = db.calendar.findFirst({
        where: {
          id: {
            equals: id as string,
          },
        },
      });

      if (!event) {
        return new HttpResponse(JSON.stringify({ error: "事件不存在" }), {
          status: 404,
        });
      }

      return HttpResponse.json(event);
    } catch (error) {
      console.error("获取日历事件失败:", error);
      return new HttpResponse(JSON.stringify({ error: "获取事件失败" }), {
        status: 500,
      });
    }
  }),
];
