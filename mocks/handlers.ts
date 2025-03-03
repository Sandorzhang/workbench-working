import { http, HttpResponse } from 'msw'
import { type RequestHandler } from 'msw'
import { examHandlers } from './handlers/exam'

// 导师相关的处理程序
const mentorHandlers: RequestHandler[] = [
  // 获取所有导师
  http.get('/api/mentors', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: '张三',
        title: '教授',
        department: '计算机科学与技术',
        phone: '13800138000',
        email: 'zhangsan@example.com',
        bio: '从事计算机科学教育20年，专注于人工智能和机器学习领域。',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      },
      {
        id: '2',
        name: '李四',
        title: '副教授',
        department: '软件工程',
        phone: '13800138001',
        email: 'lisi@example.com',
        bio: '软件工程专家，在软件测试和质量保证方面有丰富经验。',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      },
    ])
  }),

  // 获取导师的学生列表
  http.get('/api/mentors/:mentorId/students', ({ params }: { params: { mentorId: string } }) => {
    const { mentorId } = params
    const students = [
      {
        id: '1',
        name: '王小明',
        studentId: '2021001',
        grade: '2021',
        major: '计算机科学与技术',
        class: '1',
        mentorId: '1',
        indicators: [
          {
            id: '1',
            studentId: '1',
            indicatorId: '1',
            value: 85,
            timestamp: '2024-03-01T10:00:00Z',
            mentorId: '1',
            comment: '第一次月度考核成绩'
          }
        ]
      },
      {
        id: '2',
        name: '李小红',
        studentId: '2021002',
        grade: '2021',
        major: '软件工程',
        class: '2',
        mentorId: '1',
        indicators: []
      }
    ]
    return HttpResponse.json(students.filter(s => s.mentorId === mentorId))
  }),

  // 获取指标列表
  http.get('/api/indicators', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: '月度考核成绩',
        description: '每月一次的综合能力考核成绩',
        type: 'number',
        unit: '分'
      },
      {
        id: '2',
        name: '出勤情况',
        description: '本月出勤记录',
        type: 'select',
        options: ['优秀', '良好', '一般', '较差']
      },
      {
        id: '3',
        name: '学习态度',
        description: '学生的学习态度评价',
        type: 'text'
      }
    ])
  }),

  // 创建指标记录
  http.post('/api/indicator-records', async ({ request }: { request: Request }) => {
    const record = await request.json()
    return HttpResponse.json({ 
      ...record, 
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }, { status: 201 })
  })
]

export const handlers = [
  ...mentorHandlers,
  ...examHandlers,
  // ... existing handlers ...
] 