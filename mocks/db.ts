import { factory, primaryKey } from '@mswjs/data';

// 创建模拟数据库模型
const dbFactory = factory({
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
    tenant: String, // 用户所属学校
    tenantType: String, // 学校类型
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
    order: Number, // 添加排序字段
    createdAt: String,
  },
  // 路由权限模型
  route: {
    id: primaryKey(String),
    path: String,         // 路由路径，如 /admin/users
    name: String,         // 路由名称，如 用户管理
    description: String,  // 路由描述
    roles: Array,         // 允许访问的角色数组
    isPublic: Boolean,    // 是否为公开路由（无需登录）
  },
  // 用户自定义权限模型
  userPermission: {
    id: primaryKey(String),
    userId: String,       // 用户ID
    resourceType: String, // 资源类型: 'application' 或 'route'
    resourceId: String,   // 资源ID
    allowed: Boolean,     // 是否允许
  },
  // 角色权限模型
  rolePermission: {
    id: primaryKey(String),
    role: String,
    applicationId: String,
    granted: Boolean,
    createdAt: String,
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
  // 新增模型 - 教育管理相关

  // 学生管理模型（新的完整学生模型）
  studentManagement: {
    id: primaryKey(String),
    name: String,                // 姓名
    gender: String,              // 性别 ('male' | 'female')
    enrollmentYear: Number,      // 入学年份
    birthDate: String,           // 出生日期
    studentNumber: String,       // 学籍号
    externalAppIds: Array,       // 外部应用ID信息数组
    classId: String,             // 班级ID
    gradeId: String,             // 年级ID
    avatar: String,              // 头像（可选）
  },

  // 年级管理模型
  gradeManagement: {
    id: primaryKey(String),
    gradeLevel: String,          // 年级枚举（一年级、二年级...）
    academicYear: String,        // 所属学年
  },

  // 班级管理模型
  classManagement: {
    id: primaryKey(String),
    name: String,                // 班名
    academicYear: String,        // 学年
    gradeId: String,             // 所属年级ID
  },

  // 教师管理模型
  teacherManagement: {
    id: primaryKey(String),
    name: String,                // 姓名
    gender: String,              // 性别 ('male' | 'female')
    birthDate: String,           // 出生日期
    subject: String,             // 任教学科
    externalAppIds: Array,       // 外部应用ID信息数组
    avatar: String,              // 头像（可选）
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
  // 区域模型
  region: {
    id: primaryKey(String),    // 六位数字编码ID
    name: String,              // 区域名称
    status: Boolean,           // 启用/停用状态
  },
  
  // 学校模型
  school: {
    id: primaryKey(String),    // 系统生成的唯一ID
    name: String,              // 学校名称
    code: String,              // 学校编号（3位数字编码）
    regionId: String,          // 所属区域ID
    type: String,              // 阶段学制
    grades: Array,             // 学校年级
    status: Boolean,           // 启用/停用状态
    createdAt: String,         // 创建时间
  },
  // 用户权限模型
  permission: {
    id: primaryKey(String),
    userId: String,
    applicationId: String,
    granted: Boolean,
    createdAt: String,
  },
  // 可以添加更多模型
});

// 扩展数据库，添加自定义数组以支持直接操作
export type Teacher = {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  subject: string;
  externalAppIds: Array<{
    appId: string;
    appName: string;
    externalId: string;
  }>;
  avatar?: string;
};

export type Student = {
  id: string;
  name: string;
  gender: 'male' | 'female';
  enrollmentYear: number;
  birthDate: string;
  studentNumber: string;
  classId: string;
  gradeId: string;
  externalAppIds: Array<{
    appId: string;
    appName: string;
    externalId: string;
  }>;
  avatar?: string;
};

export type Grade = {
  id: string;
  gradeLevel: string;
  academicYear: string;
};

export type Class = {
  id: string;
  name: string;
  academicYear: string;
  gradeId: string;
};

// 将数据库扩展为包含直接数组
export const db = {
  ...dbFactory,
  teachers: [] as Teacher[],
  students: [] as Student[],
  grades: [] as Grade[],
  classes: [] as Class[],
};

// 保存数据库状态到localStorage
export function saveDb() {
  if (typeof window === 'undefined') return;
  
  try {
    // 获取数据库中的所有数据
    const data = {
      user: db.user.getAll(),
      session: db.session.getAll(),
      application: db.application.getAll(),
      calendar: db.calendar.getAll(),
      mentor: db.mentor.getAll(),
      student: db.student.getAll(),
      exam: db.exam.getAll(),
      subject: db.subject.getAll(),
      studentManagement: db.studentManagement.getAll(),
      gradeManagement: db.gradeManagement.getAll(),
      classManagement: db.classManagement.getAll(),
      teacherManagement: db.teacherManagement.getAll(),
      academicStandard: db.academicStandard.getAll(),
      standardDetail: db.standardDetail.getAll(),
      concept: db.concept.getAll(),
      conceptRelation: db.conceptRelation.getAll(),
      region: db.region.getAll(),
      school: db.school.getAll(),
      teachers: db.teachers,
      students: db.students,
      grades: db.grades,
      classes: db.classes
    };
    
    // 保存到localStorage
    localStorage.setItem('msw-db', JSON.stringify(data));
    console.log('数据库状态已保存到localStorage');
  } catch (error) {
    console.error('保存数据库状态失败:', error);
  }
}

// 从localStorage加载数据库状态
export function loadDb(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const savedData = localStorage.getItem('msw-db');
    if (!savedData) return false;
    
    const data = JSON.parse(savedData);
    
    // 清空现有数据
    Object.keys(db).forEach(key => {
      if (typeof (db as any)[key].deleteMany === 'function') {
        try {
          (db as any)[key].deleteMany({});
        } catch (e) {
          // 忽略可能的错误
        }
      }
    });
    
    // 恢复所有数据
    if (data.user) {
      data.user.forEach((item: any) => db.user.create(item));
    }
    if (data.session) {
      data.session.forEach((item: any) => db.session.create(item));
    }
    if (data.application) {
      data.application.forEach((item: any) => db.application.create(item));
    }
    if (data.calendar) {
      data.calendar.forEach((item: any) => db.calendar.create(item));
    }
    if (data.mentor) {
      data.mentor.forEach((item: any) => db.mentor.create(item));
    }
    if (data.student) {
      data.student.forEach((item: any) => db.student.create(item));
    }
    if (data.exam) {
      data.exam.forEach((item: any) => db.exam.create(item));
    }
    if (data.subject) {
      data.subject.forEach((item: any) => db.subject.create(item));
    }
    if (data.studentManagement) {
      data.studentManagement.forEach((item: any) => db.studentManagement.create(item));
    }
    if (data.gradeManagement) {
      data.gradeManagement.forEach((item: any) => db.gradeManagement.create(item));
    }
    if (data.classManagement) {
      data.classManagement.forEach((item: any) => db.classManagement.create(item));
    }
    if (data.teacherManagement) {
      data.teacherManagement.forEach((item: any) => db.teacherManagement.create(item));
    }
    if (data.academicStandard) {
      data.academicStandard.forEach((item: any) => db.academicStandard.create(item));
    }
    if (data.standardDetail) {
      data.standardDetail.forEach((item: any) => db.standardDetail.create(item));
    }
    if (data.concept) {
      data.concept.forEach((item: any) => db.concept.create(item));
    }
    if (data.conceptRelation) {
      data.conceptRelation.forEach((item: any) => db.conceptRelation.create(item));
    }
    if (data.region) {
      data.region.forEach((item: any) => db.region.create(item));
    }
    if (data.school) {
      data.school.forEach((item: any) => db.school.create(item));
    }
    
    // 恢复扩展数组
    if (data.teachers) db.teachers = data.teachers;
    if (data.students) db.students = data.students;
    if (data.grades) db.grades = data.grades;
    if (data.classes) db.classes = data.classes;
    
    console.log('数据库状态已从localStorage恢复');
    return true;
  } catch (error) {
    console.error('加载数据库状态失败:', error);
    return false;
  }
}

