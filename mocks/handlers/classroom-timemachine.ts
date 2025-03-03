import { http, HttpResponse, delay } from 'msw';

// Types
export interface ClassRecord {
  id: string;
  title: string;
  thumbnail: string;
  date: string;
  duration: string;
  teacher: string;
  class: string;
  subject: string;
  likes: number;
  isMine: boolean;
}

export interface TeachingMoment {
  id: string;
  title: string;
  date: string;
  type: 'note' | 'audio' | 'video' | 'homework' | 'other';
  subject: string;
  description: string;
  thumbnail?: string;
  teacher: string;
  teacherAvatar?: string;
  duration?: string;
  content?: string;
  likes?: number;
  comments?: {
    author: string;
    date: string;
    content: string;
    likes: number;
  }[];
}

export interface FilmStrip {
  semester: string;
  startDate: string;
  endDate: string;
  moments: TeachingMoment[];
}

// Mock data
const classroomRecords: ClassRecord[] = [
  {
    id: '1',
    title: '初中数学函数概念导入课',
    thumbnail: 'https://images.unsplash.com/photo-1596496050827-8299e0220de1?q=80&w=1000&auto=format&fit=crop',
    date: '2023-09-15',
    duration: '45分钟',
    teacher: '张老师',
    class: '初三(2)班',
    subject: '数学',
    likes: 128,
    isMine: true
  },
  {
    id: '2',
    title: '高中物理力学实验课',
    thumbnail: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop',
    date: '2023-10-20',
    duration: '40分钟',
    teacher: '李老师',
    class: '高一(3)班',
    subject: '物理',
    likes: 95,
    isMine: false
  },
  {
    id: '3',
    title: '小学语文古诗词鉴赏',
    thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1000&auto=format&fit=crop',
    date: '2023-11-05',
    duration: '35分钟',
    teacher: '王老师',
    class: '六年级(1)班',
    subject: '语文',
    likes: 156,
    isMine: true
  },
  {
    id: '4',
    title: '初中英语口语练习课',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop',
    date: '2023-11-12',
    duration: '45分钟',
    teacher: '刘老师',
    class: '初二(4)班',
    subject: '英语',
    likes: 87,
    isMine: false
  },
  {
    id: '5',
    title: '高中化学元素周期表教学',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1000&auto=format&fit=crop',
    date: '2023-11-25',
    duration: '50分钟',
    teacher: '赵老师',
    class: '高二(1)班',
    subject: '化学',
    likes: 112,
    isMine: false
  },
  {
    id: '6',
    title: '初中历史近代史专题',
    thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1000&auto=format&fit=crop',
    date: '2023-12-03',
    duration: '40分钟',
    teacher: '孙老师',
    class: '初三(1)班',
    subject: '历史',
    likes: 78,
    isMine: true
  }
];

