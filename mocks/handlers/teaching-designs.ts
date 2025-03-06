import { http, HttpResponse, delay } from 'msw';

// 模拟单元教案的数据
const mockDesigns = [
  {
    id: '1',
    title: '诗词鉴赏专题',
    subject: '初中语文',
    unit: '第一单元',
    description: '包含《静夜思》、《望岳》等经典诗词的教案设计',
    status: 'published',
    lastModified: '2024-03-15',
    progress: 100,
    lessons: [
      {
        id: '1',
        title: '《静夜思》赏析',
        duration: '45分钟',
        grade: '初中一年级',
        targetClass: '1班',
        teacher: '张老师',
        date: '2024-03-20',
        objectives: [
          '理解诗歌的意境和情感',
          '掌握诗歌的写作特点',
          '学会鉴赏诗歌的方法'
        ],
        keyPoints: [
          '月光意象的运用',
          '思乡情感的表达',
          '诗歌的语言特色'
        ],
        activities: [
          '课前预习诗歌',
          '课堂朗读感悟',
          '小组讨论分析',
          '课后延伸练习'
        ]
      },
      {
        id: '2',
        title: '《望岳》赏析',
        duration: '45分钟',
        grade: '初中一年级',
        targetClass: '1班',
        teacher: '张老师',
        date: '2024-03-22',
        objectives: [
          '理解诗人的爱国情怀',
          '分析诗歌的表现手法',
          '感受诗歌的气势磅礴'
        ],
        keyPoints: [
          '夸张手法的运用',
          '比喻手法的分析',
          '诗歌的结构特点'
        ],
        activities: [
          '观看泰山图片',
          '诗歌朗读品味',
          '分组探讨交流',
          '写作练习'
        ]
      }
    ]
  },
  {
    id: '2',
    title: '函数与方程专题',
    subject: '初中数学',
    unit: '第三单元',
    description: '一元二次方程的解法与应用',
    status: 'draft',
    lastModified: '2024-03-12',
    progress: 60,
    lessons: []
  },
  {
    id: '3',
    title: '物理力学专题',
    subject: '初中物理',
    unit: '第二单元',
    description: '牛顿运动定律及其应用',
    status: 'archived',
    lastModified: '2024-03-10',
    progress: 100,
    lessons: []
  }
];

export const teachingDesignsHandlers = [
  // 获取教学设计列表
  http.get('*/api/teaching-designs', async () => {
    await delay(500);
    
    console.log('[MSW] 处理请求: GET /api/teaching-designs');
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: mockDesigns
    });
  }),
  
  // 获取单个教学设计
  http.get('*/api/teaching-designs/:id', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: GET /api/teaching-designs/${id}`);
    
    const design = mockDesigns.find(d => d.id === id);
    
    if (!design) {
      return HttpResponse.json({
        code: 404,
        message: 'Teaching design not found',
        success: false,
        data: null
      }, { status: 404 });
    }
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: design
    });
  }),
  
  // 创建新的教学设计
  http.post('*/api/teaching-designs', async ({ request }) => {
    await delay(800);
    
    console.log('[MSW] 处理请求: POST /api/teaching-designs');
    
    try {
      const body = await request.json() as Record<string, any>;
      console.log('[MSW] 接收到的教学设计数据:', body);
      
      const newDesign = {
        id: String(mockDesigns.length + 1),
        ...body,
        lastModified: new Date().toISOString().split('T')[0],
        progress: 0,
        status: 'draft',
        lessons: []
      };
      
      // In a real handler we would add this to the database
      // mockDesigns.push(newDesign);
      
      return HttpResponse.json({
        code: 0,
        message: 'Teaching design created successfully',
        success: true,
        data: newDesign
      }, { status: 201 });
    } catch (error) {
      console.error('[MSW] Error creating teaching design:', error);
      return HttpResponse.json({
        code: 500,
        message: 'Failed to create teaching design',
        success: false,
        data: null
      }, { status: 500 });
    }
  }),
  
  // 更新教学设计
  http.put('*/api/teaching-designs/:id', async ({ params, request }) => {
    await delay(600);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: PUT /api/teaching-designs/${id}`);
    
    try {
      const body = await request.json() as Record<string, any>;
      console.log('[MSW] 接收到的更新数据:', body);
      
      const designIndex = mockDesigns.findIndex(d => d.id === id);
      
      if (designIndex === -1) {
        return HttpResponse.json({
          code: 404,
          message: 'Teaching design not found',
          success: false,
          data: null
        }, { status: 404 });
      }
      
      // In a real handler we would update the database
      const updatedDesign = {
        ...mockDesigns[designIndex],
        ...body,
        lastModified: new Date().toISOString().split('T')[0]
      };
      
      return HttpResponse.json({
        code: 0,
        message: 'Teaching design updated successfully',
        success: true,
        data: updatedDesign
      });
    } catch (error) {
      console.error('[MSW] Error updating teaching design:', error);
      return HttpResponse.json({
        code: 500,
        message: 'Failed to update teaching design',
        success: false,
        data: null
      }, { status: 500 });
    }
  }),
  
  // 删除教学设计
  http.delete('*/api/teaching-designs/:id', async ({ params }) => {
    await delay(400);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: DELETE /api/teaching-designs/${id}`);
    
    const designIndex = mockDesigns.findIndex(d => d.id === id);
    
    if (designIndex === -1) {
      return HttpResponse.json({
        code: 404,
        message: 'Teaching design not found',
        success: false,
        data: null
      }, { status: 404 });
    }
    
    // In a real handler we would remove from the database
    // mockDesigns.splice(designIndex, 1);
    
    return HttpResponse.json({
      code: 0,
      message: 'Teaching design deleted successfully',
      success: true,
      data: null
    });
  }),
  
  // 获取教学设计的课时列表
  http.get('*/api/teaching-designs/:id/lessons', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: GET /api/teaching-designs/${id}/lessons`);
    
    const design = mockDesigns.find(d => d.id === id);
    
    if (!design) {
      return HttpResponse.json({
        code: 404,
        message: 'Teaching design not found',
        success: false,
        data: null
      }, { status: 404 });
    }
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: design.lessons || []
    });
  }),
  
  // 添加课时到教学设计
  http.post('*/api/teaching-designs/:id/lessons', async ({ params, request }) => {
    await delay(500);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: POST /api/teaching-designs/${id}/lessons`);
    
    try {
      const body = await request.json() as Record<string, any>;
      console.log('[MSW] 接收到的课时数据:', body);
      
      const designIndex = mockDesigns.findIndex(d => d.id === id);
      
      if (designIndex === -1) {
        return HttpResponse.json({
          code: 404,
          message: 'Teaching design not found',
          success: false,
          data: null
        }, { status: 404 });
      }
      
      const newLesson = {
        id: String(Date.now()),
        ...body,
        order: (mockDesigns[designIndex].lessons?.length || 0) + 1
      };
      
      // In a real handler we would update the database
      // mockDesigns[designIndex].lessons = [
      //   ...(mockDesigns[designIndex].lessons || []),
      //   newLesson
      // ];
      
      return HttpResponse.json({
        code: 0,
        message: 'Lesson added successfully',
        success: true,
        data: newLesson
      }, { status: 201 });
    } catch (error) {
      console.error('[MSW] Error adding lesson:', error);
      return HttpResponse.json({
        code: 500,
        message: 'Failed to add lesson',
        success: false,
        data: null
      }, { status: 500 });
    }
  })
];
