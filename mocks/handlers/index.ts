import { http, HttpResponse, delay } from 'msw';

import { authHandlers } from './auth';
import { aiLibraryHandlers } from './ai-library';
import { conceptMapHandlers } from './concept-map';
import { academicJourneyHandlers } from './academic-journey';
import { examHandlers } from './exam';
import { questionsHandlers } from './question';
import { studentHandlers } from './student';
import { teacherHandlers } from './teacher';
import { testHandlers } from './test';
import { studentEvaluationHandlers } from './student-evaluation';
import { 
  getStudentRecordsHandler, 
  addStudentRecordHandler, 
  addStudentRecordByIdHandler,
  updateStudentRecordHandler, 
  deleteStudentRecordHandler,
  getDefaultStudentHandler
} from './student-records';
import { educationManagementHandlers } from './education-management';
import { teacherManagementHandlers } from './teacher-management';
import { studentManagementHandlers } from './student-management';
import { gradeManagementHandlers, classManagementHandlers } from './grade-class-management';
import { regionHandlers } from './region';
import { schoolHandlers } from './school';
import { userHandlers } from './user';
import { superadminHandlers } from './superadmin';
import { superadminSchoolHandlers } from './superadmin-school';
import { applicationHandlers } from './application';
import { permissionHandlers } from './permission';
import { teachingDesignsHandlers } from './teaching-designs';
import { teachingPlanHandlers } from './teaching-plans';
import { mentorHandlers } from './mentor';
// 导入其他处理器...

// 定义原始处理程序集合
const originalHandlers = [
  // 通用处理程序 - 处理对Next.js页面路由的直接访问
  http.get('*/superadmin/*', ({ request }) => {
    // 如果URL包含_next或特定资源，直接放行
    if (
      request.url.includes('/_next/') || 
      request.url.includes('.svg') || 
      request.url.includes('.png') || 
      request.url.includes('.jpg') || 
      request.url.includes('.ico') ||
      request.url.includes('favicon') ||
      request.url.includes('_rsc=')
    ) {
      return undefined;
    }
    
    // 如果是API请求，不处理（让后续的具体handler处理）
    if (request.url.includes('/api/')) {
      return undefined;
    }
    
    // 对页面路由请求，直接放行
    console.log('页面路由请求被放行:', request.url);
    return undefined;
  }),
  
  ...authHandlers,
  ...aiLibraryHandlers,
  ...conceptMapHandlers,
  ...academicJourneyHandlers,
  ...examHandlers,
  ...questionsHandlers,
  ...studentHandlers,
  ...teacherHandlers,
  ...testHandlers,
  ...studentEvaluationHandlers,
  // 学生记录处理程序
  getStudentRecordsHandler,
  addStudentRecordHandler,
  addStudentRecordByIdHandler,
  updateStudentRecordHandler,
  deleteStudentRecordHandler,
  getDefaultStudentHandler,
  // 其他处理器...
  
  // 处理默认头像
  http.get('*/avatars/default.png', () => {
    // 返回一个简单的透明图片数据
    return new Response(new Blob(), { 
      status: 200, 
      headers: {
        'Content-Type': 'image/png'
      }
    });
  }),
  ...educationManagementHandlers,
  ...teacherManagementHandlers,
  ...studentManagementHandlers,
  ...gradeManagementHandlers,
  ...classManagementHandlers,
  ...regionHandlers,
  ...schoolHandlers,
  ...userHandlers,
  ...superadminHandlers,
  ...superadminSchoolHandlers,
  ...applicationHandlers,
  ...permissionHandlers,
  ...teachingDesignsHandlers,
  ...teachingPlanHandlers,
  ...mentorHandlers,
];

// 添加关键认证处理程序 - 确保始终有这些路径的处理程序
const criticalAuthHandlers = [
  // 登录处理程序 - 保底实现，如果原处理程序不起作用
  http.post('*/auth/login', async ({ request }) => {
    console.log('使用保底登录处理程序 - 如果看到此消息，表明原处理程序未命中');
    
    try {
      await delay(500);
      const body = await request.json();
      const { username } = body as { username: string; password: string };
      
      console.log(`保底登录处理程序接收到请求: 用户名=${username}`);
      
      // 简单验证 - 对于测试账号始终通过，不检查密码
      console.log('保底处理程序: 返回成功登录响应');
      return new HttpResponse(
        JSON.stringify({
          data: {
            user: {
              id: '1',
              name: '管理员',
              email: 'admin@example.com',
              avatar: '/avatars/admin.png',
              role: 'admin',
              username: 'admin',
              phone: '13800000000',
              createdAt: new Date().toISOString()
            },
            token: 'mock-token-backup-handler'
          }
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (err) {
      console.error('保底登录处理程序出错:', err);
      return new HttpResponse(
        JSON.stringify({
          message: '服务器错误',
          code: '500',
          details: { reason: 'server_error' }
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }),
  
  // 获取当前用户信息 - 保底实现
  http.get('*/auth/user', async ({ request }) => {
    console.log('使用保底用户信息处理程序');
    
    try {
      await delay(300);
      
      // 从请求头获取令牌
      const authHeader = request.headers.get('Authorization');
      console.log('保底处理程序: Authorization 头:', authHeader ? authHeader.substring(0, 20) + '...' : 'undefined');
      
      // 直接返回默认管理员用户
      return new HttpResponse(
        JSON.stringify({
          data: {
            id: '1',
            name: '管理员',
            email: 'admin@example.com',
            avatar: '/avatars/admin.png',
            role: 'admin',
            username: 'admin',
            phone: '13800000000',
            createdAt: new Date().toISOString()
          }
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('保底用户信息处理程序出错:', error);
      return new HttpResponse(
        JSON.stringify({
          message: '获取用户信息失败',
          code: '500',
          details: { reason: 'server_error' }
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }),
  
  // 登出处理程序 - 保底实现
  http.post('*/auth/logout', async () => {
    console.log('使用保底登出处理程序');
    
    await delay(300);
    
    return new HttpResponse(
      JSON.stringify({
        message: '已成功登出',
        code: '200' 
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  })
];

export const handlers = [
  ...originalHandlers,
  ...criticalAuthHandlers
]; 