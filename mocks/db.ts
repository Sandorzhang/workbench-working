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
    school: String, // 用户所属学校
    schoolType: String, // 学校类型
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
    gradeNumber: Number,         // 年级数字编码 (1, 2, 3...)
    academicYear: String,        // 所属学年
    description: String,         // 年级描述（可选）
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
  gradeLevel: string;       // 年级文本描述（一年级、二年级等）
  gradeNumber: number;      // 年级数字编码（1、2、3等）
  academicYear: string;     // 学年（例如：2023-2024）
  description?: string;     // 年级描述（可选）
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
      classes: db.classes,
      // 确保保存权限数据
      permission: db.permission.getAll(),
      rolePermission: db.rolePermission.getAll()
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
    
    // 加载权限数据
    if (data.permission) {
      console.log(`加载用户权限数据，数量: ${data.permission.length}`);
      data.permission.forEach((item: any) => db.permission.create(item));
    }
    
    if (data.rolePermission) {
      console.log(`加载角色权限数据，数量: ${data.rolePermission.length}`);
      data.rolePermission.forEach((item: any) => db.rolePermission.create(item));
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
    school: '北京第一中学',
    schoolType: '九年一贯制'
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
    school: '上海市第二中学',
    schoolType: '完全中学（六年制）'
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
    school: '通用平台',
    schoolType: '完全中学'
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
    school: '五石炼成',
    schoolType: '超级管理'
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
    name: '单元教案',
    description: '创建和管理单元教案设计',
    icon: 'pencil',
    url: '/teaching-design',
    roles: ['admin', 'teacher'],
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
  
  // 初始化角色权限 - 确保这段代码可以被执行
  console.log('检查角色权限初始化...');
  // 为admin角色添加所有应用的权限
  const adminRole = 'admin';
  const allApplications = db.application.getAll();
  console.log(`找到 ${allApplications.length} 个应用，准备设置权限`);
  
  // 先删除可能存在的旧权限
  try {
    db.rolePermission.deleteMany({
      where: {
        role: {
          equals: adminRole
        }
      }
    });
    console.log('已删除现有admin角色权限');
  } catch (e) {
    console.log('删除旧权限时出错或无权限可删除', e);
  }
  
  // 添加新权限
  allApplications.forEach(app => {
    try {
      db.rolePermission.create({
        id: `rp-${adminRole}-${app.id}-${Date.now()}`, // 添加时间戳避免ID冲突
        role: adminRole,
        applicationId: app.id,
        granted: true, // 确保授予权限
        createdAt: new Date().toISOString(),
      });
      console.log(`已为admin角色添加应用权限: ${app.name}`);
    } catch (e) {
      console.error(`为应用 ${app.id} 添加权限时出错:`, e);
    }
  });
  
  // 保存数据库状态
  saveDb();
  console.log('数据库状态已保存');
} 