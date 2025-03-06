import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { Mentor } from '@/shared/types';

// 学生数据处理程序
export const studentHandlers = [
  // 获取当前登录学生的信息
  http.get('/api/student/me', async () => {
    console.log('Received a request to /api/student/me');
    await delay(1000);
    return HttpResponse.json({
      id: 's1',
      name: '张三',
      avatar: '/images/avatars/student1.png',
      grade: '2023级',
      department: '计算机科学与技术',
      email: 'student1@example.com',
      phone: '138****1234'
    });
  }),

  // 获取学生的导师信息
  http.get('/api/student/mentor', async () => {
    console.log('Received a request to /api/student/mentor');
    await delay(800);
    return HttpResponse.json({
      id: 'm1',
      name: '李教授',
      avatar: '/images/avatars/mentor1.png',
      title: '教授',
      department: '计算机科学与技术',
      email: 'mentor1@example.com',
      phone: '139****5678',
      specialties: ['人工智能', '软件工程', '数据科学'],
      bio: '李教授在人工智能领域拥有超过15年的研究和教学经验，曾参与多项国家重点研发计划项目。'
    });
  }),

  // 获取学生的活动记录
  http.get('/api/student/activities', async () => {
    console.log('Received a request to /api/student/activities');
    await delay(600);
    return HttpResponse.json([
      {
        id: 'a1',
        type: '指导会议',
        date: '2023-11-15T10:00:00',
        description: '讨论学习计划与职业规划'
      },
      {
        id: 'a2',
        type: '学术研讨',
        date: '2023-11-10T14:30:00',
        description: '参与AI伦理专题讨论'
      },
      {
        id: 'a3',
        type: '技能培训',
        date: '2023-11-05T09:00:00',
        description: '大数据分析工具培训'
      },
      {
        id: 'a4',
        type: '指导会议',
        date: '2023-10-22T16:00:00',
        description: '学期中期评估与反馈'
      },
      {
        id: 'a5',
        type: '项目合作',
        date: '2023-10-17T13:00:00',
        description: '启动研究项目合作'
      }
    ]);
  }),

  // 获取学生的统计数据
  http.get('/api/student/stats', async () => {
    console.log('Received a request to /api/student/stats');
    await delay(700);
    return HttpResponse.json({
      mentorings: {
        total: 24,
        lastWeek: 2,
        growth: 8.3
      },
      progress: {
        completed: 68,
        target: 100,
        lastWeek: 62
      },
      activities: [
        { month: '7月', count: 2 },
        { month: '8月', count: 4 },
        { month: '9月', count: 8 },
        { month: '10月', count: 6 },
        { month: '11月', count: 5 },
        { month: '12月', count: 3 }
      ]
    });
  }),
  
  // 获取学生的素养能力数据
  http.get('/api/student/competencies', async () => {
    console.log('Received a request to /api/student/competencies');
    await delay(1200);
    return HttpResponse.json([
      // 1. 基础领域素养（6项）
      {
        id: 'domain-1',
        name: '基础领域素养',
        color: '#4290f5',
        level: 1,
        children: [
          {
            id: 'comp-1-1',
            name: '语言素养',
            color: '#4290f5',
            level: 2,
            parentId: 'domain-1',
            progress: 85,
            status: 'completed',
            children: [],
            isAdvanced: false
          },
          {
            id: 'comp-1-2',
            name: '数学素养',
            color: '#4290f5',
            level: 2,
            parentId: 'domain-1',
            progress: 72,
            status: 'in-progress',
            children: [],
            isAdvanced: false
          },
          {
            id: 'comp-1-3',
            name: '科技素养',
            color: '#4290f5',
            level: 2,
            parentId: 'domain-1',
            progress: 65,
            status: 'in-progress',
            children: [],
            isAdvanced: false
          },
          {
            id: 'comp-1-4',
            name: '人文与社会素养',
            color: '#4290f5',
            level: 2,
            parentId: 'domain-1',
            progress: 78,
            status: 'completed',
            children: [],
            isAdvanced: false
          },
          {
            id: 'comp-1-5',
            name: '艺术（审美）素养',
            color: '#4290f5',
            level: 2,
            parentId: 'domain-1',
            progress: 60,
            status: 'in-progress',
            children: [],
            isAdvanced: false
          },
          {
            id: 'comp-1-6',
            name: '运动与健康素养',
            color: '#4290f5',
            level: 2,
            parentId: 'domain-1',
            progress: 80,
            status: 'completed',
            children: [],
            isAdvanced: false
          }
        ]
      },
      
      // 2. 新兴领域素养（3项）
      {
        id: 'domain-2',
        name: '新兴领域素养',
        color: '#42c6a3',
        level: 1,
        children: [
          {
            id: 'comp-2-1',
            name: '信息素养',
            color: '#42c6a3',
            level: 2,
            parentId: 'domain-2',
            progress: 75,
            status: 'in-progress',
            children: [],
            isAdvanced: false
          },
          {
            id: 'comp-2-2',
            name: '环境素养',
            color: '#42c6a3',
            level: 2,
            parentId: 'domain-2',
            progress: 68,
            status: 'in-progress',
            children: [],
            isAdvanced: false
          },
          {
            id: 'comp-2-3',
            name: '财商素养',
            color: '#42c6a3',
            level: 2,
            parentId: 'domain-2',
            progress: 62,
            status: 'in-progress',
            children: [],
            isAdvanced: false
          }
        ]
      },
      
      // 3. 高阶认知（3项）
      {
        id: 'domain-3',
        name: '高阶认知',
        color: '#9966cc',
        level: 1,
        children: [
          {
            id: 'comp-3-1',
            name: '批判性思维',
            color: '#9966cc',
            level: 2,
            parentId: 'domain-3',
            progress: 70,
            status: 'in-progress',
            children: [],
            isAdvanced: false
          },
          {
            id: 'comp-3-2',
            name: '创造性与问题解决',
            color: '#9966cc',
            level: 2,
            parentId: 'domain-3',
            progress: 82,
            status: 'completed',
            children: [],
            isAdvanced: false
          },
          {
            id: 'comp-3-3',
            name: '学会学习与终身学习',
            color: '#9966cc',
            level: 2,
            parentId: 'domain-3',
            progress: 75,
            status: 'in-progress',
            children: [],
            isAdvanced: false
          }
        ]
      },
      
      // 4. 个人成长（2项）
      {
        id: 'domain-4',
        name: '个人成长',
        color: '#ff9966',
        level: 1,
        children: [
          {
            id: 'comp-4-1',
            name: '自我认识与自我调控',
            color: '#ff9966',
            level: 2,
            parentId: 'domain-4',
            progress: 85,
            status: 'completed',
            children: [],
            isAdvanced: false
          },
          {
            id: 'comp-4-2',
            name: '人生规划与幸福生活',
            color: '#ff9966',
            level: 2,
            parentId: 'domain-4',
            progress: 78,
            status: 'in-progress',
            children: [],
            isAdvanced: false
          }
        ]
      },
      
      // 5. 社会性发展（5项）
      {
        id: 'domain-5',
        name: '社会性发展',
        color: '#f55c5c',
        level: 1,
        children: [
          {
            id: 'comp-5-1',
            name: '沟通与合作',
            color: '#f55c5c',
            level: 2,
            parentId: 'domain-5',
            progress: 90,
            status: 'completed',
            children: [],
            isAdvanced: false
          },
          {
            id: 'comp-5-2',
            name: '领导力',
            color: '#f55c5c',
            level: 2,
            parentId: 'domain-5',
            progress: 65,
            status: 'in-progress',
            children: [],
            isAdvanced: true
          },
          {
            id: 'comp-5-3',
            name: '文化理解与传承',
            color: '#f55c5c',
            level: 2,
            parentId: 'domain-5',
            progress: 72,
            status: 'in-progress',
            children: [],
            isAdvanced: false
          },
          {
            id: 'comp-5-4',
            name: '跨文化与国际理解',
            color: '#f55c5c',
            level: 2,
            parentId: 'domain-5',
            progress: 68,
            status: 'in-progress',
            children: [],
            isAdvanced: true
          },
          {
            id: 'comp-5-5',
            name: '公民责任与社会参与',
            color: '#f55c5c',
            level: 2,
            parentId: 'domain-5',
            progress: 78,
            status: 'completed',
            children: [],
            isAdvanced: false
          }
        ]
      }
    ]);
  })
]; 