const filmStrips: FilmStrip[] = [
  {
    semester: '2023年秋季学期',
    startDate: '2023-09-01',
    endDate: '2024-01-15',
    moments: [
      {
        id: 'm1',
        title: '函数概念导入',
        date: '2023-09-15',
        type: 'note',
        subject: '数学',
        description: '通过生活中的实例引入函数概念，帮助学生理解函数的实际应用。',
        thumbnail: 'https://images.unsplash.com/photo-1596496050827-8299e0220de1?q=80&w=500&auto=format&fit=crop',
        teacher: '张老师',
        teacherAvatar: 'https://i.pravatar.cc/150?img=1',
        duration: '45分钟',
        content: '函数是描述两个变量之间对应关系的数学概念。在本节课中，我们通过分析温度与时间、距离与时间等日常生活中的例子，帮助学生建立函数的直观认识。\n\n重点讲解了：\n1. 函数的定义和表示方法\n2. 自变量和因变量的概念\n3. 函数的图像表示',
        likes: 42,
        comments: [
          {
            author: '李明',
            date: '2023-09-16',
            content: '这节课的例子很生动，学生们都很容易理解函数概念。',
            likes: 5
          },
          {
            author: '王芳',
            date: '2023-09-17',
            content: '建议可以增加一些互动环节，让学生自己尝试找出生活中的函数关系。',
            likes: 3
          }
        ]
      },
      {
        id: 'm2',
        title: '二次函数图像分析',
        date: '2023-10-10',
        type: 'video',
        subject: '数学',
        description: '详细讲解二次函数的图像特征及变换规律。',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=500&auto=format&fit=crop',
        teacher: '张老师',
        teacherAvatar: 'https://i.pravatar.cc/150?img=1',
        duration: '40分钟',
        likes: 38,
        comments: []
      },
      {
        id: 'm3',
        title: '力学实验记录',
        date: '2023-10-20',
        type: 'note',
        subject: '物理',
        description: '牛顿第二定律验证实验的详细记录和数据分析。',
        thumbnail: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=500&auto=format&fit=crop',
        teacher: '李老师',
        teacherAvatar: 'https://i.pravatar.cc/150?img=2',
        duration: '50分钟',
        content: '本次实验通过测量不同质量物体在相同作用力下的加速度，验证了牛顿第二定律。\n\n实验数据：\n质量(kg) | 加速度(m/s²)\n0.5 | 2.1\n1.0 | 1.05\n1.5 | 0.68\n2.0 | 0.52\n\n数据分析表明，物体的加速度与其质量成反比，与作用力成正比，符合F=ma的关系。',
        likes: 27,
        comments: [
          {
            author: '张伟',
            date: '2023-10-21',
            content: '实验数据的误差分析可以更详细一些。',
            likes: 2
          }
        ]
      },
      {
        id: 'm4',
        title: '古诗词鉴赏方法',
        date: '2023-11-05',
        type: 'audio',
        subject: '语文',
        description: '讲解古诗词鉴赏的基本方法和技巧。',
        thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=500&auto=format&fit=crop',
        teacher: '王老师',
        teacherAvatar: 'https://i.pravatar.cc/150?img=3',
        duration: '35分钟',
        likes: 56,
        comments: [
          {
            author: '刘芳',
            date: '2023-11-06',
            content: '老师讲解的鉴赏方法很实用，对理解古诗词的意境有很大帮助。',
            likes: 8
          },
          {
            author: '张明',
            date: '2023-11-07',
            content: '希望能有更多这样的讲解，特别是对于一些难懂的古诗。',
            likes: 5
          }
        ]
      },
      {
        id: 'm5',
        title: '英语口语练习',
        date: '2023-11-12',
        type: 'video',
        subject: '英语',
        description: '日常英语口语表达和对话练习。',
        thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=500&auto=format&fit=crop',
        teacher: '刘老师',
        teacherAvatar: 'https://i.pravatar.cc/150?img=4',
        duration: '45分钟',
        likes: 45,
        comments: []
      }
    ]
  },
  {
    semester: '2023年春季学期',
    startDate: '2023-02-15',
    endDate: '2023-07-01',
    moments: [
      {
        id: 'm6',
        title: '化学元素周期表',
        date: '2023-03-10',
        type: 'note',
        subject: '化学',
        description: '元素周期表的规律和应用。',
        thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=500&auto=format&fit=crop',
        teacher: '赵老师',
        teacherAvatar: 'https://i.pravatar.cc/150?img=5',
        duration: '50分钟',
        content: '元素周期表是化学中最重要的工具之一，它按照元素的原子序数和电子构型排列所有已知的化学元素。\n\n本节课重点讲解：\n1. 元素周期表的历史和发展\n2. 周期表中元素的排列规律\n3. 元素性质的周期性变化\n4. 如何利用周期表预测元素性质',
        likes: 32,
        comments: []
      },
      {
        id: 'm7',
        title: '近代史重要事件',
        date: '2023-04-05',
        type: 'homework',
        subject: '历史',
        description: '中国近代史上的重要历史事件和人物分析。',
        thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=500&auto=format&fit=crop',
        teacher: '孙老师',
        teacherAvatar: 'https://i.pravatar.cc/150?img=6',
        duration: '40分钟',
        content: '作业要求：\n1. 选择中国近代史(1840-1949)中的一个重要历史事件\n2. 分析该事件的起因、经过和影响\n3. 评价该事件在中国近代化进程中的作用\n4. 字数要求：800字以上\n\n提交截止日期：2023年4月12日',
        likes: 28,
        comments: [
          {
            author: '李华',
            date: '2023-04-06',
            content: '这个作业很有意义，让我们能够深入思考历史事件的影响。',
            likes: 4
          }
        ]
      },
      {
        id: 'm8',
        title: '生物细胞结构',
        date: '2023-05-15',
        type: 'video',
        subject: '生物',
        description: '细胞结构和功能的详细讲解。',
        thumbnail: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?q=80&w=500&auto=format&fit=crop',
        teacher: '陈老师',
        teacherAvatar: 'https://i.pravatar.cc/150?img=7',
        duration: '45分钟',
        likes: 36,
        comments: []
      }
    ]
  },
  {
    semester: '2022年秋季学期',
    startDate: '2022-09-01',
    endDate: '2023-01-15',
    moments: [
      {
        id: 'm9',
        title: '地理气候类型',
        date: '2022-10-20',
        type: 'note',
        subject: '地理',
        description: '世界主要气候类型及其分布特点。',
        thumbnail: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=500&auto=format&fit=crop',
        teacher: '郑老师',
        teacherAvatar: 'https://i.pravatar.cc/150?img=8',
        duration: '40分钟',
        content: '世界气候类型主要分为热带、温带、寒带三大类，每类又有多种亚类。\n\n本节课重点讲解：\n1. 各类气候的形成原因\n2. 气候类型的地理分布\n3. 气候对人类生活和生产的影响\n4. 全球气候变化的趋势和影响',
        likes: 30,
        comments: []
      },
      {
        id: 'm10',
        title: '政治思想启蒙',
        date: '2022-11-15',
        type: 'audio',
        subject: '政治',
        description: '政治思想的基本概念和发展历程。',
        thumbnail: 'https://images.unsplash.com/photo-1569701813229-33284b643e3c?q=80&w=500&auto=format&fit=crop',
        teacher: '吴老师',
        teacherAvatar: 'https://i.pravatar.cc/150?img=9',
        duration: '35分钟',
        likes: 25,
        comments: []
      }
    ]
  }
];

