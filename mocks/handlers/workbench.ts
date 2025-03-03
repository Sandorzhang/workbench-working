import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

// 工作台模块类型
type Role = 'admin' | 'teacher' | 'student';

interface WorkbenchModule {
  id: string;
  name: string;
  description: string;
  icon: string; // 图标路径
  entryUrl: string; // 入口URL
  visibleTo: Role[]; // 对哪些角色可见
  order: number; // 排序权重
  isNew?: boolean; // 是否为新功能
  isRecommended?: boolean; // 是否推荐
}

// 工作台模块配置
const workbenchModules: WorkbenchModule[] = [
  {
    id: 'module-001',
    name: '智能体中心',
    description: '访问和管理所有可用的AI智能体',
    icon: '/icons/ai-center.svg',
    entryUrl: '/ai-center',
    visibleTo: ['admin', 'teacher', 'student'],
    order: 1,
    isRecommended: true
  },
  {
    id: 'module-002',
    name: '我的日历',
    description: '查看和管理日程安排',
    icon: '/icons/calendar.svg',
    entryUrl: '/calendar',
    visibleTo: ['admin', 'teacher', 'student'],
    order: 2
  },
  {
    id: 'module-003',
    name: '教学设计',
    description: '创建和管理单元教学设计',
    icon: '/icons/teaching-design.svg',
    entryUrl: '/teaching-plans',
    visibleTo: ['admin', 'teacher'],
    order: 3,
    isNew: true
  },
  {
    id: 'module-004',
    name: '班级管理',
    description: '管理班级和学生信息',
    icon: '/icons/classroom.svg',
    entryUrl: '/classroom',
    visibleTo: ['admin', 'teacher'],
    order: 4
  },
  {
    id: 'module-005',
    name: '教材资源',
    description: '浏览和下载教材相关资源',
    icon: '/icons/resources.svg',
    entryUrl: '/resources',
    visibleTo: ['admin', 'teacher'],
    order: 5
  },
  {
    id: 'module-006',
    name: '作业中心',
    description: '布置和批改作业',
    icon: '/icons/homework.svg',
    entryUrl: '/homework',
    visibleTo: ['teacher', 'student'],
    order: 6
  },
  {
    id: 'module-007',
    name: '系统设置',
    description: '管理系统配置和用户权限',
    icon: '/icons/settings.svg',
    entryUrl: '/settings',
    visibleTo: ['admin'],
    order: 7
  },
  {
    id: 'module-008',
    name: '数据分析',
    description: '教学数据统计和分析',
    icon: '/icons/analytics.svg',
    entryUrl: '/analytics',
    visibleTo: ['admin', 'teacher'],
    order: 8
  }
];

export const workbenchHandlers = [
  // 获取工作台配置
  http.get('*/api/workbench-config', async ({ request }) => {
    await delay(500);
    
    // 从请求头获取令牌
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // 查找用户会话
    const session = db.session.findFirst({
      where: {
        token: {
          equals: token,
        },
      },
    });
    
    if (!session) {
      return HttpResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // 获取用户信息
    const user = db.user.findFirst({
      where: {
        id: {
          equals: session.userId,
        },
      },
    });
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // 根据用户角色过滤可见模块
    const userRole = user.role as Role;
    const visibleModules = workbenchModules.filter(module => 
      module.visibleTo.includes(userRole)
    ).sort((a, b) => a.order - b.order);
    
    return HttpResponse.json({
      modules: visibleModules,
      user: {
        id: user.id,
        name: user.name,
        role: userRole,
        avatar: user.avatar
      }
    });
  }),
  
  // 获取特定模块详情
  http.get('*/api/workbench-config/:id', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    const module = workbenchModules.find(module => module.id === id);
    
    if (!module) {
      return HttpResponse.json(
        { message: 'Module not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(module);
  }),
  
  // 更新用户工作台偏好设置
  http.post('*/api/workbench-config/preferences', async ({ request }) => {
    await delay(400);
    
    const { modules } = await request.json() as { modules: string[] };
    
    return HttpResponse.json({
      success: true,
      message: '偏好设置已更新',
      updatedAt: new Date().toISOString()
    });
  })
]; 