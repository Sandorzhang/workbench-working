import { factory, primaryKey } from "@mswjs/data";
// 导入数据库特定的类型
import {
  Teacher,
  Student,
  Grade,
  Class,
  School,
  Region,
  Exam,
  Question,
  LearningObjective,
  LearningStandard,
  StudentProgress,
  CompetencyDimension,
  Indicator,
  StudentRecord,
  Mentor,
  IndicatorRecord,
  Note,
  AcademicRecord,
  Course,
  CourseEnrollment,
} from "@/types/db";
import { SchoolType } from "@/lib/api-types";

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
    path: String, // 路由路径，如 /admin/users
    name: String, // 路由名称，如 用户管理
    description: String, // 路由描述
    roles: Array, // 允许访问的角色数组
    isPublic: Boolean, // 是否为公开路由（无需登录）
  },
  // 用户自定义权限模型
  userPermission: {
    id: primaryKey(String),
    userId: String, // 用户ID
    resourceType: String, // 资源类型: 'application' 或 'route'
    resourceId: String, // 资源ID
    allowed: Boolean, // 是否允许
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
    name: String, // 姓名
    gender: String, // 性别 ('male' | 'female')
    enrollmentYear: Number, // 入学年份
    birthDate: String, // 出生日期
    studentNumber: String, // 学籍号
    externalAppIds: Array, // 外部应用ID信息数组
    classId: String, // 班级ID
    gradeId: String, // 年级ID
    avatar: String, // 头像（可选）
  },

  // 年级管理模型
  gradeManagement: {
    id: primaryKey(String),
    gradeLevel: String, // 年级枚举（一年级、二年级...）
    gradeNumber: Number, // 年级数字编码 (1, 2, 3...)
    academicYear: String, // 所属学年
    description: String, // 年级描述（可选）
  },

  // 班级管理模型
  classManagement: {
    id: primaryKey(String),
    name: String, // 班名
    academicYear: String, // 学年
    gradeId: String, // 所属年级ID
  },

  // 教师管理模型
  teacherManagement: {
    id: primaryKey(String),
    name: String, // 姓名
    gender: String, // 性别 ('male' | 'female')
    birthDate: String, // 出生日期
    subject: String, // 任教学科
    externalAppIds: Array, // 外部应用ID信息数组
    avatar: String, // 头像（可选）
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
    id: primaryKey(String), // 六位数字编码ID
    name: String, // 区域名称
    status: Boolean, // 启用/停用状态
  },

  // 学校模型
  school: {
    id: primaryKey(String), // 系统生成的唯一ID
    name: String, // 学校名称
    code: String, // 学校编号（3位数字编码）
    regionId: String, // 所属区域ID
    type: String, // 阶段学制
    grades: Array, // 学校年级
    status: Boolean, // 启用/停用状态
    createdAt: String, // 创建时间
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
  course: {
    id: primaryKey(String),
    name: String,
    code: String,
    description: String,
    schoolId: String,
    gradeLevel: String,
    subject: String,
    teacherId: String,
    status: String,
    startDate: String,
    endDate: String,
    enrollmentLimit: Number,
    enrollmentCount: Number,
    schedule: String,
    location: String,
    textbooks: Array,
    syllabus: String,
  },
  courseEnrollment: {
    id: primaryKey(String),
    courseId: String,
    studentId: String,
    enrollmentDate: String,
    status: String,
    finalGrade: String,
  },
});

// 将数据库扩展为包含直接数组
export const db = {
  ...dbFactory,
  teachers: [] as Teacher[],
  students: [] as Student[],
  grades: [] as Grade[],
  classes: [] as Class[],
  schools: [] as School[],
  regions: [] as Region[],
  exams: [] as Exam[],
  questions: [] as Question[],
  learningObjectives: [] as LearningObjective[],
  learningStandards: [] as LearningStandard[],
  studentProgress: [] as StudentProgress[],
  competencyDimensions: [] as CompetencyDimension[],
  indicators: [] as Indicator[],
  studentRecords: [] as StudentRecord[],
  mentors: [] as Mentor[],
  indicatorRecords: [] as IndicatorRecord[],
  notes: [] as Note[],
  academicRecords: [] as AcademicRecord[],
  courses: [] as Course[],
  courseEnrollments: [] as CourseEnrollment[],
};

// 保存数据库状态到localStorage
export function saveDb() {
  if (typeof window === "undefined") return;

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
      schools: db.schools,
      regions: db.regions,
      exams: db.exams,
      questions: db.questions,
      learningObjectives: db.learningObjectives,
      learningStandards: db.learningStandards,
      studentProgress: db.studentProgress,
      competencyDimensions: db.competencyDimensions,
      indicators: db.indicators,
      studentRecords: db.studentRecords,
      mentors: db.mentors,
      indicatorRecords: db.indicatorRecords,
      notes: db.notes,
      academicRecords: db.academicRecords,
      courses: db.courses,
      courseEnrollments: db.courseEnrollments,
      // 确保保存权限数据
      permission: db.permission.getAll(),
      rolePermission: db.rolePermission.getAll(),
    };

    // 保存到localStorage
    localStorage.setItem("msw-db", JSON.stringify(data));
    //console.log("数据库状态已保存到localStorage");
  } catch (error) {
    console.error("保存数据库状态失败:", error);
  }
}

