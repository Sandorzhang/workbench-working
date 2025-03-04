import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { Student } from '@/lib/types';

// 教师数据处理程序
export const teacherHandlers = [
  // 获取当前登录教师的信息
  http.get('/api/teacher/me', () => {
    console.log('MSW: 接收到获取当前教师信息的请求');
    // 模拟从认证系统获取当前用户ID (本例中固定返回ID为2的教师)
    const teacherId = '2'; 
    
    const teacher = db.user.findFirst({
      where: {
        id: {
          equals: teacherId,
        },
        role: {
          equals: 'teacher',
        },
      },
    });

    if (!teacher) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(teacher);
  }),

  // 获取教师负责的学生列表
  http.get('/api/teacher/students', () => {
    console.log('MSW: 接收到获取教师学生列表的请求');
    // 模拟当前教师ID
    const teacherId = '2';
    
    // 从导师表中查找该教师对应的导师记录
    const mentor = db.mentor.findFirst({
      where: {
        id: {
          equals: teacherId,
        },
      },
    });

    if (!mentor || !mentor.students || mentor.students.length === 0) {
      // 如果没有找到或者没有学生，返回空数组
      return HttpResponse.json([]);
    }

    // 添加更多的学生信息
    const enrichedStudents = (mentor.students as Student[]).map(student => {
      return {
        ...student,
        avatar: student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`,
        indicators: [
          { 
            id: `ind-${student.id}-1`, 
            name: '学习态度', 
            value: Math.floor(Math.random() * 5) + 1,
            maxValue: 5
          },
          { 
            id: `ind-${student.id}-2`, 
            name: '学业进度', 
            value: Math.floor(Math.random() * 100),
            maxValue: 100
          },
          { 
            id: `ind-${student.id}-3`, 
            name: '参与度', 
            value: Math.floor(Math.random() * 10) + 1,
            maxValue: 10
          }
        ]
      };
    });

    return HttpResponse.json(enrichedStudents);
  }),

  // 获取单个学生的详细信息
  http.get('/api/teacher/students/:id', ({ params }) => {
    console.log(`MSW: 接收到获取学生(ID: ${params.id})的详细信息请求`);
    const { id } = params;
    
    // 模拟当前教师ID
    const teacherId = '2';
    
    // 从导师表中查找该教师对应的导师记录
    const mentor = db.mentor.findFirst({
      where: {
        id: {
          equals: teacherId,
        },
      },
    });

    if (!mentor || !mentor.students) {
      return new HttpResponse(null, { status: 404 });
    }

    // 查找学生
    const student = (mentor.students as Student[]).find(s => s.id === id);
    
    if (!student) {
      return new HttpResponse(null, { status: 404 });
    }

    // 调整学生的指标评分，更符合K12学生特点
    const studentIndicators = [
      { 
        id: `ind-${student.id}-1`, 
        name: '学习态度', 
        value: Math.floor(Math.random() * 5) + 1,
        maxValue: 5,
        description: '学生在课堂和自主学习中的积极性和认真程度'
      },
      { 
        id: `ind-${student.id}-2`, 
        name: '学业进度', 
        value: Math.floor(Math.random() * 100),
        maxValue: 100,
        description: '相比学期初的学习目标完成情况'
      },
      { 
        id: `ind-${student.id}-3`, 
        name: '参与度', 
        value: Math.floor(Math.random() * 10) + 1,
        maxValue: 10,
        description: '课堂发言、小组合作和课外活动的参与程度'
      }
    ];

    // 丰富学生数据，提供K12学生的相关信息
    const enrichedStudent = {
      ...student,
      avatar: student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`,
      indicators: studentIndicators,
      personalInfo: {
        birthday: '2010-06-15',
        gender: Math.random() > 0.5 ? '男' : '女',
        contact: '家长电话: 135****' + Math.floor(Math.random() * 10000),
        address: '北京市海淀区某小区',
        interests: ['阅读', '绘画', '篮球', '科学实验'],
        strengths: ['专注力强', '思维活跃', '善于表达', '团队合作'],
        improvements: ['作业完成质量', '数学计算准确性', '课堂专注度']
      },
      academicRecords: [
        {
          id: `record-${student.id}-1`,
          subject: '语文',
          grade: Math.floor(Math.random() * 15) + 85,
          date: '2023-12-15',
          comments: '本次单元测试表现优秀，作文观点新颖，语言表达流畅。需加强成语和古诗文背诵。'
        },
        {
          id: `record-${student.id}-2`,
          subject: '数学',
          grade: Math.floor(Math.random() * 20) + 75,
          date: '2023-12-10',
          comments: '基础题掌握扎实，应用题需要加强。思维较为灵活，但有时粗心导致计算错误。'
        },
        {
          id: `record-${student.id}-3`,
          subject: '英语',
          grade: Math.floor(Math.random() * 25) + 70,
          date: '2023-12-05',
          comments: '单词拼写和阅读理解不错，听力和口语表达需要加强练习。建议多参与英语角活动。'
        },
        {
          id: `record-${student.id}-4`,
          subject: '科学',
          grade: Math.floor(Math.random() * 20) + 80,
          date: '2023-11-25',
          comments: '对实验活动很感兴趣，观察能力强，报告撰写清晰。可以鼓励参加科学兴趣小组。'
        }
      ],
      notes: [
        {
          id: `note-${student.id}-1`,
          date: '2023-12-20',
          content: '与家长沟通后了解到学生在家学习时容易分心，建议使用番茄工作法帮助集中注意力。',
          author: '李老师'
        },
        {
          id: `note-${student.id}-2`,
          date: '2023-12-05',
          content: '本周课堂表现积极，主动回答问题，并在小组活动中表现出领导能力。',
          author: '李老师'
        },
        {
          id: `note-${student.id}-3`,
          date: '2023-11-15',
          content: '数学考试后进行了一对一辅导，针对分数应用题的解题思路进行了讲解，学生理解并掌握了方法。',
          author: '李老师'
        }
      ]
    };

    return HttpResponse.json(enrichedStudent);
  }),

  // 添加学生笔记
  http.post('/api/teacher/students/:id/notes', async ({ params, request }) => {
    const { id } = params;
    const noteData = await request.json() as { content: string };
    
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    return HttpResponse.json({
      id: `note-${id}-${Date.now()}`,
      date: formattedDate,
      content: noteData.content || '',
      author: '李老师'
    }, { status: 201 });
  }),
]; 