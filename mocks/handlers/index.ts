import { http } from 'msw';

import { authHandlers } from './auth';
import { userHandlers } from './user';
import { calendarHandlers } from './calendar';
import { dataAssetsHandlers } from './data-assets';
import { aiLibraryHandlers } from './ai-library';
import { mentorHandlers } from './mentor';
import { imageHandlers } from './image';
import { teachingPlanHandlers } from './teaching-plans';
import { agentHandlers } from './agents';
import { workbenchHandlers } from './workbench';
import { classroomTimemachineHandlers } from './classroom-timemachine';
// 导入其他处理器...

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...calendarHandlers,
  ...dataAssetsHandlers,
  ...aiLibraryHandlers,
  ...mentorHandlers,
  ...imageHandlers,
  ...teachingPlanHandlers,
  ...agentHandlers,
  ...workbenchHandlers,
  ...classroomTimemachineHandlers,
  // 其他处理器...
  
  // 处理教学设计API
  http.get('*/api/teaching-designs', async () => {
    return new Response(JSON.stringify([
      {
        id: '1',
        title: '小学数学分数教学设计',
        subject: '数学',
        grade: '小学四年级',
        author: '张老师',
        createdAt: '2024-02-10T08:30:00Z',
        updatedAt: '2024-02-15T14:20:00Z',
        status: 'published',
        description: '通过实物演示和互动练习帮助学生理解分数概念',
        coverImage: '/images/teaching-designs/math-fractions.jpg'
      },
      {
        id: '2',
        title: '中学语文诗词鉴赏教案',
        subject: '语文',
        grade: '初中二年级',
        author: '李老师',
        createdAt: '2024-01-25T10:15:00Z',
        updatedAt: '2024-02-01T09:45:00Z',
        status: 'draft',
        description: '引导学生欣赏古典诗词，理解意境和表达技巧',
        coverImage: '/images/teaching-designs/chinese-poetry.jpg'
      },
      {
        id: '3',
        title: '高中物理力学实验教学',
        subject: '物理',
        grade: '高中一年级',
        author: '王老师',
        createdAt: '2024-02-20T13:40:00Z',
        updatedAt: '2024-02-22T16:10:00Z',
        status: 'published',
        description: '通过实验演示和数据分析，帮助学生理解牛顿运动定律',
        coverImage: '/images/teaching-designs/physics-mechanics.jpg'
      }
    ]), { 
      status: 200, 
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }),
  
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
]; 