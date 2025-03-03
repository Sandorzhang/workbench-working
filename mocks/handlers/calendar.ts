import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

// 日历事件类型
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  description: string;
  participants: string[];
}

// 获取YYYY-MM-DD格式的日期字符串
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 模拟日历事件数据
const mockEvents = [
  {
    id: '1',
    title: '教师会议',
    date: '2024-03-20',
    startTime: '09:00',
    endTime: '10:30',
    location: '会议室A',
    type: 'meeting',
    description: '讨论本学期教学计划',
    participants: ['张老师', '李老师', '王老师']
  },
  {
    id: '2',
    title: '高等数学课',
    date: '2024-03-20',
    startTime: '14:00',
    endTime: '15:30',
    location: '教室201',
    type: 'class',
    description: '微积分基础',
    participants: ['一年级数学班']
  },
  {
    id: '3',
    title: '期中考试',
    date: '2024-03-25',
    startTime: '09:00',
    endTime: '11:00',
    location: '考场1',
    type: 'exam',
    description: '高等数学期中考试',
    participants: ['一年级全体学生']
  },
  {
    id: '4',
    title: '校园文化节',
    date: '2024-03-28',
    startTime: '13:00',
    endTime: '17:00',
    location: '学校操场',
    type: 'activity',
    description: '年度校园文化节活动',
    participants: ['全校师生']
  },
  {
    id: '5',
    title: '清明节放假',
    date: '2024-04-05',
    startTime: '00:00',
    endTime: '23:59',
    location: '',
    type: 'holiday',
    description: '清明节假期',
    participants: []
  }
];

// 将事件数据添加到数据库
db.calendar = {
  events: mockEvents,
  create: (data: any) => {
    const event = {
      id: String(Date.now()),
      ...data
    };
    mockEvents.push(event);
    return event;
  },
  getAll: () => mockEvents,
  findById: (id: string) => mockEvents.find(event => event.id === id),
  update: (id: string, data: any) => {
    const index = mockEvents.findIndex(event => event.id === id);
    if (index === -1) return null;
    mockEvents[index] = { ...mockEvents[index], ...data };
    return mockEvents[index];
  },
  delete: (id: string) => {
    const index = mockEvents.findIndex(event => event.id === id);
    if (index === -1) return false;
    mockEvents.splice(index, 1);
    return true;
  }
};

// 为测试目的，创建一个有效的会话
const createTestSession = () => {
  // 检查是否已存在测试会话
  const existingSession = db.session.findFirst({
    where: {
      userId: {
        equals: '1', // 管理员用户ID
      },
    },
  });

  if (!existingSession) {
    // 创建一个新的测试会话
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24小时有效期
    
    db.session.create({
      id: String(Date.now()),
      userId: '1', // 管理员用户ID
      token: 'test-token-for-calendar',
      expiresAt: expiresAt.toISOString(),
    });
    
    console.log('已创建测试会话用于日历API');
  }
};

// 确保有一个测试会话可用
createTestSession();

