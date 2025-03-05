import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

// 模拟学生数据
const students = [
  {
    id: '1',
    name: '张明',
    studentId: '20220101',
    grade: '高一',
    class: '3',
    avatar: '/avatars/student-1.png',
    indicators: [
      {
        id: '1',
        name: '学习能力',
        value: 4,
        maxValue: 5,
        color: 'bg-blue-500'
      },
      {
        id: '2',
        name: '学习态度',
        value: 3,
        maxValue: 5,
        color: 'bg-emerald-500'
      },
      {
        id: '3',
        name: '参与度',
        value: 5,
        maxValue: 5,
        color: 'bg-amber-500'
      },
      {
        id: '4',
        name: '表达力',
        value: 4,
        maxValue: 5,
        color: 'bg-purple-500'
      }
    ]
  },
  {
    id: '2',
    name: '李华',
    studentId: '20220102',
    grade: '高一',
    class: '3',
    avatar: '/avatars/student-2.png',
    indicators: [
      {
        id: '1',
        name: '学习能力',
        value: 5,
        maxValue: 5,
        color: 'bg-blue-500'
      },
      {
        id: '2',
        name: '学习态度',
        value: 4,
        maxValue: 5,
        color: 'bg-emerald-500'
      },
      {
        id: '3',
        name: '参与度',
        value: 3,
        maxValue: 5,
        color: 'bg-amber-500'
      },
      {
        id: '4',
        name: '表达力',
        value: 5,
        maxValue: 5,
        color: 'bg-purple-500'
      }
    ]
  },
  {
    id: '3',
    name: '王芳',
    studentId: '20220103',
    grade: '高一',
    class: '2',
    avatar: '/avatars/student-3.png',
    indicators: [
      {
        id: '1',
        name: '学习能力',
        value: 3,
        maxValue: 5,
        color: 'bg-blue-500'
      },
      {
        id: '2',
        name: '学习态度',
        value: 5,
        maxValue: 5,
        color: 'bg-emerald-500'
      },
      {
        id: '3',
        name: '参与度',
        value: 4,
        maxValue: 5,
        color: 'bg-amber-500'
      },
      {
        id: '4',
        name: '表达力',
        value: 3,
        maxValue: 5,
        color: 'bg-purple-500'
      }
    ]
  },
  {
    id: '4',
    name: '陈婷',
    studentId: '20220104',
    grade: '高一',
    class: '1',
    avatar: '/avatars/student-4.png',
    indicators: [
      {
        id: '1',
        name: '学习能力',
        value: 4,
        maxValue: 5,
        color: 'bg-blue-500'
      },
      {
        id: '2',
        name: '学习态度',
        value: 4,
        maxValue: 5,
        color: 'bg-emerald-500'
      },
      {
        id: '3',
        name: '参与度',
        value: 3,
        maxValue: 5,
        color: 'bg-amber-500'
      },
      {
        id: '4',
        name: '表达力',
        value: 5,
        maxValue: 5,
        color: 'bg-purple-500'
      }
    ]
  },
  {
    id: '5',
    name: '赵强',
    studentId: '20220105',
    grade: '高一',
    class: '1',
    avatar: '/avatars/student-5.png',
    indicators: [
      {
        id: '1',
        name: '学习能力',
        value: 5,
        maxValue: 5,
        color: 'bg-blue-500'
      },
      {
        id: '2',
        name: '学习态度',
        value: 3,
        maxValue: 5,
        color: 'bg-emerald-500'
      },
      {
        id: '3',
        name: '参与度',
        value: 4,
        maxValue: 5,
        color: 'bg-amber-500'
      },
      {
        id: '4',
        name: '表达力',
        value: 5,
        maxValue: 5,
        color: 'bg-purple-500'
      }
    ]
  }
];

// 导出导师处理程序
export const mentorHandlers = [
  // 获取所有导师
  http.get('/api/mentors', () => {
    const mentors = db.mentor.getAll();
    return HttpResponse.json(mentors);
  }),
  
  // 获取单个导师
  http.get('/api/mentors/:id', ({ params }) => {
    const { id } = params;
    const mentor = db.mentor.findFirst({
      where: {
        id: {
          equals: id as string
        }
      }
    });
    
    if (!mentor) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(mentor);
  }),
  
  // 创建导师
  http.post('/api/mentors', async ({ request }) => {
    const newMentor = await request.json();
    // @ts-ignore - 忽略类型错误，实际使用时应该确保类型正确
    const mentor = db.mentor.create(newMentor);
    return HttpResponse.json(mentor, { status: 201 });
  }),
  
  // 更新导师
  http.put('/api/mentors/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    
    const mentor = db.mentor.findFirst({
      where: {
        id: {
          equals: id as string
        }
      }
    });
    
    if (!mentor) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const updatedMentor = db.mentor.update({
      where: {
        id: {
          equals: id as string
        }
      },
      // @ts-ignore - 忽略类型错误，实际使用时应该确保类型正确
      data: updates,
    });
    
    return HttpResponse.json(updatedMentor);
  }),
  
  // 删除导师
  http.delete('/api/mentors/:id', ({ params }) => {
    const { id } = params;
    
    const mentor = db.mentor.findFirst({
      where: {
        id: {
          equals: id as string
        }
      }
    });
    
    if (!mentor) {
      return new HttpResponse(null, { status: 404 });
    }
    
    db.mentor.delete({
      where: {
        id: {
          equals: id as string
        }
      }
    });
    
    return new HttpResponse(null, { status: 204 });
  }),
  
  // 获取导师的学生
  http.get('/api/mentors/:id/students', ({ params }) => {
    const { id } = params;
    
    const mentor = db.mentor.findFirst({
      where: {
        id: {
          equals: id as string
        }
      }
    });
    
    if (!mentor) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(mentor.students);
  }),
  
  // 为导师添加学生
  http.post('/api/mentors/:id/students', async ({ params, request }) => {
    const { id } = params;
    const { studentId } = await request.json() as { studentId: string };
    
    const mentor = db.mentor.findFirst({
      where: {
        id: {
          equals: id as string
        }
      }
    });
    
    if (!mentor) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // 检查学生是否已经分配给该导师
    // @ts-ignore - 忽略类型错误，实际使用时应该确保类型正确
    if (mentor.students.some((s: { id: string }) => s.id === studentId)) {
      return new HttpResponse(null, { 
        status: 400,
        statusText: 'Student already assigned to this mentor'
      });
    }
    
    // 移除学生
    // @ts-ignore - 忽略类型错误，实际使用时应该确保类型正确
    const updatedStudents = mentor.students.filter((s: { id: string }) => s.id !== studentId);
    
    // 更新导师状态
    const updatedMentor = db.mentor.update({
      where: {
        id: {
          equals: id as string
        }
      },
      data: {
        students: updatedStudents
      }
    });
    
    return HttpResponse.json(updatedMentor);
  }),

  // 获取导师学生列表
  http.get('/api/mentor/students', async () => {
    console.log('收到获取导师学生列表请求');
    await delay(800);
    return HttpResponse.json(students);
  }),

  // 获取学生详情
  http.get('/api/mentor/students/:id', async ({ params }) => {
    console.log(`收到获取学生详情请求: ID ${params.id}`);
    const student = students.find(s => s.id === params.id);
    
    if (!student) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Student not found'
      });
    }
    
    await delay(600);
    return HttpResponse.json(student);
  })
]; 