// 初始化一些模拟数据
export function seedDb() {
  // 尝试从localStorage加载数据库状态
  if (loadDb()) {
    console.log('从localStorage恢复了数据库状态，跳过初始化');
    return;
  }
  
  console.log('初始化模拟数据库...');
  
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
  
  // 添加另一个校端管理员用户
  db.user.create({
    id: '4',
    name: '王校长',
    email: 'wangxiaozhang@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    createdAt: new Date().toISOString(),
    username: 'schooladmin',
    password: 'password123',
    phone: '13600136000',
    role: 'admin',
    tenant: '上海市第二中学',
    tenantType: '完全中学（六年制）'
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
  
  // 添加超级管理员用户
  db.user.create({
    id: '3',
    name: '张天一',
    email: 'wangchao@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    createdAt: new Date().toISOString(),
    username: 'superadmin',
    password: 'password123',
    phone: '13700137000',
    role: 'superadmin',
    tenant: '五石炼成',
    tenantType: '超级管理'
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
  
  // 添加应用权限数据
  db.application.create({
    id: '1',
    name: '学业旅程',
    description: '跟踪学生的学业标准达成进度，了解班级整体情况',
    icon: 'graduationCap',
    url: '/academic-journey',
    roles: ['teacher', 'admin', 'superadmin'],
  });
  
  db.application.create({
    id: '2',
    name: '学业标准',
    description: '浏览和查询各学科学业标准',
    icon: 'book',
    url: '/academic-standards',
    roles: ['teacher', 'admin', 'superadmin'],
  });
  
  db.application.create({
    id: '3',
    name: '课堂时光机',
    description: '记录和回顾课堂教学活动',
    icon: 'clock',
    url: '/classroom-timemachine',
    roles: ['teacher', 'admin', 'superadmin'],
  });
  
  db.application.create({
    id: '4',
    name: '大概念地图',
    description: '查看不同学科的概念节点和关系，了解知识体系结构',
    icon: 'network',
    url: '/concept-map',
    roles: ['teacher', 'admin', 'student', 'superadmin'],
  });
  
  db.application.create({
    id: '5',
    name: '数据资产管理',
    description: '管理和浏览教学相关的各类数据资源',
    icon: 'database',
    url: '/data-assets',
    roles: ['teacher', 'admin', 'superadmin'],
  });
  
  db.application.create({
    id: '6',
    name: '考试管理',
    description: '创建、编辑和管理各类考试及试卷',
    icon: 'fileText',
    url: '/exam-management',
    roles: ['teacher', 'admin', 'superadmin'],
  });
  
  db.application.create({
    id: '7',
    name: '全员导师',
    description: '管理学生导师体系和师生关系',
    icon: 'userPlus',
    url: '/mentor-system',
    roles: ['teacher', 'admin', 'superadmin'],
  });
  
  db.application.create({
    id: '8',
    name: '单元教学设计',
    description: '创建和管理教学单元设计',
    icon: 'layout',
    url: '/unit-teaching-design',
    roles: ['teacher', 'admin', 'superadmin'],
  });
  
  db.application.create({
    id: '9',
    name: '师生信息管理',
    description: '管理教师和学生基本信息',
    icon: 'users',
    url: '/teacher-student-info',
    roles: ['admin', 'superadmin'],
  });
  
  // 添加校端特有的应用权限
  db.application.create({
    id: '10',
    name: '教育管理',
    description: '学校教育管理系统入口',
    icon: 'school',
    url: '/admin/education',
    roles: ['admin'],
  });
  
  db.application.create({
    id: '11',
    name: '教师管理',
    description: '管理学校教师信息',
    icon: 'users',
    url: '/admin/education/teachers',
    roles: ['admin'],
  });
  
  db.application.create({
    id: '12',
    name: '学生管理',
    description: '管理学生基本信息',
    icon: 'graduationCap',
    url: '/admin/education/students',
    roles: ['admin'],
  });
  
  db.application.create({
    id: '13',
    name: '年级管理',
    description: '管理学校年级信息',
    icon: 'book',
    url: '/admin/education/grades',
    roles: ['admin'],
  });
  
  db.application.create({
    id: '14',
    name: '班级管理',
    description: '管理学校班级信息',
    icon: 'school',
    url: '/admin/education/classes',
    roles: ['admin'],
  });
  
  // 添加角色权限示例
  db.rolePermission.create({
    id: 'rp-1',
    role: 'superadmin',
    applicationId: '1', // 学业旅程
    granted: true,
  });
  
  db.rolePermission.create({
    id: 'rp-2',
    role: 'admin',
    applicationId: '1', // 学业旅程
    granted: true,
  });
  
  db.rolePermission.create({
    id: 'rp-3',
    role: 'teacher',
    applicationId: '1', // 学业旅程
    granted: true,
  });
  
  db.rolePermission.create({
    id: 'rp-4',
    role: 'superadmin',
    applicationId: '2', // 学业标准
    granted: true,
  });
  
  db.rolePermission.create({
    id: 'rp-5',
    role: 'admin',
    applicationId: '2', // 学业标准
    granted: true,
  });
  
  db.rolePermission.create({
    id: 'rp-6',
    role: 'teacher',
    applicationId: '2', // 学业标准
    granted: true,
  });
  
  db.rolePermission.create({
    id: 'rp-7',
    role: 'superadmin',
    applicationId: '3', // 课堂时光机
    granted: true,
  });
  
  db.rolePermission.create({
    id: 'rp-8',
    role: 'admin',
    applicationId: '3', // 课堂时光机
    granted: true,
  });
  
  db.rolePermission.create({
    id: 'rp-9',
    role: 'teacher',
    applicationId: '3', // 课堂时光机
    granted: true,
  });
  
  db.rolePermission.create({
    id: 'rp-10',
    role: 'superadmin',
    applicationId: '4', // 大概念地图
    granted: true,
  });
  
  // 添加用户自定义权限示例
  db.userPermission.create({
    id: 'up-1',
    userId: '2', // 李四（教师）
    resourceType: 'application',
    resourceId: '7', // 全员导师
    allowed: true, // 覆盖角色默认权限
  });
  
  db.userPermission.create({
    id: 'up-2',
    userId: '1', // 张三（管理员）
    resourceType: 'application',
    resourceId: '9', // 师生信息管理
    allowed: true, // 允许访问
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
  
  // 添加区域示例数据
  db.region.create({
    id: '100001',
    name: '海淀区',
    status: true,
  });
  
  db.region.create({
    id: '100002',
    name: '朝阳区',
    status: true,
  });
  
  db.region.create({
    id: '100003',
    name: '东城区',
    status: false,
  });
  
  // 添加学校示例数据
  db.school.create({
    id: '1',
    name: '北京第一中学',
    code: '001',
    regionId: '100001',
    type: '九年一贯制',
    grades: ['初一', '初二', '初三', '高一', '高二', '高三'],
    status: true,
    createdAt: new Date().toISOString(),
  });
  
  db.school.create({
    id: '2',
    name: '北京第二中学',
    code: '002',
    regionId: '100001',
    type: '完全中学（六年制）',
    grades: ['初一', '初二', '初三', '高一', '高二', '高三'],
    status: true,
    createdAt: new Date().toISOString(),
  });
  
  db.school.create({
    id: '3',
    name: '朝阳区实验小学',
    code: '101',
    regionId: '100002',
    type: '小学（六年制）',
    grades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
    status: true,
    createdAt: new Date().toISOString(),
  });
  
  // 初始化应用数据
  if (db.application.count() === 0) {
    // 教育应用
    db.application.create({
      id: '1',
      name: '学业旅程',
      description: '跟踪和管理学生的学习进度和成就',
      icon: 'graduation-cap',
      url: '/education/academic-journey',
      roles: ['admin', 'teacher', 'superadmin'],
      order: 1,
      createdAt: new Date().toISOString(),
    });
    
    db.application.create({
      id: '2',
      name: '学业标准',
      description: '查看和管理教育标准和课程目标',
      icon: 'book-open',
      url: '/education/academic-standards',
      roles: ['admin', 'teacher', 'superadmin'],
      order: 2,
      createdAt: new Date().toISOString(),
    });
    
    db.application.create({
      id: '3',
      name: '课堂时光机',
      description: '记录和回顾课堂活动和教学时刻',
      icon: 'clock',
      url: '/education/classroom-timemachine',
      roles: ['admin', 'teacher', 'superadmin'],
      order: 3,
      createdAt: new Date().toISOString(),
    });
    
    db.application.create({
      id: '4',
      name: '大概念地图',
      description: '可视化展示课程概念和知识点之间的联系',
      icon: 'map',
      url: '/education/concept-map',
      roles: ['admin', 'teacher', 'superadmin'],
      order: 4,
      createdAt: new Date().toISOString(),
    });
    
    db.application.create({
      id: '5',
      name: '数据资产管理',
      description: '管理和分析教育数据资源',
      icon: 'database',
      url: '/education/data-assets',
      roles: ['admin', 'teacher', 'superadmin'],
      order: 5,
      createdAt: new Date().toISOString(),
    });
    
    db.application.create({
      id: '6',
      name: '考试管理',
      description: '创建、管理和评估考试和测验',
      icon: 'file-text',
      url: '/education/exam-management',
      roles: ['admin', 'teacher', 'superadmin'],
      order: 6,
      createdAt: new Date().toISOString(),
    });
    
    db.application.create({
      id: '7',
      name: '全员导师',
      description: '为学生提供全方位的指导和支持',
      icon: 'users',
      url: '/education/mentorship',
      roles: ['admin', 'teacher', 'superadmin'],
      order: 7,
      createdAt: new Date().toISOString(),
    });
    
    db.application.create({
      id: '8',
      name: '单元教学设计',
      description: '规划和设计教学单元和课程',
      icon: 'layout',
      url: '/education/unit-design',
      roles: ['admin', 'teacher', 'superadmin'],
      order: 8,
      createdAt: new Date().toISOString(),
    });
    
    db.application.create({
      id: '9',
      name: '师生信息管理',
      description: '管理教师和学生的基本信息',
      icon: 'user-check',
      url: '/education/user-management',
      roles: ['admin', 'teacher', 'superadmin'],
      order: 9,
      createdAt: new Date().toISOString(),
    });
    
    // 校端应用
    db.application.create({
      id: '10',
      name: '校园管理',
      description: '管理学校设施和资源',
      icon: 'home',
      url: '/admin/campus',
      roles: ['admin', 'superadmin'],
      order: 10,
      createdAt: new Date().toISOString(),
    });
    
    db.application.create({
      id: '11',
      name: '教务管理',
      description: '管理教学计划和课程安排',
      icon: 'calendar',
      url: '/admin/academic',
      roles: ['admin', 'superadmin'],
      order: 11,
      createdAt: new Date().toISOString(),
    });
    
    db.application.create({
      id: '12',
      name: '人事管理',
      description: '管理教职工信息和工作安排',
      icon: 'briefcase',
      url: '/admin/personnel',
      roles: ['admin', 'superadmin'],
      order: 12,
      createdAt: new Date().toISOString(),
    });
    
    db.application.create({
      id: '13',
      name: '财务管理',
      description: '管理学校财务和预算',
      icon: 'dollar-sign',
      url: '/admin/finance',
      roles: ['admin', 'superadmin'],
      order: 13,
      createdAt: new Date().toISOString(),
    });
    
    db.application.create({
      id: '14',
      name: '系统设置',
      description: '配置系统参数和权限',
      icon: 'settings',
      url: '/admin/settings',
      roles: ['admin', 'superadmin'],
      order: 14,
      createdAt: new Date().toISOString(),
    });
  }
  
  // 初始化角色权限
  if (db.rolePermission.count() === 0) {
    // 为每个角色添加默认应用权限
    const roles = ['admin', 'teacher', 'student', 'superadmin'];
    const allApplications = db.application.getAll();
    
    roles.forEach(role => {
      allApplications.forEach(app => {
        // 根据应用的roles字段确定默认权限
        const hasAccess = Array.isArray(app.roles) && app.roles.includes(role);
        
        db.rolePermission.create({
          id: `rp-${role}-${app.id}`,
          role,
          applicationId: app.id,
          granted: hasAccess,
          createdAt: new Date().toISOString(),
        });
      });
    });
  }
  
  // 添加更多初始数据...
} 