export const calendarHandlers = [
  // 获取日历事件列表
  http.get('*/api/calendar-events', async ({ request }) => {
    await delay(300);
    
    // 解析URL参数
    const url = new URL(request.url);
    const yearParam = url.searchParams.get('year');
    const monthParam = url.searchParams.get('month');
    
    console.log(`收到获取日历事件请求 - 参数: 年=${yearParam}, 月=${monthParam}`);
    
    // 从请求头中获取令牌
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('日历API: 未提供授权头或格式不正确');
      return new HttpResponse(
        JSON.stringify({ error: '未授权' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    const token = authHeader.split(' ')[1];
    console.log(`日历API: 收到token: ${token}`);
    
    // 查找会话
    const session = db.session.findFirst({
      where: {
        token: {
          equals: token,
        },
      },
    });
    
    if (!session) {
      console.log(`日历API: 未找到会话，token: ${token}`);
      return new HttpResponse(
        JSON.stringify({ error: '会话不存在' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // 验证会话是否过期
    if (new Date(session.expiresAt) < new Date()) {
      console.log('日历API: 会话已过期');
      return new HttpResponse(
        JSON.stringify({ error: '会话已过期' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // 查找用户
    const user = db.user.findFirst({
      where: {
        id: {
          equals: session.userId,
        },
      },
    });
    
    if (!user) {
      console.log('日历API: 未找到用户');
      return new HttpResponse(
        JSON.stringify({ error: '用户不存在' }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // 获取所有日历事件 - 使用原始数组而不是db对象以避免类型错误
    let events = [...mockEvents];
    
    // 如果有年月参数，进行过滤
    if (yearParam && monthParam) {
      const year = parseInt(yearParam);
      const month = parseInt(monthParam);
      
      // 生成过滤用的月份前缀，例如 '2024-03-'
      const filterPrefix = `${year}-${month.toString().padStart(2, '0')}-`;
      
      // 过滤出当月的事件
      events = events.filter(event => event.date.startsWith(filterPrefix));
      
      // 也包含前后一个月的事件，以覆盖日历视图中可能显示的上下月日期
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevMonthPrefix = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-`;
      
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const nextMonthPrefix = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-`;
      
      // 也添加前后月的事件
      const prevMonthEvents = mockEvents.filter(event => 
        event.date.startsWith(prevMonthPrefix)
      );
      
      const nextMonthEvents = mockEvents.filter(event => 
        event.date.startsWith(nextMonthPrefix)
      );
      
      // 合并前后月份事件
      events = [...events, ...prevMonthEvents, ...nextMonthEvents];
      
      console.log(`日历API: 过滤后返回 ${events.length} 个事件 (年: ${year}, 月: ${month})`);
    } else {
      console.log(`日历API: 返回所有 ${events.length} 个事件`);
    }
    
    return HttpResponse.json(events);
  }),
  
  // 创建日历事件
  http.post('*/api/calendar-events', async ({ request }) => {
    await delay(300);
    
    // 验证授权
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const session = db.session.findFirst({
      where: {
        token: {
          equals: token,
        },
      },
    });
    
    if (!session || new Date(session.expiresAt) < new Date()) {
      return new HttpResponse(null, { status: 401 });
    }
    
    try {
      // 创建事件
      const data = await request.json() as CalendarEvent;
      const event = db.calendar.create({
        id: String(Date.now()),
        title: data.title || '',
        date: data.date || '',
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        location: data.location || '',
        type: data.type || '',
        description: data.description || '',
        participants: data.participants || [],
      });
      
      return HttpResponse.json(event);
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ error: '无效的请求数据' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }),
  
  // 更新日历事件
  http.put('*/api/calendar-events/:id', async ({ request, params }) => {
    await delay(300);
    
    // 验证授权
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const session = db.session.findFirst({
      where: {
        token: {
          equals: token,
        },
      },
    });
    
    if (!session || new Date(session.expiresAt) < new Date()) {
      return new HttpResponse(null, { status: 401 });
    }
    
    // 查找要更新的事件
    const existingEvent = db.calendar.findFirst({
      where: {
        id: {
          equals: params.id
        }
      }
    });
    
    if (!existingEvent) {
      return new HttpResponse(null, { status: 404 });
    }
    
    try {
      // 更新事件
      const data = await request.json() as Partial<CalendarEvent>;
      const updatedEvent = db.calendar.update({
        where: {
          id: {
            equals: params.id
          }
        },
        data: {
          title: data.title,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          location: data.location,
          type: data.type,
          description: data.description,
          participants: data.participants,
        }
      });
      
      return HttpResponse.json(updatedEvent);
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ error: '无效的请求数据' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }),
  
  // 删除日历事件
  http.delete('*/api/calendar-events/:id', async ({ request, params }) => {
    await delay(300);
    
    // 验证授权
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const session = db.session.findFirst({
      where: {
        token: {
          equals: token,
        },
      },
    });
    
    if (!session || new Date(session.expiresAt) < new Date()) {
      return new HttpResponse(null, { status: 401 });
    }
    
    // 删除事件
    db.calendar.delete({
      where: {
        id: {
          equals: params.id
        }
      }
    });
    
    return new HttpResponse(null, { status: 204 });
  }),
  
  // 获取特定年月的日历事件
  http.get('*/api/calendar-events', async ({ request }) => {
    await delay(300);
    
    // 解析查询参数
    const url = new URL(request.url);
    const year = url.searchParams.get('year');
    const month = url.searchParams.get('month');
    
    console.log(`获取日历事件: 年=${year}, 月=${month}`);
    
    if (!year || !month) {
      return new HttpResponse(null, { status: 400, statusText: '缺少必要的查询参数' });
    }
    
    // 获取当前月份的第一天和最后一天
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    
    // 将日期转换为字符串格式，便于比较
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    
    // 筛选当前月份的事件
    const events = mockEvents.filter(event => {
      return event.date >= startDateStr && event.date <= endDateStr;
    });
    
    // 如果没有事件，生成一些示例事件
    if (events.length === 0) {
      // 为当前月份生成一些随机事件
      const generatedEvents = [];
      
      // 生成3个随机事件
      for (let i = 1; i <= 3; i++) {
        // 随机一个当月的日期
        const day = Math.floor(Math.random() * endDate.getDate()) + 1;
        const eventDate = new Date(parseInt(year), parseInt(month) - 1, day);
        
        generatedEvents.push({
          id: `generated-${i}`,
          title: ['教师会议', '班级活动', '教研讨论', '教师培训'][Math.floor(Math.random() * 4)],
          date: formatDate(eventDate),
          startTime: '09:00',
          endTime: '11:00',
          location: ['会议室A', '教室201', '多功能厅', '在线会议'][Math.floor(Math.random() * 4)],
          type: ['meeting', 'class', 'training', 'other'][Math.floor(Math.random() * 4)],
          description: '自动生成的日历事件',
          participants: ['张老师', '李老师', '王老师']
        });
      }
      
      return HttpResponse.json(generatedEvents);
    }
    
    return HttpResponse.json(events);
  }),
]; 