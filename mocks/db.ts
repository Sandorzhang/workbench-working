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
    tenant: String, // 用户所属租户
    tenantType: String, // 租户类型
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
  // 导师模型
  mentor: {
    id: primaryKey(String),
    name: String,
    email: String,
    avatar: String,
    title: String,
    phone: String,
    bio: String,
    specialties: Array,
    isAssigned: Boolean, // 是否已分配学生
    students: Array, // 指导的学生列表
  },
  // 学生模型 (用于导师-学生关系)
  student: {
    id: primaryKey(String),
    name: String,
    email: String,
    avatar: String,
    grade: String,
    major: String,
  },
  // 考试类型
  exam: {
    id: primaryKey(String),
    name: String,
    subject: String,
    grade: String,
    semester: String,
    startTime: String,
    endTime: String,
    status: String, // 'published' or 'draft'
  },
  // 学科模型
  subject: {
    id: primaryKey(String),
    name: String,
    icon: String,
    description: String,
  },
  // 学业标准模型
  academicStandard: {
    id: primaryKey(String),
    title: String,
    category: String, // 'competencies' 或 'domains'
    subject: String, // 关联学科ID
    grade: String,
    description: String,
    count: Number, // 标准条目数量
  },
  // 标准详情模型
  standardDetail: {
    id: primaryKey(String),
    standardId: String, // 关联的学业标准ID
    content: String,
    type: String, // 'knowledge', 'skill', 'attitude'
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
    tenant: '北京第一中学',
    tenantType: '九年一贯制'
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
    tenant: '通用平台',
    tenantType: '完全中学'
  });
  
  // 添加学科数据
  db.subject.create({
    id: 'math',
    name: '数学',
    icon: 'math',
    description: '数学学科',
  });
  
  db.subject.create({
    id: 'chinese',
    name: '语文',
    icon: 'book',
    description: '语文学科',
  });
  
  db.subject.create({
    id: 'english',
    name: '英语',
    icon: 'book',
    description: '英语学科',
  });
  
  db.subject.create({
    id: 'science',
    name: '科学',
    icon: 'book',
    description: '科学学科',
  });
  
  // 添加数学学科的学业标准
  // 核心素养类别
  db.academicStandard.create({
    id: 'math-competency-1',
    title: '数学抽象',
    category: 'competencies',
    subject: 'math',
    grade: '一年级',
    description: '数学抽象是数学的基本思维特征，是在数学活动中借助于符号对客观事物的本质属性和关系加以抽提并进行形式化的思维过程。',
    count: 6,
  });
  
  db.academicStandard.create({
    id: 'math-competency-2',
    title: '逻辑推理',
    category: 'competencies',
    subject: 'math',
    grade: '一年级',
    description: '逻辑推理是遵循逻辑规则，由已知的判断得出新判断的思维过程。它是人们认识事物、解决问题的基本方式。',
    count: 4,
  });
  
  db.academicStandard.create({
    id: 'math-competency-3',
    title: '数学建模',
    category: 'competencies',
    subject: 'math',
    grade: '二年级',
    description: '数学建模是从实际问题中抽象出数学模型，利用数学方法求解并解释结果的过程。',
    count: 5,
  });
  
  db.academicStandard.create({
    id: 'math-competency-4',
    title: '直观想象',
    category: 'competencies',
    subject: 'math',
    grade: '二年级',
    description: '直观想象是借助于图形等形象思维来理解和表达数学内容的过程。',
    count: 3,
  });
  
  db.academicStandard.create({
    id: 'math-competency-5',
    title: '数据分析',
    category: 'competencies',
    subject: 'math',
    grade: '三年级',
    description: '数据分析是收集、整理、分析数据，从数据中发现规律和趋势的过程。',
    count: 8,
  });
  
  // 领域/主题类别
  db.academicStandard.create({
    id: 'math-domain-1',
    title: '数与代数',
    category: 'domains',
    subject: 'math',
    grade: '一年级',
    description: '数与代数是数学的基础领域，包括数的认识、运算和代数初步等内容。',
    count: 12,
  });
  
  db.academicStandard.create({
    id: 'math-domain-2',
    title: '图形与几何',
    category: 'domains',
    subject: 'math',
    grade: '二年级',
    description: '图形与几何是研究图形的性质和空间关系的数学领域。',
    count: 7,
  });
  
  db.academicStandard.create({
    id: 'math-domain-3',
    title: '统计与概率',
    category: 'domains',
    subject: 'math',
    grade: '三年级',
    description: '统计与概率是收集、整理、分析数据并进行概率计算的数学领域。',
    count: 6,
  });
  
  db.academicStandard.create({
    id: 'math-domain-4',
    title: '量与计量',
    category: 'domains',
    subject: 'math',
    grade: '四年级',
    description: '量与计量是研究各种量的测量和计算的数学领域。',
    count: 5,
  });
  
  db.academicStandard.create({
    id: 'math-domain-5',
    title: '综合与实践',
    category: 'domains',
    subject: 'math',
    grade: '五年级',
    description: '综合与实践是应用数学知识解决实际问题的领域。',
    count: 4,
  });
  
  // 添加标准详情
  // 数学抽象标准详情
  db.standardDetail.create({
    id: 'math-comp-1-detail-1',
    standardId: 'math-competency-1',
    content: '能够从生活中的具体情境中抽象出基本的数学概念',
    type: 'knowledge',
  });
  
  db.standardDetail.create({
    id: 'math-comp-1-detail-2',
    standardId: 'math-competency-1',
    content: '能够使用数学符号表示抽象的数学关系',
    type: 'skill',
  });
  
  db.standardDetail.create({
    id: 'math-comp-1-detail-3',
    standardId: 'math-competency-1',
    content: '能够理解和使用简单的数学模型描述现实问题',
    type: 'skill',
  });
  
  db.standardDetail.create({
    id: 'math-comp-1-detail-4',
    standardId: 'math-competency-1',
    content: '对数学抽象过程有积极的态度',
    type: 'attitude',
  });
  
  db.standardDetail.create({
    id: 'math-comp-1-detail-5',
    standardId: 'math-competency-1',
    content: '理解数是对现实事物的抽象表示',
    type: 'knowledge',
  });
  
  db.standardDetail.create({
    id: 'math-comp-1-detail-6',
    standardId: 'math-competency-1',
    content: '能够从具体事物中抽象出数量关系',
    type: 'skill',
  });
  
  // 逻辑推理标准详情
  db.standardDetail.create({
    id: 'math-comp-2-detail-1',
    standardId: 'math-competency-2',
    content: '理解基本的逻辑关系：与、或、非',
    type: 'knowledge',
  });
  
  db.standardDetail.create({
    id: 'math-comp-2-detail-2',
    standardId: 'math-competency-2',
    content: '能够根据条件进行简单的逻辑推理',
    type: 'skill',
  });
  
  db.standardDetail.create({
    id: 'math-comp-2-detail-3',
    standardId: 'math-competency-2',
    content: '能够判断简单结论的正确性',
    type: 'skill',
  });
  
  db.standardDetail.create({
    id: 'math-comp-2-detail-4',
    standardId: 'math-competency-2',
    content: '有严密的逻辑思维习惯',
    type: 'attitude',
  });
  
  // 数与代数领域详情
  db.standardDetail.create({
    id: 'math-domain-1-detail-1',
    standardId: 'math-domain-1',
    content: '认识100以内的数',
    type: 'knowledge',
  });
  
  db.standardDetail.create({
    id: 'math-domain-1-detail-2',
    standardId: 'math-domain-1',
    content: '掌握20以内的加减法',
    type: 'skill',
  });
  
  db.standardDetail.create({
    id: 'math-domain-1-detail-3',
    standardId: 'math-domain-1',
    content: '能够运用加减法解决实际问题',
    type: 'skill',
  });
  
  db.standardDetail.create({
    id: 'math-domain-1-detail-4',
    standardId: 'math-domain-1',
    content: '对数学计算的准确性有追求',
    type: 'attitude',
  });
  
  // 统计与概率领域详情
  db.standardDetail.create({
    id: 'math-domain-3-detail-1',
    standardId: 'math-domain-3',
    content: '认识简单的统计图表',
    type: 'knowledge',
  });
  
  db.standardDetail.create({
    id: 'math-domain-3-detail-2',
    standardId: 'math-domain-3',
    content: '能够收集和整理简单的数据',
    type: 'skill',
  });
  
  db.standardDetail.create({
    id: 'math-domain-3-detail-3',
    standardId: 'math-domain-3',
    content: '能够绘制简单的统计图表',
    type: 'skill',
  });
  
  db.standardDetail.create({
    id: 'math-domain-3-detail-4',
    standardId: 'math-domain-3',
    content: '对数据分析有好奇心',
    type: 'attitude',
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
  
  // 添加学业标准应用
  db.application.create({
    id: '7',
    name: '学业标准',
    description: '浏览和查询各学科学业标准',
    icon: 'book',
    url: '/academic-standards',
    roles: ['admin', 'teacher'],
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
  
  // 添加导师示例数据
  db.mentor.create({
    id: '1',
    name: '王教授',
    email: 'wangprof@school.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
    title: '教授',
    phone: '13800138000',
    bio: '在人工智能领域有超过15年的教学和研究经验，曾主持多项国家级科研项目。',
    specialties: ['人工智能'],
    isAssigned: false,
    students: [],
  });
  
  db.mentor.create({
    id: '2',
    name: '李教授',
    email: 'liprof@school.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li',
    title: '教授',
    phone: '13900139000',
    bio: '数学博士，专注于高等数学的教学研究，教学风格严谨而有趣。',
    specialties: ['高等数学'],
    isAssigned: false,
    students: [],
  });
  
  db.mentor.create({
    id: '3',
    name: '赵博士',
    email: 'zhaophd@school.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao',
    title: '博士',
    phone: '13800138000',
    bio: '年轻有为的物理学者，研究领域涵盖量子力学和天体物理学。',
    specialties: ['量子力学'],
    isAssigned: false,
    students: [],
  });
  
  // 添加学生示例数据
  db.student.create({
    id: '1',
    name: '小明',
    email: 'xiaoming@student.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ming',
    grade: '大三',
    major: '计算机科学',
  });
  
  db.student.create({
    id: '2',
    name: '小华',
    email: 'xiaohua@student.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hua',
    grade: '大二',
    major: '数学',
  });
  
  db.student.create({
    id: '3',
    name: '小芳',
    email: 'xiaofang@student.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fang',
    grade: '大四',
    major: '物理学',
  });
  
  // 添加考试示例数据
  db.exam.create({
    id: '1',
    name: '期中考试',
    subject: '高等数学',
    grade: '一年级',
    semester: '2024-1',
    startTime: '2024-03-25T09:00:00',
    endTime: '2024-03-25T11:00:00',
    status: 'published',
  });
  
  // 添加更多初始数据...
} 