// 从localStorage加载数据库状态
export function loadDb(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const savedData = localStorage.getItem("msw-db");
    if (!savedData) return false;

    const data = JSON.parse(savedData);

    // 清空现有数据
    Object.keys(db).forEach((key) => {
      if (typeof (db as any)[key].deleteMany === "function") {
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
      data.studentManagement.forEach((item: any) =>
        db.studentManagement.create(item)
      );
    }
    if (data.gradeManagement) {
      data.gradeManagement.forEach((item: any) =>
        db.gradeManagement.create(item)
      );
    }
    if (data.classManagement) {
      data.classManagement.forEach((item: any) =>
        db.classManagement.create(item)
      );
    }
    if (data.teacherManagement) {
      data.teacherManagement.forEach((item: any) =>
        db.teacherManagement.create(item)
      );
    }
    if (data.academicStandard) {
      data.academicStandard.forEach((item: any) =>
        db.academicStandard.create(item)
      );
    }
    if (data.standardDetail) {
      data.standardDetail.forEach((item: any) =>
        db.standardDetail.create(item)
      );
    }
    if (data.concept) {
      data.concept.forEach((item: any) => db.concept.create(item));
    }
    if (data.conceptRelation) {
      data.conceptRelation.forEach((item: any) =>
        db.conceptRelation.create(item)
      );
    }
    if (data.region) {
      data.region.forEach((item: any) => db.region.create(item));
    }
    if (data.school) {
      data.school.forEach((item: any) => db.school.create(item));
    }

    // 加载权限数据
    if (data.permission) {
      //console.log(`加载用户权限数据，数量: ${data.permission.length}`);
      data.permission.forEach((item: any) => db.permission.create(item));
    }

    if (data.rolePermission) {
      //console.log(`加载角色权限数据，数量: ${data.rolePermission.length}`);
      data.rolePermission.forEach((item: any) =>
        db.rolePermission.create(item)
      );
    }

    // 恢复扩展数组
    if (data.teachers) db.teachers = data.teachers;
    if (data.students) db.students = data.students;
    if (data.grades) db.grades = data.grades;
    if (data.classes) db.classes = data.classes;
    if (data.schools) db.schools = data.schools;
    if (data.regions) db.regions = data.regions;
    if (data.exams) db.exams = data.exams;
    if (data.questions) db.questions = data.questions;
    if (data.learningObjectives)
      db.learningObjectives = data.learningObjectives;
    if (data.learningStandards) db.learningStandards = data.learningStandards;
    if (data.studentProgress) db.studentProgress = data.studentProgress;
    if (data.competencyDimensions)
      db.competencyDimensions = data.competencyDimensions;
    if (data.indicators) db.indicators = data.indicators;
    if (data.studentRecords) db.studentRecords = data.studentRecords;
    if (data.mentors) db.mentors = data.mentors;
    if (data.indicatorRecords) db.indicatorRecords = data.indicatorRecords;
    if (data.notes) db.notes = data.notes;
    if (data.academicRecords) db.academicRecords = data.academicRecords;
    if (data.courses) db.courses = data.courses;

    //console.log("数据库状态已从localStorage恢复");
    return true;
  } catch (error) {
    console.error("加载数据库状态失败:", error);
    return false;
  }
}

// 添加区域和学校数据的函数
export function seedRegionAndSchoolData() {
  //console.log("检查是否需要初始化区域和学校数据...");

  // 检查区域数据是否已存在
  const existingRegions = db.region.getAll();
  if (existingRegions.length > 0) {
    // //console.log(`已存在 ${existingRegions.length} 个区域数据，跳过区域初始化`);
  } else {
    //console.log("初始化区域数据...");

    // 添加区域数据
    db.region.create({
      id: "110101",
      name: "北京市东城区",
      status: true,
    });

    db.region.create({
      id: "110102",
      name: "北京市西城区",
      status: true,
    });

    db.region.create({
      id: "110105",
      name: "北京市朝阳区",
      status: true,
    });

    db.region.create({
      id: "110106",
      name: "北京市丰台区",
      status: true,
    });

    db.region.create({
      id: "110108",
      name: "北京市海淀区",
      status: true,
    });

    db.region.create({
      id: "110109",
      name: "北京市门头沟区",
      status: false,
    });

    db.region.create({
      id: "310101",
      name: "上海市黄浦区",
      status: true,
    });

    db.region.create({
      id: "310104",
      name: "上海市徐汇区",
      status: true,
    });

    db.region.create({
      id: "310105",
      name: "上海市长宁区",
      status: true,
    });

    //console.log("区域数据初始化完成");
  }

  // 检查学校数据是否已存在
  const existingSchools = db.school.getAll();
  if (existingSchools.length > 0) {
    //console.log(`已存在 ${existingSchools.length} 所学校数据，跳过学校初始化`);
  } else {
    //console.log("初始化学校数据...");

    // 添加学校数据
    db.school.create({
      id: "1",
      name: "北京市东城区第一实验小学",
      code: "101",
      regionId: "110101",
      type: SchoolType.PRIMARY_SIX,
      grades: ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"],
      status: true,
      createdAt: new Date().toISOString(),
    });

    db.school.create({
      id: "2",
      name: "北京市西城区实验中学",
      code: "201",
      regionId: "110102",
      type: SchoolType.MIDDLE_THREE,
      grades: ["初一", "初二", "初三"],
      status: true,
      createdAt: new Date().toISOString(),
    });

    db.school.create({
      id: "3",
      name: "北京市朝阳区实验学校",
      code: "301",
      regionId: "110105",
      type: SchoolType.NINE_YEAR,
      grades: [
        "一年级",
        "二年级",
        "三年级",
        "四年级",
        "五年级",
        "六年级",
        "初一",
        "初二",
        "初三",
      ],
      status: true,
      createdAt: new Date().toISOString(),
    });

    db.school.create({
      id: "4",
      name: "北京市海淀区中关村中学",
      code: "401",
      regionId: "110108",
      type: SchoolType.HIGH_THREE,
      grades: ["高一", "高二", "高三"],
      status: true,
      createdAt: new Date().toISOString(),
    });

    db.school.create({
      id: "5",
      name: "上海市黄浦区实验小学",
      code: "501",
      regionId: "310101",
      type: SchoolType.PRIMARY_FIVE,
      grades: ["一年级", "二年级", "三年级", "四年级", "五年级"],
      status: true,
      createdAt: new Date().toISOString(),
    });

    db.school.create({
      id: "6",
      name: "上海市徐汇区光启中学",
      code: "601",
      regionId: "310104",
      type: SchoolType.TWELVE_YEAR,
      grades: [
        "一年级",
        "二年级",
        "三年级",
        "四年级",
        "五年级",
        "六年级",
        "初一",
        "初二",
        "初三",
        "高一",
        "高二",
        "高三",
      ],
      status: true,
      createdAt: new Date().toISOString(),
    });

    db.school.create({
      id: "7",
      name: "上海市长宁区实验中学",
      code: "701",
      regionId: "310105",
      type: SchoolType.MIDDLE_FOUR,
      grades: ["六年级", "初一", "初二", "初三"],
      status: false,
      createdAt: new Date().toISOString(),
    });

    // 添加更多学校
    db.school.create({
      id: "8",
      name: "北京市丰台区第二中学",
      code: "801",
      regionId: "110106",
      type: SchoolType.COMPLETE_SIX,
      grades: ["初一", "初二", "初三", "高一", "高二", "高三"],
      status: true,
      createdAt: new Date().toISOString(),
    });

    db.school.create({
      id: "9",
      name: "北京市海淀区清华附中",
      code: "901",
      regionId: "110108",
      type: SchoolType.COMPLETE_SEVEN,
      grades: ["初一", "初二", "初三", "初四", "高一", "高二", "高三"],
      status: true,
      createdAt: new Date().toISOString(),
    });

    db.school.create({
      id: "10",
      name: "上海市徐汇区第三实验小学",
      code: "102",
      regionId: "310104",
      type: SchoolType.PRIMARY_SIX,
      grades: ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"],
      status: true,
      createdAt: new Date().toISOString(),
    });

    db.school.create({
      id: "11",
      name: "北京市朝阳区实验高中",
      code: "103",
      regionId: "110105",
      type: SchoolType.HIGH_THREE,
      grades: ["高一", "高二", "高三"],
      status: true,
      createdAt: new Date().toISOString(),
    });

    db.school.create({
      id: "12",
      name: "上海市黄浦区育才中学",
      code: "104",
      regionId: "310101",
      type: SchoolType.NINE_YEAR,
      grades: [
        "一年级",
        "二年级",
        "三年级",
        "四年级",
        "五年级",
        "六年级",
        "初一",
        "初二",
        "初三",
      ],
      status: true,
      createdAt: new Date().toISOString(),
    });

    //console.log("学校数据初始化完成");
  }

  // 保存数据库状态
  saveDb();
  //console.log("区域和学校数据已保存");
}

// 修改原始seedDb函数，让它调用seedRegionAndSchoolData
export function seedDb() {
  // 尝试从localStorage加载数据库状态
  if (loadDb()) {
    //console.log("从localStorage恢复了数据库状态，跳过初始化");
    // 即使从本地存储恢复了数据，也检查并初始化区域和学校数据
    seedRegionAndSchoolData();
    return;
  }

  //console.log("初始化模拟数据库...");

  // 添加用户示例数据
  db.user.create({
    id: "1",
    name: "张三",
    email: "zhangsan@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
    createdAt: new Date().toISOString(),
    username: "T301000001",
    password: "password123",
    phone: "13800138000",
    role: "admin",
    school: "北京市朝阳区实验学校",
    schoolType: SchoolType.NINE_YEAR,
  });

  // 添加另一个校端管理员用户
  db.user.create({
    id: "4",
    name: "王校长",
    email: "wangxiaozhang@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
    createdAt: new Date().toISOString(),
    username: "M601000001",
    password: "password123",
    phone: "13600136000",
    role: "admin",
    school: "上海市徐汇区光启中学",
    schoolType: SchoolType.TWELVE_YEAR,
  });

  db.user.create({
    id: "2",
    name: "李四",
    email: "lisi@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    createdAt: new Date().toISOString(),
    username: "T401000001",
    password: "password123",
    phone: "13900139000",
    role: "teacher",
    school: "北京市海淀区中关村中学",
    schoolType: SchoolType.HIGH_THREE,
  });

  // 添加超级管理员用户
  db.user.create({
    id: "3",
    name: "张天一",
    email: "wangchao@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
    createdAt: new Date().toISOString(),
    username: "superadmin",
    password: "password123",
    phone: "13700137000",
    role: "superadmin",
    school: "五石炼成",
    schoolType: "超级管理",
  });

  // 添加更多教师用户
  db.user.create({
    id: "5",
    name: "赵老师",
    email: "zhao@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhao",
    createdAt: new Date().toISOString(),
    username: "T101000001",
    password: "password123",
    phone: "13500135000",
    role: "teacher",
    school: "北京市东城区第一实验小学",
    schoolType: SchoolType.PRIMARY_SIX,
  });

  db.user.create({
    id: "6",
    name: "钱老师",
    email: "qian@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=qian",
    createdAt: new Date().toISOString(),
    username: "T201000001",
    password: "password123",
    phone: "13400134000",
    role: "teacher",
    school: "北京市西城区实验中学",
    schoolType: SchoolType.MIDDLE_THREE,
  });

  db.user.create({
    id: "7",
    name: "孙老师",
    email: "sun@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sun",
    createdAt: new Date().toISOString(),
    username: "T501000001",
    password: "password123",
    phone: "13300133000",
    role: "teacher",
    school: "上海市黄浦区实验小学",
    schoolType: SchoolType.PRIMARY_FIVE,
  });

  // 添加更多学生用户
  db.user.create({
    id: "8",
    name: "小明",
    email: "xiaoming@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming2",
    createdAt: new Date().toISOString(),
    username: "T301000002",
    password: "password123",
    phone: "13200132000",
    role: "student",
    school: "北京市朝阳区实验学校",
    schoolType: SchoolType.NINE_YEAR,
  });

  db.user.create({
    id: "9",
    name: "小红",
    email: "xiaohong@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaohong",
    createdAt: new Date().toISOString(),
    username: "T401000002",
    password: "password123",
    phone: "13100131000",
    role: "student",
    school: "北京市海淀区中关村中学",
    schoolType: SchoolType.HIGH_THREE,
  });

  db.user.create({
    id: "10",
    name: "小华",
    email: "xiaohua@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaohua",
    createdAt: new Date().toISOString(),
    username: "T601000001",
    password: "password123",
    phone: "13000130000",
    role: "student",
    school: "上海市徐汇区光启中学",
    schoolType: SchoolType.TWELVE_YEAR,
  });

  // 添加导师和学生示例数据
  // 添加导师数据
  const mentor1 = db.mentor.create({
    id: "2", // 与用户ID匹配，用于教师角色
    name: "李四",
    email: "lisi@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisi",
    title: "高级教师",
    phone: "13900139000",
    bio: "高中物理教师，拥有十年教学经验，致力于培养学生的科学思维",
    specialties: ["物理", "天文学", "科学教育"],
    isAssigned: true,
    students: [],
  });

  const mentor2 = db.mentor.create({
    id: "5", // 对应赵老师的用户ID
    name: "赵老师",
    email: "zhao@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhao",
    title: "小学教师",
    phone: "13500135000",
    bio: "小学语文教师，专注于儿童阅读能力培养",
    specialties: ["语文", "阅读教育", "写作指导"],
    isAssigned: true,
    students: [],
  });

  const mentor3 = db.mentor.create({
    id: "6", // 对应钱老师的用户ID
    name: "钱老师",
    email: "qian@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=qian",
    title: "中学数学教师",
    phone: "13400134000",
    bio: "初中数学教师，善于用生活实例讲解数学知识",
    specialties: ["数学", "几何", "代数"],
    isAssigned: true,
    students: [],
  });

  const mentor4 = db.mentor.create({
    id: "7", // 对应孙老师的用户ID
    name: "孙老师",
    email: "sun@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sun",
    title: "小学英语教师",
    phone: "13300133000",
    bio: "小学英语教师，注重培养学生的英语兴趣和实用能力",
    specialties: ["英语", "儿童教育", "外语教学"],
    isAssigned: false,
    students: [],
  });

  // 添加学生数据
  const student1 = db.student.create({
    id: "s1",
    name: "张晓明", // 对应用户数据中的"小明"
    email: "xiaoming@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming",
    grade: "初三",
    major: "",
    class: "1",
    studentId: "20210101",
    mentorId: "2", // 李四老师
  });

  const student2 = db.student.create({
    id: "s2",
    name: "李华", // 对应用户数据中的"小红"
    email: "lihua@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lihua",
    grade: "高一",
    major: "",
    class: "2",
    studentId: "20210202",
    mentorId: "2", // 李四老师
  });

  const student3 = db.student.create({
    id: "s3",
    name: "王芳", // 对应用户数据中的"小华"
    email: "wangfang@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wangfang",
    grade: "六年级",
    major: "",
    class: "1",
    studentId: "20220101",
    mentorId: "5", // 赵老师
  });

  // 添加更多学生
  const student4 = db.student.create({
    id: "s4",
    name: "小明",
    email: "xiaoming2@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming2",
    grade: "四年级",
    major: "",
    class: "3",
    studentId: "20220102",
    mentorId: "5", // 赵老师
  });

  const student5 = db.student.create({
    id: "s5",
    name: "小红",
    email: "xiaohong@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaohong",
    grade: "初二",
    major: "",
    class: "4",
    studentId: "20220103",
    mentorId: "6", // 钱老师
  });

  const student6 = db.student.create({
    id: "s6",
    name: "小华",
    email: "xiaohua@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaohua",
    grade: "一年级",
    major: "",
    class: "2",
    studentId: "20220104",
    mentorId: "7", // 孙老师
  });

  // 更新导师的学生列表
  db.mentor.update({
    where: { id: { equals: "2" } },
    data: {
      students: [student1, student2],
    },
  });

  db.mentor.update({
    where: { id: { equals: "5" } },
    data: {
      students: [student3, student4],
    },
  });

  db.mentor.update({
    where: { id: { equals: "6" } },
    data: {
      students: [student5],
    },
  });

  db.mentor.update({
    where: { id: { equals: "7" } },
    data: {
      students: [student6],
      isAssigned: true, // 更新分配状态
    },
  });

  // 添加学科数据
  db.subject.create({
    id: "math",
    name: "数学",
    icon: "math",
    description: "数学学科",
  });

  db.subject.create({
    id: "chinese",
    name: "语文",
    icon: "book",
    description: "语文学科",
  });

  db.subject.create({
    id: "english",
    name: "英语",
    icon: "book",
    description: "英语学科",
  });

  db.subject.create({
    id: "science",
    name: "科学",
    icon: "book",
    description: "科学学科",
  });

  // 添加数学学科的学业标准
  // 核心素养类别
  db.academicStandard.create({
    id: "math-competency-1",
    title: "数学抽象",
    category: "competencies",
    subject: "math",
    grade: "一年级",
    description:
      "数学抽象是数学的基本思维特征，是在数学活动中借助于符号对客观事物的本质属性和关系加以抽提并进行形式化的思维过程。",
    count: 6,
  });

  db.academicStandard.create({
    id: "math-competency-2",
    title: "逻辑推理",
    category: "competencies",
    subject: "math",
    grade: "一年级",
    description:
      "逻辑推理是遵循逻辑规则，由已知的判断得出新判断的思维过程。它是人们认识事物、解决问题的基本方式。",
    count: 4,
  });

  db.academicStandard.create({
    id: "math-competency-3",
    title: "数学建模",
    category: "competencies",
    subject: "math",
    grade: "二年级",
    description:
      "数学建模是从实际问题中抽象出数学模型，利用数学方法求解并解释结果的过程。",
    count: 5,
  });

  db.academicStandard.create({
    id: "math-competency-4",
    title: "直观想象",
    category: "competencies",
    subject: "math",
    grade: "二年级",
    description: "直观想象是借助于图形等形象思维来理解和表达数学内容的过程。",
    count: 3,
  });

  db.academicStandard.create({
    id: "math-competency-5",
    title: "数据分析",
    category: "competencies",
    subject: "math",
    grade: "三年级",
    description:
      "数据分析是收集、整理、分析数据，从数据中发现规律和趋势的过程。",
    count: 8,
  });

  // 领域/主题类别
  db.academicStandard.create({
    id: "math-domain-1",
    title: "数与代数",
    category: "domains",
    subject: "math",
    grade: "一年级",
    description:
      "数与代数是数学的基础领域，包括数的认识、运算和代数初步等内容。",
    count: 12,
  });

  db.academicStandard.create({
    id: "math-domain-2",
    title: "图形与几何",
    category: "domains",
    subject: "math",
    grade: "二年级",
    description: "图形与几何是研究图形的性质和空间关系的数学领域。",
    count: 7,
  });

  db.academicStandard.create({
    id: "math-domain-3",
    title: "统计与概率",
    category: "domains",
    subject: "math",
    grade: "三年级",
    description: "统计与概率是收集、整理、分析数据并进行概率计算的数学领域。",
    count: 6,
  });

  db.academicStandard.create({
    id: "math-domain-4",
    title: "量与计量",
    category: "domains",
    subject: "math",
    grade: "四年级",
    description: "量与计量是研究各种量的测量和计算的数学领域。",
    count: 5,
  });

  db.academicStandard.create({
    id: "math-domain-5",
    title: "综合与实践",
    category: "domains",
    subject: "math",
    grade: "五年级",
    description: "综合与实践是应用数学知识解决实际问题的领域。",
    count: 4,
  });

  // 添加标准详情
  // 数学抽象标准详情
  db.standardDetail.create({
    id: "math-comp-1-detail-1",
    standardId: "math-competency-1",
    content: "能够从生活中的具体情境中抽象出基本的数学概念",
    type: "knowledge",
  });

  db.standardDetail.create({
    id: "math-comp-1-detail-2",
    standardId: "math-competency-1",
    content: "能够使用数学符号表示抽象的数学关系",
    type: "skill",
  });

  db.standardDetail.create({
    id: "math-comp-1-detail-3",
    standardId: "math-competency-1",
    content: "能够理解和使用简单的数学模型描述现实问题",
    type: "skill",
  });

  db.standardDetail.create({
    id: "math-comp-1-detail-4",
    standardId: "math-competency-1",
    content: "对数学抽象过程有积极的态度",
    type: "attitude",
  });

  db.standardDetail.create({
    id: "math-comp-1-detail-5",
    standardId: "math-competency-1",
    content: "理解数是对现实事物的抽象表示",
    type: "knowledge",
  });

  db.standardDetail.create({
    id: "math-comp-1-detail-6",
    standardId: "math-competency-1",
    content: "能够从具体事物中抽象出数量关系",
    type: "skill",
  });

  // 逻辑推理标准详情
  db.standardDetail.create({
    id: "math-comp-2-detail-1",
    standardId: "math-competency-2",
    content: "理解基本的逻辑关系：与、或、非",
    type: "knowledge",
  });

  db.standardDetail.create({
    id: "math-comp-2-detail-2",
    standardId: "math-competency-2",
    content: "能够根据条件进行简单的逻辑推理",
    type: "skill",
  });

  db.standardDetail.create({
    id: "math-comp-2-detail-3",
    standardId: "math-competency-2",
    content: "能够判断简单结论的正确性",
    type: "skill",
  });

  db.standardDetail.create({
    id: "math-comp-2-detail-4",
    standardId: "math-competency-2",
    content: "有严密的逻辑思维习惯",
    type: "attitude",
  });

  // 数与代数领域详情
  db.standardDetail.create({
    id: "math-domain-1-detail-1",
    standardId: "math-domain-1",
    content: "认识100以内的数",
    type: "knowledge",
  });

  db.standardDetail.create({
    id: "math-domain-1-detail-2",
    standardId: "math-domain-1",
    content: "掌握20以内的加减法",
    type: "skill",
  });

  db.standardDetail.create({
    id: "math-domain-1-detail-3",
    standardId: "math-domain-1",
    content: "能够运用加减法解决实际问题",
    type: "skill",
  });

  db.standardDetail.create({
    id: "math-domain-1-detail-4",
    standardId: "math-domain-1",
    content: "对数学计算的准确性有追求",
    type: "attitude",
  });

  // 统计与概率领域详情
  db.standardDetail.create({
    id: "math-domain-3-detail-1",
    standardId: "math-domain-3",
    content: "认识简单的统计图表",
    type: "knowledge",
  });

  db.standardDetail.create({
    id: "math-domain-3-detail-2",
    standardId: "math-domain-3",
    content: "能够收集和整理简单的数据",
    type: "skill",
  });

  db.standardDetail.create({
    id: "math-domain-3-detail-3",
    standardId: "math-domain-3",
    content: "能够绘制简单的统计图表",
    type: "skill",
  });

  db.standardDetail.create({
    id: "math-domain-3-detail-4",
    standardId: "math-domain-3",
    content: "对数据分析有好奇心",
    type: "attitude",
  });

  // 添加应用权限数据
  db.application.create({
    id: "1",
    name: "学业旅程",
    description: "跟踪学生的学业标准达成进度，了解班级整体情况",
    icon: "graduationCap",
    url: "/academic-journey",
    roles: ["teacher", "admin", "superadmin"],
  });

  db.application.create({
    id: "2",
    name: "学业标准",
    description: "浏览和查询各学科学业标准",
    icon: "book",
    url: "/academic-standards",
    roles: ["teacher", "admin", "superadmin"],
  });

  db.application.create({
    id: "3",
    name: "课堂时光机",
    description: "记录和回顾课堂教学活动",
    icon: "clock",
    url: "/classroom-timemachine",
    roles: ["teacher", "admin", "superadmin"],
  });

  db.application.create({
    id: "4",
    name: "大概念地图",
    description: "查看不同学科的概念节点和关系，了解知识体系结构",
    icon: "network",
    url: "/concept-map",
    roles: ["teacher", "admin", "student", "superadmin"],
  });

  db.application.create({
    id: "5",
    name: "数据资产管理",
    description: "管理和浏览教学相关的各类数据资源",
    icon: "database",
    url: "/data-assets",
    roles: ["teacher", "admin", "superadmin"],
  });

  db.application.create({
    id: "6",
    name: "考试管理",
    description: "创建、编辑和管理各类考试及试卷",
    icon: "fileText",
    url: "/exam-management",
    roles: ["teacher", "admin", "superadmin"],
  });

  db.application.create({
    id: "7",
    name: "全员导师",
    description: "管理学生导师体系和师生关系",
    icon: "userPlus",
    url: "/mentor-system",
    roles: ["teacher", "admin", "superadmin"],
  });

  db.application.create({
    id: "8",
    name: "单元教案",
    description: "创建和管理单元教案设计",
    icon: "pencil",
    url: "/teaching-design",
    roles: ["admin", "teacher"],
  });

  db.application.create({
    id: "9",
    name: "师生信息管理",
    description: "管理教师和学生基本信息",
    icon: "users",
    url: "/teacher-student-info",
    roles: ["admin", "superadmin"],
  });

  // 添加校端特有的应用权限
  db.application.create({
    id: "10",
    name: "教育管理",
    description: "学校教育管理系统入口",
    icon: "school",
    url: "/admin/education",
    roles: ["admin"],
  });

  db.application.create({
    id: "11",
    name: "教师管理",
    description: "管理学校教师信息",
    icon: "users",
    url: "/admin/education/teachers",
    roles: ["admin"],
  });

  db.application.create({
    id: "12",
    name: "学生管理",
    description: "管理学生基本信息",
    icon: "graduationCap",
    url: "/admin/education/students",
    roles: ["admin"],
  });

  db.application.create({
    id: "13",
    name: "年级管理",
    description: "管理学校年级信息",
    icon: "book",
    url: "/admin/education/grades",
    roles: ["admin"],
  });

  db.application.create({
    id: "14",
    name: "班级管理",
    description: "管理学校班级信息",
    icon: "school",
    url: "/admin/education/classes",
    roles: ["admin"],
  });

  // 初始化角色权限 - 确保这段代码可以被执行
  //console.log("检查角色权限初始化...");
  // 为admin角色添加所有应用的权限
  const adminRole = "admin";
  const allApplications = db.application.getAll();
  //console.log(`找到 ${allApplications.length} 个应用，准备设置权限`);

  // 先删除可能存在的旧权限
  try {
    db.rolePermission.deleteMany({
      where: {
        role: {
          equals: adminRole,
        },
      },
    });
    //console.log("已删除现有admin角色权限");
  } catch (e) {
    //console.log("删除旧权限时出错或无权限可删除", e);
  }

  // 添加新权限
  allApplications.forEach((app) => {
    try {
      db.rolePermission.create({
        id: `rp-${adminRole}-${app.id}-${Date.now()}`, // 添加时间戳避免ID冲突
        role: adminRole,
        applicationId: app.id,
        granted: true, // 确保授予权限
        createdAt: new Date().toISOString(),
      });
      //console.log(`已为admin角色添加应用权限: ${app.name}`);
    } catch (e) {
      console.error(`为应用 ${app.id} 添加权限时出错:`, e);
    }
  });

  // 保存数据库状态
  saveDb();
  //console.log("数据库状态已保存");

  // 初始化区域和学校数据
  seedRegionAndSchoolData();

  // 添加课程数据
  // 小学课程
  const course1 = db.course.create({
    id: "c1",
    name: "小学语文（三年级上）",
    code: "PRI-CHN-3A",
    description: "培养学生的语文素养，提高阅读理解和写作能力",
    schoolId: "1", // 北京市东城区第一实验小学
    gradeLevel: "三年级",
    subject: "语文",
    teacherId: "5", // 赵老师
    status: "active",
    startDate: new Date("2023-09-01").toISOString(),
    endDate: new Date("2024-01-15").toISOString(),
    enrollmentLimit: 40,
    enrollmentCount: 38,
    schedule: "周一、周三 上午8:00-9:30",
    location: "教学楼A区 301教室",
    textbooks: [
      {
        id: "tb1",
        title: "人教版小学语文三年级上册",
        author: "人民教育出版社",
        publisher: "人民教育出版社",
        year: 2023,
        isbn: "9787107339875",
      },
    ],
    syllabus: "语文基础知识、阅读理解、作文写作、口语表达",
  });

  const course2 = db.course.create({
    id: "c2",
    name: "小学数学（四年级上）",
    code: "PRI-MATH-4A",
    description: "培养学生的数学思维和解决问题的能力",
    schoolId: "1", // 北京市东城区第一实验小学
    gradeLevel: "四年级",
    subject: "数学",
    teacherId: "5", // 赵老师（兼职数学）
    status: "active",
    startDate: new Date("2023-09-01").toISOString(),
    endDate: new Date("2024-01-15").toISOString(),
    enrollmentLimit: 40,
    enrollmentCount: 36,
    schedule: "周二、周四 上午10:00-11:30",
    location: "教学楼A区 302教室",
    textbooks: [
      {
        id: "tb2",
        title: "人教版小学数学四年级上册",
        author: "人民教育出版社",
        publisher: "人民教育出版社",
        year: 2023,
        isbn: "9787107339882",
      },
    ],
    syllabus: "数与代数、图形与几何、统计与概率、应用题",
  });

  // 初中课程
  const course3 = db.course.create({
    id: "c3",
    name: "初中数学（初二上）",
    code: "MID-MATH-2A",
    description: "培养学生的数学思维和解题能力，为高中数学打下基础",
    schoolId: "2", // 北京市西城区实验中学
    gradeLevel: "初二",
    subject: "数学",
    teacherId: "6", // 钱老师
    status: "active",
    startDate: new Date("2023-09-01").toISOString(),
    endDate: new Date("2024-01-15").toISOString(),
    enrollmentLimit: 45,
    enrollmentCount: 42,
    schedule: "周一、周三、周五 上午8:00-9:30",
    location: "教学楼B区 201教室",
    textbooks: [
      {
        id: "tb3",
        title: "人教版初中数学八年级上册",
        author: "人民教育出版社",
        publisher: "人民教育出版社",
        year: 2023,
        isbn: "9787107339899",
      },
    ],
    syllabus: "代数基础、几何证明、函数初步、统计与概率",
  });

  // 小学英语课程
  const course4 = db.course.create({
    id: "c4",
    name: "小学英语（一年级上）",
    code: "PRI-ENG-1A",
    description: "培养学生对英语的兴趣，建立语音基础和简单词汇",
    schoolId: "10", // 上海市徐汇区第三实验小学
    gradeLevel: "一年级",
    subject: "英语",
    teacherId: "7", // 孙老师
    status: "active",
    startDate: new Date("2023-09-01").toISOString(),
    endDate: new Date("2024-01-15").toISOString(),
    enrollmentLimit: 35,
    enrollmentCount: 33,
    schedule: "周二、周四 上午9:00-10:00",
    location: "教学楼C区 101教室",
    textbooks: [
      {
        id: "tb4",
        title: "PEP小学英语一年级上册",
        author: "人民教育出版社",
        publisher: "人民教育出版社",
        year: 2023,
        isbn: "9787107339905",
      },
    ],
    syllabus: "英语字母、简单词汇、基础对话、儿童歌谣",
  });

  // 高中课程
  const course5 = db.course.create({
    id: "c5",
    name: "高中物理（高一上）",
    code: "HIGH-PHY-1A",
    description: "培养学生的物理思维和实验能力，为高考做准备",
    schoolId: "9", // 北京市海淀区清华附属中学
    gradeLevel: "高一",
    subject: "物理",
    teacherId: "2", // 李四（高级教师）
    status: "active",
    startDate: new Date("2023-09-01").toISOString(),
    endDate: new Date("2024-01-15").toISOString(),
    enrollmentLimit: 50,
    enrollmentCount: 48,
    schedule: "周一、周三、周五 下午2:00-3:30",
    location: "理科楼 301实验室",
    textbooks: [
      {
        id: "tb5",
        title: "人教版高中物理必修1",
        author: "人民教育出版社",
        publisher: "人民教育出版社",
        year: 2023,
        isbn: "9787107339912",
      },
    ],
    syllabus: "运动学、力学、能量与动量、实验方法",
  });

  // 添加课程班级和学生关联数据
  db.courseEnrollment.create({
    id: "e1",
    courseId: "c1",
    studentId: "s4", // 小明（四年级）
    enrollmentDate: new Date("2023-08-25").toISOString(),
    status: "enrolled",
    finalGrade: undefined,
  });

  db.courseEnrollment.create({
    id: "e2",
    courseId: "c3",
    studentId: "s5", // 小红（初二）
    enrollmentDate: new Date("2023-08-23").toISOString(),
    status: "enrolled",
    finalGrade: undefined,
  });

  db.courseEnrollment.create({
    id: "e3",
    courseId: "c4",
    studentId: "s6", // 小华（一年级）
    enrollmentDate: new Date("2023-08-20").toISOString(),
    status: "enrolled",
    finalGrade: undefined,
  });

  db.courseEnrollment.create({
    id: "e4",
    courseId: "c5",
    studentId: "s2", // 李华（高一）
    enrollmentDate: new Date("2023-08-22").toISOString(),
    status: "enrolled",
    finalGrade: undefined,
  });

  //console.log("课程数据初始化完成");
}
