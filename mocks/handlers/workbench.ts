import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

// Mock data for workbench modules
const mockWorkbenchModules = [
  {
    id: 'teaching-design',
    name: '教学设计',
    description: '创建和管理教学设计',
    icon: '/icons/teaching-design.svg',
    url: '/teaching-design',
    isEnabled: true,
    category: 'teaching',
    order: 1,
    permissions: ['teaching:read', 'teaching:write']
  },
  {
    id: 'classroom-timemachine',
    name: '课堂时光机',
    description: '回顾和分析课堂内容',
    icon: '/icons/classroom.svg',
    url: '/classroom-timemachine',
    isEnabled: true,
    category: 'teaching',
    order: 2,
    permissions: ['classroom:read']
  },
  {
    id: 'academic-journey',
    name: '学业旅程',
    description: '跟踪学生学习进度',
    icon: '/icons/journey.svg',
    url: '/academic-journey',
    isEnabled: true,
    category: 'student',
    order: 1,
    permissions: ['student:read']
  },
  {
    id: 'concept-map',
    name: '概念图谱',
    description: '构建和查看概念关系',
    icon: '/icons/concept-map.svg',
    url: '/concept-map',
    isEnabled: true,
    category: 'tools',
    order: 1,
    permissions: ['tools:read', 'tools:write']
  },
  {
    id: 'calendar',
    name: '日历',
    description: '管理课程和事件',
    icon: '/icons/calendar.svg',
    url: '/calendar',
    isEnabled: true,
    category: 'tools',
    order: 2,
    permissions: ['calendar:read', 'calendar:write']
  }
];

// Mock data for workbench categories
const mockCategories = [
  {
    id: 'teaching',
    name: '教学工具',
    order: 1
  },
  {
    id: 'student',
    name: '学生管理',
    order: 2
  },
  {
    id: 'tools',
    name: '实用工具',
    order: 3
  }
];

// Mock user preferences
const mockUserPreferences = {
  enabledModules: ['teaching-design', 'classroom-timemachine', 'academic-journey'],
  layout: 'grid',
  theme: 'system',
  favorites: ['teaching-design', 'calendar']
};

export const workbenchHandlers = [
  // Get workbench configuration
  http.get('*/api/workbench/config', async () => {
    await delay(300);
    
    console.log('[MSW] 处理请求: GET /api/workbench/config');
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: {
        modules: mockWorkbenchModules,
        categories: mockCategories
      }
    });
  }),
  
  // Get specific module
  http.get('*/api/workbench/modules/:id', async ({ params }) => {
    await delay(200);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: GET /api/workbench/modules/${id}`);
    
    const module = mockWorkbenchModules.find(mod => mod.id === id);
    
    if (!module) {
      return HttpResponse.json({
        code: 404,
        message: 'Module not found',
        success: false,
        data: null
      }, { status: 404 });
    }
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: module
    });
  }),
  
  // Get all modules
  http.get('*/api/workbench/modules', async () => {
    await delay(300);
    
    console.log('[MSW] 处理请求: GET /api/workbench/modules');
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: mockWorkbenchModules
    });
  }),
  
  // Get user preferences
  http.get('*/api/workbench/preferences', async () => {
    await delay(200);
    
    console.log('[MSW] 处理请求: GET /api/workbench/preferences');
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: mockUserPreferences
    });
  }),
  
  // Update user preferences
  http.post('*/api/workbench/preferences', async ({ request }) => {
    await delay(400);
    
    console.log('[MSW] 处理请求: POST /api/workbench/preferences');
    
    const preferences = await request.json();
    console.log('[MSW] 接收到的偏好设置:', preferences);
    
    // Here we would typically update the preferences in the database
    // For this mock, we'll just return the received data
    
    return HttpResponse.json({
      code: 0,
      message: 'Preferences updated successfully',
      success: true,
      data: preferences
    });
  })
]; 