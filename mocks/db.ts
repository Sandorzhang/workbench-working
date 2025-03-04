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
    class: String,
    studentId: String,
    mentorId: String,
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
  // 概念模型 - 用于概念地图
  concept: {
    id: primaryKey(String),
    name: String,
    description: String,
    type: String, // 'big' for 大概念, 'small' for 小概念
    targets: Array, // 三维目标：知识、技能、情感 (可多选)
    subject: String, // 所属学科
    createdAt: String,
    updatedAt: String,
  },
  // 概念关系模型
  conceptRelation: {
    id: primaryKey(String),
    sourceId: String, // 源概念ID
    targetId: String, // 目标概念ID
    relationType: Number, // 关系类型(1-12)
    createdAt: String,
    updatedAt: String,
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
  
  // 添加导师和学生示例数据
  // 添加导师数据
  const mentor1 = db.mentor.create({
    id: '2', // 与用户ID匹配，用于教师角色
    name: '李四',
    email: 'lisi@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    title: '副教授',
    phone: '13900139000',
    bio: '计算机科学教授，专注于人工智能和机器学习领域',
    specialties: ['人工智能', '机器学习', '数据结构'],
    isAssigned: true,
    students: [],
  });
  
  db.mentor.create({
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
    title: '讲师',
    phone: '13700137000',
    bio: '数学系讲师，主要研究方向为高等代数和数学分析',
    specialties: ['高等代数', '数学分析', '概率论'],
    isAssigned: false,
    students: [],
  });
  
  // 添加学生数据
  const student1 = db.student.create({
    id: 's1',
    name: '张晓明',
    email: 'xiaoming@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
    grade: '初三',
    major: '', // 移除专业信息
    class: '1',
    studentId: '20210101',
    mentorId: '2',
  });
  
  const student2 = db.student.create({
    id: 's2',
    name: '李华',
    email: 'lihua@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lihua',
    grade: '初二',
    major: '', // 移除专业信息
    class: '2',
    studentId: '20210202',
    mentorId: '2',
  });
  
  const student3 = db.student.create({
    id: 's3',
    name: '王芳',
    email: 'wangfang@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangfang',
    grade: '高一',
    major: '', // 移除专业信息
    class: '1',
    studentId: '20220101',
    mentorId: '2',
  });
  
  // 更新导师的学生列表
  db.mentor.update({
    where: { id: { equals: '2' } },
    data: {
      students: [student1, student2, student3],
    },
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
  
  // 添加概念示例数据 - 数学学科
  db.concept.create({
    id: 'c001',
    name: '数与代数',
    description: '研究数量关系和数的结构的数学分支',
    type: 'big', // 大概念
    targets: ['知识', '技能'],
    subject: '数学',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.concept.create({
    id: 'c002',
    name: '数的认识',
    description: '理解数的含义、表示方法和基本性质',
    type: 'big',
    targets: ['知识'],
    subject: '数学',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.concept.create({
    id: 'c003',
    name: '整数',
    description: '不含小数部分的数',
    type: 'small',
    targets: ['知识'],
    subject: '数学',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.concept.create({
    id: 'c004',
    name: '小数',
    description: '包含小数部分的数',
    type: 'small',
    targets: ['知识'],
    subject: '数学',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.concept.create({
    id: 'c005',
    name: '分数',
    description: '表示部分与整体关系的数',
    type: 'small',
    targets: ['知识'],
    subject: '数学',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.concept.create({
    id: 'c006',
    name: '运算',
    description: '对数进行加减乘除等数学操作',
    type: 'big',
    targets: ['知识', '技能'],
    subject: '数学',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.concept.create({
    id: 'c007',
    name: '加法',
    description: '将两个或多个数合并为一个数的运算',
    type: 'small',
    targets: ['知识', '技能'],
    subject: '数学',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.concept.create({
    id: 'c008',
    name: '减法',
    description: '求两个数的差的运算',
    type: 'small',
    targets: ['知识', '技能'],
    subject: '数学',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.concept.create({
    id: 'c009',
    name: '几何',
    description: '研究形状、大小、空间位置及其关系的数学分支',
    type: 'big',
    targets: ['知识', '技能', '情感'],
    subject: '数学',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.concept.create({
    id: 'c010',
    name: '平面图形',
    description: '二维空间中的几何图形',
    type: 'small',
    targets: ['知识', '技能'],
    subject: '数学',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  // 添加物理学科的概念
  db.concept.create({
    id: 'c011',
    name: '力学',
    description: '研究物体运动和相互作用的物理学分支',
    type: 'big',
    targets: ['知识', '技能'],
    subject: '物理',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.concept.create({
    id: 'c012',
    name: '牛顿定律',
    description: '描述物体运动与力的关系的基本定律',
    type: 'big',
    targets: ['知识', '技能'],
    subject: '物理',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  // 添加概念关系示例数据
  db.conceptRelation.create({
    id: 'r001',
    sourceId: 'c001', // 数与代数
    targetId: 'c002', // 数的认识
    relationType: 1, // 关系类型1
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.conceptRelation.create({
    id: 'r002',
    sourceId: 'c002', // 数的认识
    targetId: 'c003', // 整数
    relationType: 2, // 关系类型2
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.conceptRelation.create({
    id: 'r003',
    sourceId: 'c002', // 数的认识
    targetId: 'c004', // 小数
    relationType: 2, // 关系类型2
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.conceptRelation.create({
    id: 'r004',
    sourceId: 'c002', // 数的认识
    targetId: 'c005', // 分数
    relationType: 2, // 关系类型2
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.conceptRelation.create({
    id: 'r005',
    sourceId: 'c001', // 数与代数
    targetId: 'c006', // 运算
    relationType: 3, // 关系类型3
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.conceptRelation.create({
    id: 'r006',
    sourceId: 'c006', // 运算
    targetId: 'c007', // 加法
    relationType: 4, // 关系类型4
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.conceptRelation.create({
    id: 'r007',
    sourceId: 'c006', // 运算
    targetId: 'c008', // 减法
    relationType: 4, // 关系类型4
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.conceptRelation.create({
    id: 'r008',
    sourceId: 'c009', // 几何
    targetId: 'c010', // 平面图形
    relationType: 5, // 关系类型5
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  db.conceptRelation.create({
    id: 'r009',
    sourceId: 'c011', // 力学
    targetId: 'c012', // 牛顿定律
    relationType: 6, // 关系类型6
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  // 添加更多初始数据...
} 