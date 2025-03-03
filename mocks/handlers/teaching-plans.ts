import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

// 定义请求类型
interface TeachingPlanListParams {
  page?: string;
  pageSize?: string;
}

interface TeachingPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  status: string;
  updatedAt: string;
  author: string;
  description: string;
  content: string;
}

// 教案列表数据
const teachingPlans = [
  {
    id: 'plan-001',
    title: '二次函数教学设计',
    subject: '数学',
    grade: '九年级',
    status: 'published',
    updatedAt: '2023-08-10',
    author: '王老师',
    description: '通过图像分析和实例讲解二次函数性质',
    content: '这是二次函数教案的详细内容...'
  },
  {
    id: 'plan-002',
    title: '古诗文赏析',
    subject: '语文',
    grade: '七年级',
    status: 'draft',
    updatedAt: '2023-08-15',
    author: '李老师',
    description: '引导学生理解古诗中的意境和表达手法',
    content: '这是古诗文赏析教案的详细内容...'
  },
  {
    id: 'plan-003',
    title: '光学实验教学',
    subject: '物理',
    grade: '八年级',
    status: 'published',
    updatedAt: '2023-08-12',
    author: '张老师',
    description: '通过实验演示光的反射和折射现象',
    content: '这是光学实验教案的详细内容...'
  },
  {
    id: 'plan-004',
    title: '英语口语练习',
    subject: '英语',
    grade: '五年级',
    status: 'published',
    updatedAt: '2023-08-08',
    author: '刘老师',
    description: '提高学生英语口语表达能力的互动活动',
    content: '这是英语口语练习教案的详细内容...'
  },
  {
    id: 'plan-005',
    title: '化学元素周期表',
    subject: '化学',
    grade: '九年级',
    status: 'draft',
    updatedAt: '2023-08-05',
    author: '赵老师',
    description: '帮助学生记忆和理解元素周期表规律',
    content: '这是化学元素周期表教案的详细内容...'
  }
];

export const teachingPlanHandlers = [
  // 获取教案列表
  http.get('*/api/teaching-plans', async ({ request }) => {
    await delay(500);
    
    // 获取查询参数
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    // 计算分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedPlans = teachingPlans.slice(start, end);
    
    return HttpResponse.json({
      plans: paginatedPlans,
      total: teachingPlans.length
    });
  }),
  
  // 获取单个教案详情
  http.get('*/api/teaching-plans/:id', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    const plan = teachingPlans.find(plan => plan.id === id);
    
    if (!plan) {
      return HttpResponse.json(
        { message: 'Teaching plan not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(plan);
  }),
  
  // 创建新教案
  http.post('*/api/teaching-plans', async ({ request }) => {
    await delay(600);
    
    const newPlan = await request.json() as Partial<TeachingPlan>;
    
    return HttpResponse.json(
      { 
        ...newPlan,
        id: `plan-${Date.now()}`,
        updatedAt: new Date().toISOString()
      }, 
      { status: 201 }
    );
  }),
  
  // 更新教案
  http.put('*/api/teaching-plans/:id', async ({ params, request }) => {
    await delay(400);
    
    const { id } = params;
    const updatedPlan = await request.json() as Partial<TeachingPlan>;
    
    return HttpResponse.json({
      ...updatedPlan,
      id,
      updatedAt: new Date().toISOString()
    });
  }),
  
  // 删除教案
  http.delete('*/api/teaching-plans/:id', async () => {
    await delay(300);
    
    return HttpResponse.json(
      { message: 'Teaching plan deleted successfully' },
      { status: 200 }
    );
  })
]; 