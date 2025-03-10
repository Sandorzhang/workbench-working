import { http, HttpResponse, delay } from "msw";

// 模拟单元教案的数据
const mockDesigns = [
  {
    id: "1",
    title: "诗词鉴赏专题",
    subject: "初中语文",
    unit: "第一单元",
    description: "包含《静夜思》、《望岳》等经典诗词的教案设计",
    status: "published",
    lastModified: "2024-03-15",
    progress: 100,
    lessons: [
      {
        id: "1",
        title: "《静夜思》赏析",
        duration: "45分钟",
        grade: "初中一年级",
        targetClass: "1班",
        teacher: "张老师",
        date: "2024-03-20",
        objectives: [
          "理解诗歌的意境和情感",
          "掌握诗歌的写作特点",
          "学会鉴赏诗歌的方法",
        ],
        keyPoints: ["月光意象的运用", "思乡情感的表达", "诗歌的语言特色"],
        activities: [
          "课前预习诗歌",
          "课堂朗读感悟",
          "小组讨论分析",
          "课后延伸练习",
        ],
      },
      {
        id: "2",
        title: "《望岳》赏析",
        duration: "45分钟",
        grade: "初中一年级",
        targetClass: "1班",
        teacher: "张老师",
        date: "2024-03-22",
        objectives: [
          "理解诗人的爱国情怀",
          "分析诗歌的表现手法",
          "感受诗歌的气势磅礴",
        ],
        keyPoints: ["夸张手法的运用", "比喻手法的分析", "诗歌的结构特点"],
        activities: [
          "观看泰山图片",
          "诗歌朗读品味",
          "分组探讨交流",
          "写作练习",
        ],
      },
    ],
  },
  {
    id: "2",
    title: "数学函数专题",
    subject: "初中数学",
    unit: "第三单元",
    description: "一次函数、二次函数的概念与应用",
    status: "draft",
    lastModified: "2024-03-18",
    progress: 60,
    lessons: [],
  },
  {
    id: "3",
    title: "物理力学专题",
    subject: "初中物理",
    unit: "第二单元",
    description: "牛顿运动定律及其应用",
    status: "archived",
    lastModified: "2024-03-10",
    progress: 100,
    lessons: [],
  },
];

export const teachingDesignsHandlers = [
  // 获取教学设计列表
  http.get("*/api/teaching-designs", async () => {
    await delay(500);

    //console.log('[MSW] 处理请求: GET /api/teaching-designs');
    return HttpResponse.json(mockDesigns, { status: 200 });
  }),

  // 创建新的教学设计
  http.post("*/api/teaching-designs", async ({ request }) => {
    await delay(800);

    //console.log('[MSW] 处理请求: POST /api/teaching-designs');

    try {
      let formData: FormData;
      // 处理不同类型的请求体
      if (
        request.headers.get("Content-Type")?.includes("multipart/form-data")
      ) {
        formData = await request.formData();
        //console.log('[MSW] 接收到multipart表单数据');
      } else {
        const body = (await request.json()) as Record<string, any>;
        formData = new FormData();
        Object.entries(body).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
        //console.log('[MSW] 接收到JSON数据');
      }

      // 记录所有接收到的字段
      //console.log('[MSW] 表单字段:');
      for (const [key, value] of formData.entries()) {
        //console.log(`  - ${key}: ${value instanceof File ? `文件 (${value.name}, ${value.size} bytes)` : value}`);
      }

      // 创建新的教学设计对象
      const newDesign = {
        id: `design-${Date.now()}`,
        title: formData.get("title") || "未命名设计",
        subject: formData.get("subject") || "未指定学科",
        grade: formData.get("grade") || "未指定年级",
        semester: formData.get("semester") || "未指定学期",
        unit: "第一单元",
        author: "当前用户",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "draft",
        description: `${formData.get("title")} - ${formData.get(
          "subject"
        )} ${formData.get("grade")} ${formData.get("semester")}`,
        lastModified: new Date()
          .toLocaleDateString("zh-CN")
          .replace(/\//g, "-"),
        progress: 0,
        lessons: [],
      };

      // 模拟文件处理
      const document = formData.get("document");
      if (document instanceof File) {
        //console.log(`[MSW] 接收到文件: ${document.name}, 大小: ${document.size} bytes`);
      }

      //console.log('[MSW] 创建的新设计:', newDesign);

      return HttpResponse.json(newDesign, { status: 201 });
    } catch (error) {
      console.error("[MSW] 创建教学设计时出错:", error);
      return HttpResponse.json(
        { error: "创建教学设计失败", details: String(error) },
        { status: 500 }
      );
    }
  }),

  // 获取单个教学设计
  http.get("*/api/teaching-designs/:id", async ({ params }) => {
    await delay(300);

    const { id } = params;
    //console.log(`[MSW] 处理请求: GET /api/teaching-designs/${id}`);

    const design = mockDesigns.find((d) => d.id === id);

    if (!design) {
      return HttpResponse.json(
        { error: "找不到指定的教学设计" },
        { status: 404 }
      );
    }

    return HttpResponse.json(design, { status: 200 });
  }),

  // 更新教学设计
  http.put("*/api/teaching-designs/:id", async ({ params, request }) => {
    await delay(500);

    const { id } = params;
    //console.log(`[MSW] 处理请求: PUT /api/teaching-designs/${id}`);

    try {
      const updates = (await request.json()) as Record<string, any>;
      return HttpResponse.json(
        { id, ...updates, updatedAt: new Date().toISOString() },
        { status: 200 }
      );
    } catch (error) {
      return HttpResponse.json(
        { error: "更新教学设计失败", details: String(error) },
        { status: 500 }
      );
    }
  }),

  // 删除教学设计
  http.delete("*/api/teaching-designs/:id", async ({ params }) => {
    await delay(400);

    const { id } = params;
    //console.log(`[MSW] 处理请求: DELETE /api/teaching-designs/${id}`);

    return HttpResponse.json(
      { message: "教学设计已成功删除" },
      { status: 200 }
    );
  }),
];
