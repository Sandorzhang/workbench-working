import { factory, primaryKey } from '@mswjs/data';

// 创建模拟数据库模型
export const db = factory({
  // 用户模型
  user: {
    id: primaryKey(String),
    name: String,
    email: String,
    avatar: String,
    createdAt: String,
    username: String,
    password: String,
    phone: String,
    role: String, // 'admin' or 'teacher'
  },
  // 用户会话模型
  session: {
    id: primaryKey(String),
    userId: String,
    token: String,
    expiresAt: String,
  },
  // 应用模型 - 用于工作台
  application: {
    id: primaryKey(String),
    name: String,
    description: String,
    icon: String,
    url: String,
    roles: Array, // Which roles can access this app
  },
  calendar: {
    id: primaryKey(String),
    title: String,
    date: String,
    startTime: String,
    endTime: String,
    location: String,
    type: String,
    description: String,
    participants: Array,
  },
  // 可以添加更多模型
});

// 初始化一些模拟数据
export function seedDb() {
  // 添加用户示例数据
  db.user.create({
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    createdAt: new Date().toISOString(),
    username: 'admin',
    password: 'password123',
    phone: '13800138000',
    role: 'admin',
  });
  
  db.user.create({
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    createdAt: new Date().toISOString(),
    username: 'teacher',
    password: 'password123',
    phone: '13900139000',
    role: 'teacher',
  });
  
  // 添加应用示例数据
  db.application.create({
    id: '1',
    name: '用户管理',
    description: '管理系统用户',
    icon: 'users',
    url: '/dashboard/users',
    roles: ['admin'],
  });
  
  db.application.create({
    id: '2',
    name: '课程管理',
    description: '管理教学课程',
    icon: 'book',
    url: '/dashboard/courses',
    roles: ['admin', 'teacher'],
  });
  
  db.application.create({
    id: '3',
    name: '成绩录入',
    description: '录入学生成绩',
    icon: 'clipboard',
    url: '/dashboard/grades',
    roles: ['teacher'],
  });
  
  // 创建一个默认的有效会话（用于开发测试）
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24小时有效期
  
  db.session.create({
    id: 'default-session',
    userId: '1', // 管理员用户ID
    token: 'default-token',
    expiresAt: expiresAt.toISOString(),
  });
  
  console.log('已创建默认会话，token: default-token');
  
  // 创建默认日历事件
  db.calendar.create({
    id: '1',
    title: '教师会议',
    date: '2024-03-20',
    startTime: '09:00',
    endTime: '10:30',
    location: '会议室A',
    type: 'meeting',
    description: '讨论本学期教学计划',
    participants: ['张老师', '李老师', '王老师'],
  });

  db.calendar.create({
    id: '2',
    title: '高等数学课',
    date: '2024-03-20',
    startTime: '14:00',
    endTime: '15:30',
    location: '教室201',
    type: 'class',
    description: '微积分基础',
    participants: ['一年级数学班'],
  });

  db.calendar.create({
    id: '3',
    title: '期中考试',
    date: '2024-03-25',
    startTime: '09:00',
    endTime: '11:00',
    location: '考场1',
    type: 'exam',
    description: '高等数学期中考试',
    participants: ['一年级全体学生'],
  });

  db.calendar.create({
    id: '4',
    title: '校园文化节',
    date: '2024-03-28',
    startTime: '13:00',
    endTime: '17:00',
    location: '学校操场',
    type: 'activity',
    description: '年度校园文化节活动',
    participants: ['全校师生'],
  });

  db.calendar.create({
    id: '5',
    title: '清明节放假',
    date: '2024-04-05',
    startTime: '00:00',
    endTime: '23:59',
    location: '',
    type: 'holiday',
    description: '清明节假期',
    participants: [],
  });
  
  // 添加更多初始数据...
} 