// Handlers
export const classroomTimemachineHandlers = [
  // Get all classroom records
  http.get('*/api/classroom-timemachine/records', async ({ request }) => {
    await delay(500);
    
    try {
      // 获取授权头
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new HttpResponse(
          JSON.stringify({ error: '未授权访问' }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      console.log('获取课堂记录列表');
      return HttpResponse.json(classroomRecords);
    } catch (error) {
      console.error('获取课堂记录失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取课堂记录失败' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }),

  // Get a single classroom record by ID
  http.get('*/api/classroom-timemachine/records/:id', async ({ params, request }) => {
    const { id } = params;
    await delay(300);
    
    try {
      // 获取授权头
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new HttpResponse(
          JSON.stringify({ error: '未授权访问' }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      console.log('获取课堂记录详情:', id);
      const record = classroomRecords.find(r => r.id === id);
      
      if (!record) {
        return new HttpResponse(
          JSON.stringify({ error: '课堂记录不存在' }), 
          { 
            status: 404,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      return HttpResponse.json(record);
    } catch (error) {
      console.error('获取课堂记录详情失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取课堂记录详情失败' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }),

  // Get all film strips
  http.get('*/api/classroom-timemachine/filmstrips', async ({ request }) => {
    await delay(600);
    
    try {
      // 获取授权头
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new HttpResponse(
          JSON.stringify({ error: '未授权访问' }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      console.log('获取胶片条列表');
      return HttpResponse.json(filmStrips);
    } catch (error) {
      console.error('获取胶片条列表失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取胶片条列表失败' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }),

  // Get film strips by semester
  http.get('*/api/classroom-timemachine/filmstrips/:semester', async ({ params, request }) => {
    const { semester } = params;
    await delay(400);
    
    try {
      // 获取授权头
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new HttpResponse(
          JSON.stringify({ error: '未授权访问' }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      console.log('获取学期胶片条:', semester);
      const strip = filmStrips.find(s => s.semester === semester);
      
      if (!strip) {
        return new HttpResponse(
          JSON.stringify({ error: '未找到该学期的课堂记录' }), 
          { 
            status: 404,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      return HttpResponse.json(strip);
    } catch (error) {
      console.error('获取学期胶片条失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取学期胶片条失败' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }),

  // Get teaching moment details by ID
  http.get('*/api/classroom-timemachine/moments/:id', async ({ params, request }) => {
    const { id } = params;
    await delay(350);
    
    try {
      // 获取授权头
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new HttpResponse(
          JSON.stringify({ error: '未授权访问' }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      console.log('获取教学时刻详情:', id);
      let moment: TeachingMoment | undefined;
      
      for (const strip of filmStrips) {
        moment = strip.moments.find(m => m.id === id);
        if (moment) break;
      }
      
      if (!moment) {
        return new HttpResponse(
          JSON.stringify({ error: '教学时刻不存在' }), 
          { 
            status: 404,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      return HttpResponse.json(moment);
    } catch (error) {
      console.error('获取教学时刻详情失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取教学时刻详情失败' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  })
]; 