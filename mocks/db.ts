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
  
  // 添加更多初始数据...
} 