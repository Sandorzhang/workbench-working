import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

// 数据资产类型
interface DataAsset {
  id: string;
  name: string;
  category: string; // 学生数据/教师数据/教学数据/管理数据等
  type: string; // 结构化数据/非结构化数据
  format: string; // CSV/JSON/Excel等
  description: string;
  size: string; // 数据规模，如"2.5GB"
  lastUpdated: string; // 更新时间
  accessLevel: string; // 访问权限级别：public/internal/restricted/confidential
  source: string; // 数据来源
  owner: string; // 数据责任人
  tags: string[]; // 标签
  usageCount: number; // 使用次数
  isImportant: boolean; // 是否重要数据
}

// 生成一些测试数据
const dataAssetsMock = [
  {
    id: '1',
    name: '学生基础信息',
    category: '学生数据',
    type: '结构化数据',
    format: 'SQL',
    description: '包含学生的基本信息，包括学号、姓名、性别、班级、年级、专业等基础数据。该数据集是学校管理系统的核心数据，用于支持各类教学和管理功能。',
    size: '45.8 MB',
    lastUpdated: '2023-12-15T08:30:00Z',
    accessLevel: 'internal',
    source: '教务系统',
    owner: '学生处',
    ownerDepartment: '学生管理部',
    tags: ['学生', '基础数据', '核心数据'],
    usageCount: 152,
    isImportant: true,
    createdAt: '2021-05-10T10:00:00Z',
    frequentUsers: ['教务处', '学生处', '班主任'],
    relatedAssets: [
      {
        id: '3',
        name: '学生成绩数据',
        category: '成绩数据'
      },
      {
        id: '4',
        name: '学生考勤数据',
        category: '考勤数据'
      }
    ],
    schema: {
      fields: [
        {
          name: 'student_id',
          type: 'VARCHAR(20)',
          description: '学生唯一标识符',
          isPrimaryKey: true
        },
        {
          name: 'name',
          type: 'VARCHAR(50)',
          description: '学生姓名'
        },
        {
          name: 'gender',
          type: 'VARCHAR(10)',
          description: '学生性别'
        },
        {
          name: 'date_of_birth',
          type: 'DATE',
          description: '出生日期',
          isNullable: true
        },
        {
          name: 'class_id',
          type: 'VARCHAR(20)',
          description: '班级ID',
          isForeignKey: true
        },
        {
          name: 'grade',
          type: 'INT',
          description: '年级'
        },
        {
          name: 'major',
          type: 'VARCHAR(50)',
          description: '专业'
        },
        {
          name: 'enrollment_date',
          type: 'DATE',
          description: '入学日期'
        },
        {
          name: 'status',
          type: 'VARCHAR(20)',
          description: '学生状态（在读/休学/退学等）'
        }
      ]
    },
    accessHistory: [
      {
        userId: 'user1',
        userName: '张主任',
        accessTime: '2024-03-25T14:20:00Z',
        purpose: '学期学生评估'
      },
      {
        userId: 'user2',
        userName: '李老师',
        accessTime: '2024-03-20T09:15:00Z',
        purpose: '班级学生管理'
      },
      {
        userId: 'user3',
        userName: '王助教',
        accessTime: '2024-03-17T11:30:00Z',
        purpose: '学生信息核对'
      }
    ],
    qualityScore: 9.2,
    updateFrequency: '每日更新'
  },
  {
    id: '2',
    name: '教师基础信息',
    category: '教师数据',
    type: '结构化数据',
    format: 'SQL',
    description: '包含教师的基本信息，包括工号、姓名、部门、职位、学历等基础数据。用于人事管理、教学安排和业绩评估。',
    size: '12.5 MB',
    lastUpdated: '2024-01-20T14:45:00Z',
    accessLevel: 'internal',
    source: '人事系统',
    owner: '人事处',
    ownerDepartment: '人力资源部',
    tags: ['教师', '基础数据', '人事数据'],
    usageCount: 87,
    isImportant: true,
    createdAt: '2021-06-15T09:30:00Z',
    frequentUsers: ['人事处', '教务处', '学院办公室'],
    relatedAssets: [
      {
        id: '5',
        name: '教师课程安排',
        category: '教学数据'
      }
    ],
    schema: {
      fields: [
        {
          name: 'teacher_id',
          type: 'VARCHAR(20)',
          description: '教师唯一标识符',
          isPrimaryKey: true
        },
        {
          name: 'name',
          type: 'VARCHAR(50)',
          description: '教师姓名'
        },
        {
          name: 'gender',
          type: 'VARCHAR(10)',
          description: '性别'
        },
        {
          name: 'department',
          type: 'VARCHAR(50)',
          description: '所属部门'
        },
        {
          name: 'position',
          type: 'VARCHAR(50)',
          description: '职位'
        },
        {
          name: 'education',
          type: 'VARCHAR(50)',
          description: '学历'
        },
        {
          name: 'specialty',
          type: 'VARCHAR(100)',
          description: '专业/研究方向',
          isNullable: true
        },
        {
          name: 'hire_date',
          type: 'DATE',
          description: '入职日期'
        }
      ]
    },
    accessHistory: [
      {
        userId: 'user4',
        userName: '陈处长',
        accessTime: '2024-03-26T10:10:00Z',
        purpose: '师资评估'
      },
      {
        userId: 'user5',
        userName: '杨主任',
        accessTime: '2024-03-22T16:30:00Z',
        purpose: '课程安排'
      }
    ],
    qualityScore: 8.8,
    updateFrequency: '每周更新'
  },
  {
    id: '3',
    name: '学生成绩数据',
    category: '成绩数据',
    type: '结构化数据',
    format: 'SQL',
    description: '包含所有学生的课程成绩记录，包括平时成绩、考试成绩、总评成绩等。用于学生成绩管理、成绩分析和教学质量评估。',
    size: '156.2 MB',
    lastUpdated: '2024-02-28T16:20:00Z',
    accessLevel: 'restricted',
    source: '教务系统',
    owner: '教务处',
    ownerDepartment: '教学管理部',
    tags: ['成绩', '教学数据', '评估数据'],
    usageCount: 204,
    isImportant: true,
    createdAt: '2021-05-15T11:45:00Z',
    frequentUsers: ['教务处', '学院教学秘书', '任课教师'],
    relatedAssets: [
      {
        id: '1',
        name: '学生基础信息',
        category: '学生数据'
      },
      {
        id: '6',
        name: '课程基础信息',
        category: '课程数据'
      }
    ],
    schema: {
      fields: [
        {
          name: 'record_id',
          type: 'BIGINT',
          description: '成绩记录ID',
          isPrimaryKey: true
        },
        {
          name: 'student_id',
          type: 'VARCHAR(20)',
          description: '学生ID',
          isForeignKey: true
        },
        {
          name: 'course_id',
          type: 'VARCHAR(20)',
          description: '课程ID',
          isForeignKey: true
        },
        {
          name: 'semester',
          type: 'VARCHAR(20)',
          description: '学期'
        },
        {
          name: 'regular_score',
          type: 'DECIMAL(5,2)',
          description: '平时成绩',
          isNullable: true
        },
        {
          name: 'exam_score',
          type: 'DECIMAL(5,2)',
          description: '考试成绩',
          isNullable: true
        },
        {
          name: 'total_score',
          type: 'DECIMAL(5,2)',
          description: '总评成绩'
        },
        {
          name: 'grade_point',
          type: 'DECIMAL(3,1)',
          description: '绩点'
        },
        {
          name: 'is_passed',
          type: 'BOOLEAN',
          description: '是否通过'
        },
        {
          name: 'record_date',
          type: 'DATETIME',
          description: '记录时间'
        }
      ]
    },
    accessHistory: [
      {
        userId: 'user6',
        userName: '赵教授',
        accessTime: '2024-03-28T09:25:00Z',
        purpose: '学期成绩分析'
      },
      {
        userId: 'user7',
        userName: '钱主任',
        accessTime: '2024-03-25T14:40:00Z',
        purpose: '教学质量评估'
      },
      {
        userId: 'user8',
        userName: '孙老师',
        accessTime: '2024-03-23T10:15:00Z',
        purpose: '学生成绩查询'
      }
    ],
    qualityScore: 9.5,
    updateFrequency: '学期更新'
  },
  {
    id: '4',
    name: '学生考勤数据',
    category: '考勤数据',
    type: '结构化数据',
    format: 'SQL',
    description: '记录学生的课程出勤情况，包括请假、迟到、缺席等记录。用于学生考勤管理和学生行为分析。',
    size: '67.8 MB',
    lastUpdated: '2024-03-15T18:10:00Z',
    accessLevel: 'internal',
    source: '考勤系统',
    owner: '教务处',
    ownerDepartment: '教学管理部',
    tags: ['考勤', '行为数据'],
    usageCount: 76,
    isImportant: false,
    createdAt: '2022-01-10T14:30:00Z',
    frequentUsers: ['班主任', '辅导员', '任课教师'],
    relatedAssets: [
      {
        id: '1',
        name: '学生基础信息',
        category: '学生数据'
      }
    ],
    schema: {
      fields: [
        {
          name: 'attendance_id',
          type: 'BIGINT',
          description: '考勤记录ID',
          isPrimaryKey: true
        },
        {
          name: 'student_id',
          type: 'VARCHAR(20)',
          description: '学生ID',
          isForeignKey: true
        },
        {
          name: 'course_id',
          type: 'VARCHAR(20)',
          description: '课程ID',
          isForeignKey: true
        },
        {
          name: 'class_date',
          type: 'DATE',
          description: '上课日期'
        },
        {
          name: 'class_time',
          type: 'VARCHAR(20)',
          description: '上课时间'
        },
        {
          name: 'status',
          type: 'VARCHAR(20)',
          description: '出勤状态（出席/迟到/缺席/请假）'
        },
        {
          name: 'remark',
          type: 'VARCHAR(200)',
          description: '备注',
          isNullable: true
        },
        {
          name: 'recorder',
          type: 'VARCHAR(50)',
          description: '记录人'
        },
        {
          name: 'record_time',
          type: 'DATETIME',
          description: '记录时间'
        }
      ]
    },
    accessHistory: [
      {
        userId: 'user9',
        userName: '李辅导员',
        accessTime: '2024-03-27T15:50:00Z',
        purpose: '学生出勤统计'
      },
      {
        userId: 'user10',
        userName: '周班主任',
        accessTime: '2024-03-26T11:30:00Z',
        purpose: '班级考勤分析'
      }
    ],
    qualityScore: 8.3,
    updateFrequency: '每日更新'
  },
  {
    id: '5',
    name: '教师课程安排',
    category: '教学数据',
    type: '结构化数据',
    format: 'SQL',
    description: '记录教师的课程安排信息，包括课程、班级、教室、时间等。用于教学安排和教室管理。',
    size: '23.4 MB',
    lastUpdated: '2024-03-10T11:25:00Z',
    accessLevel: 'internal',
    source: '教务系统',
    owner: '教务处',
    ownerDepartment: '教学管理部',
    tags: ['课程安排', '教学管理'],
    usageCount: 95,
    isImportant: true,
    createdAt: '2021-08-20T15:40:00Z',
    frequentUsers: ['教务处', '任课教师', '学院教务员'],
    relatedAssets: [
      {
        id: '2',
        name: '教师基础信息',
        category: '教师数据'
      },
      {
        id: '6',
        name: '课程基础信息',
        category: '课程数据'
      }
    ],
    schema: {
      fields: [
        {
          name: 'schedule_id',
          type: 'BIGINT',
          description: '排课ID',
          isPrimaryKey: true
        },
        {
          name: 'teacher_id',
          type: 'VARCHAR(20)',
          description: '教师ID',
          isForeignKey: true
        },
        {
          name: 'course_id',
          type: 'VARCHAR(20)',
          description: '课程ID',
          isForeignKey: true
        },
        {
          name: 'class_id',
          type: 'VARCHAR(20)',
          description: '班级ID',
          isForeignKey: true
        },
        {
          name: 'semester',
          type: 'VARCHAR(20)',
          description: '学期'
        },
        {
          name: 'classroom',
          type: 'VARCHAR(50)',
          description: '教室'
        },
        {
          name: 'day_of_week',
          type: 'INT',
          description: '星期几'
        },
        {
          name: 'start_time',
          type: 'TIME',
          description: '开始时间'
        },
        {
          name: 'end_time',
          type: 'TIME',
          description: '结束时间'
        },
        {
          name: 'weeks',
          type: 'VARCHAR(100)',
          description: '上课周次'
        }
      ]
    },
    accessHistory: [
      {
        userId: 'user11',
        userName: '吴秘书',
        accessTime: '2024-03-28T11:05:00Z',
        purpose: '教室安排'
      },
      {
        userId: 'user12',
        userName: '郑教授',
        accessTime: '2024-03-25T09:30:00Z',
        purpose: '课程查询'
      }
    ],
    qualityScore: 9.0,
    updateFrequency: '学期更新'
  },
  {
    id: '6',
    name: '课程基础信息',
    category: '课程数据',
    type: '结构化数据',
    format: 'SQL',
    description: '包含所有课程的基本信息，包括课程代码、名称、学分、课时、课程类型等。用于课程管理和教学计划制定。',
    size: '8.7 MB',
    lastUpdated: '2024-01-05T10:15:00Z',
    accessLevel: 'public',
    source: '教务系统',
    owner: '教务处',
    ownerDepartment: '教学管理部',
    tags: ['课程', '基础数据'],
    usageCount: 132,
    isImportant: true,
    createdAt: '2021-04-18T13:20:00Z',
    frequentUsers: ['教务处', '教师', '学生'],
    relatedAssets: [
      {
        id: '3',
        name: '学生成绩数据',
        category: '成绩数据'
      },
      {
        id: '5',
        name: '教师课程安排',
        category: '教学数据'
      }
    ],
    schema: {
      fields: [
        {
          name: 'course_id',
          type: 'VARCHAR(20)',
          description: '课程ID',
          isPrimaryKey: true
        },
        {
          name: 'course_name',
          type: 'VARCHAR(100)',
          description: '课程名称'
        },
        {
          name: 'course_code',
          type: 'VARCHAR(20)',
          description: '课程代码'
        },
        {
          name: 'credit',
          type: 'DECIMAL(3,1)',
          description: '学分'
        },
        {
          name: 'hours',
          type: 'INT',
          description: '课时'
        },
        {
          name: 'course_type',
          type: 'VARCHAR(50)',
          description: '课程类型'
        },
        {
          name: 'department',
          type: 'VARCHAR(50)',
          description: '开课院系'
        },
        {
          name: 'prerequisite',
          type: 'VARCHAR(200)',
          description: '先修课程',
          isNullable: true
        },
        {
          name: 'description',
          type: 'TEXT',
          description: '课程描述',
          isNullable: true
        }
      ]
    },
    accessHistory: [
      {
        userId: 'user13',
        userName: '王教师',
        accessTime: '2024-03-27T13:45:00Z',
        purpose: '课程信息查看'
      },
      {
        userId: 'user14',
        userName: '刘教务',
        accessTime: '2024-03-22T10:20:00Z',
        purpose: '课程规划'
      }
    ],
    qualityScore: 9.7,
    updateFrequency: '学期更新'
  },
  {
    id: '7',
    name: '教室使用情况',
    category: '设施数据',
    type: '结构化数据',
    format: 'SQL',
    description: '记录学校各教室的使用情况，包括教室编号、类型、容量、使用状态等。用于教室管理和排课安排。',
    size: '15.3 MB',
    lastUpdated: '2024-03-12T16:55:00Z',
    accessLevel: 'internal',
    source: '教务系统',
    owner: '教务处',
    ownerDepartment: '教学管理部',
    tags: ['教室', '设施', '场地'],
    usageCount: 68,
    isImportant: false,
    createdAt: '2022-02-15T09:10:00Z',
    frequentUsers: ['教务处', '后勤部门'],
    relatedAssets: [
      {
        id: '5',
        name: '教师课程安排',
        category: '教学数据'
      }
    ],
    schema: {
      fields: [
        {
          name: 'room_id',
          type: 'VARCHAR(20)',
          description: '教室ID',
          isPrimaryKey: true
        },
        {
          name: 'building',
          type: 'VARCHAR(50)',
          description: '所在建筑'
        },
        {
          name: 'room_number',
          type: 'VARCHAR(20)',
          description: '房间号'
        },
        {
          name: 'room_type',
          type: 'VARCHAR(50)',
          description: '教室类型'
        },
        {
          name: 'capacity',
          type: 'INT',
          description: '容纳人数'
        },
        {
          name: 'facilities',
          type: 'VARCHAR(200)',
          description: '设施描述',
          isNullable: true
        },
        {
          name: 'status',
          type: 'VARCHAR(20)',
          description: '状态（可用/维修中/预留）'
        },
        {
          name: 'last_maintenance',
          type: 'DATE',
          description: '最近维护日期',
          isNullable: true
        }
      ]
    },
    accessHistory: [
      {
        userId: 'user15',
        userName: '张后勤',
        accessTime: '2024-03-26T14:00:00Z',
        purpose: '教室维护计划'
      }
    ],
    qualityScore: 8.6,
    updateFrequency: '每日更新'
  },
  {
    id: '8',
    name: '图书馆藏书数据',
    category: '图书数据',
    type: '结构化数据',
    format: 'SQL',
    description: '包含图书馆所有藏书的信息，包括书名、作者、出版社、分类、ISBN等。用于图书管理和借阅服务。',
    size: '385.6 MB',
    lastUpdated: '2024-03-18T09:40:00Z',
    accessLevel: 'public',
    source: '图书馆系统',
    owner: '图书馆',
    ownerDepartment: '图书信息部',
    tags: ['图书', '馆藏', '文献'],
    usageCount: 246,
    isImportant: true,
    createdAt: '2020-12-10T11:30:00Z',
    frequentUsers: ['图书馆员', '学生', '教师'],
    relatedAssets: [
      {
        id: '9',
        name: '图书借阅记录',
        category: '图书数据'
      }
    ],
    schema: {
      fields: [
        {
          name: 'book_id',
          type: 'VARCHAR(20)',
          description: '图书ID',
          isPrimaryKey: true
        },
        {
          name: 'title',
          type: 'VARCHAR(200)',
          description: '书名'
        },
        {
          name: 'authors',
          type: 'VARCHAR(200)',
          description: '作者'
        },
        {
          name: 'publisher',
          type: 'VARCHAR(100)',
          description: '出版社'
        },
        {
          name: 'publish_date',
          type: 'DATE',
          description: '出版日期',
          isNullable: true
        },
        {
          name: 'isbn',
          type: 'VARCHAR(20)',
          description: 'ISBN'
        },
        {
          name: 'category',
          type: 'VARCHAR(50)',
          description: '图书分类'
        },
        {
          name: 'location',
          type: 'VARCHAR(50)',
          description: '存放位置'
        },
        {
          name: 'copies',
          type: 'INT',
          description: '馆藏复本数'
        },
        {
          name: 'available_copies',
          type: 'INT',
          description: '可借复本数'
        },
        {
          name: 'language',
          type: 'VARCHAR(20)',
          description: '语言'
        },
        {
          name: 'description',
          type: 'TEXT',
          description: '图书简介',
          isNullable: true
        }
      ]
    },
    accessHistory: [
      {
        userId: 'user16',
        userName: '钱馆长',
        accessTime: '2024-03-28T16:15:00Z',
        purpose: '馆藏统计'
      },
      {
        userId: 'user17',
        userName: '孙图书管理员',
        accessTime: '2024-03-27T10:40:00Z',
        purpose: '图书清点'
      },
      {
        userId: 'user18',
        userName: '李研究员',
        accessTime: '2024-03-25T14:25:00Z',
        purpose: '文献检索'
      }
    ],
    qualityScore: 9.4,
    updateFrequency: '每日更新'
  },
  {
    id: '9',
    name: '图书借阅记录',
    category: '图书数据',
    type: '结构化数据',
    format: 'SQL',
    description: '记录图书的借阅情况，包括借阅者、借阅时间、归还时间等。用于借阅管理和读者行为分析。',
    size: '274.2 MB',
    lastUpdated: '2024-03-25T19:30:00Z',
    accessLevel: 'restricted',
    source: '图书馆系统',
    owner: '图书馆',
    ownerDepartment: '图书信息部',
    tags: ['借阅', '图书', '用户行为'],
    usageCount: 104,
    isImportant: false,
    createdAt: '2020-12-15T14:40:00Z',
    frequentUsers: ['图书馆员', '图书馆管理员'],
    relatedAssets: [
      {
        id: '8',
        name: '图书馆藏书数据',
        category: '图书数据'
      },
      {
        id: '1',
        name: '学生基础信息',
        category: '学生数据'
      }
    ],
    schema: {
      fields: [
        {
          name: 'borrow_id',
          type: 'BIGINT',
          description: '借阅ID',
          isPrimaryKey: true
        },
        {
          name: 'book_id',
          type: 'VARCHAR(20)',
          description: '图书ID',
          isForeignKey: true
        },
        {
          name: 'user_id',
          type: 'VARCHAR(20)',
          description: '用户ID',
          isForeignKey: true
        },
        {
          name: 'borrow_date',
          type: 'DATETIME',
          description: '借阅日期'
        },
        {
          name: 'due_date',
          type: 'DATE',
          description: '应还日期'
        },
        {
          name: 'return_date',
          type: 'DATETIME',
          description: '实际归还日期',
          isNullable: true
        },
        {
          name: 'status',
          type: 'VARCHAR(20)',
          description: '状态（已借/已还/逾期）'
        },
        {
          name: 'renewal_count',
          type: 'INT',
          description: '续借次数'
        },
        {
          name: 'fine',
          type: 'DECIMAL(8,2)',
          description: '罚款金额',
          isNullable: true
        },
        {
          name: 'remark',
          type: 'VARCHAR(200)',
          description: '备注',
          isNullable: true
        }
      ]
    },
    accessHistory: [
      {
        userId: 'user19',
        userName: '周图书管理员',
        accessTime: '2024-03-28T11:20:00Z',
        purpose: '借阅统计分析'
      },
      {
        userId: 'user20',
        userName: '郑主任',
        accessTime: '2024-03-24T16:35:00Z',
        purpose: '逾期归还处理'
      }
    ],
    qualityScore: 8.9,
    updateFrequency: '实时更新'
  },
  {
    id: '10',
    name: '学校财务数据',
    category: '财务数据',
    type: '结构化数据',
    format: 'SQL',
    description: '包含学校的财务收支信息，包括预算、支出、收入等财务数据。用于财务管理和预算规划。',
    size: '98.5 MB',
    lastUpdated: '2024-03-20T15:25:00Z',
    accessLevel: 'confidential',
    source: '财务系统',
    owner: '财务处',
    ownerDepartment: '财务部',
    tags: ['财务', '预算', '核心数据'],
    usageCount: 53,
    isImportant: true,
    createdAt: '2021-01-05T10:20:00Z',
    frequentUsers: ['财务处', '校领导', '审计部门'],
    relatedAssets: [],
    schema: {
      fields: [
        {
          name: 'transaction_id',
          type: 'BIGINT',
          description: '交易ID',
          isPrimaryKey: true
        },
        {
          name: 'transaction_date',
          type: 'DATE',
          description: '交易日期'
        },
        {
          name: 'fiscal_year',
          type: 'INT',
          description: '财政年度'
        },
        {
          name: 'department',
          type: 'VARCHAR(50)',
          description: '部门'
        },
        {
          name: 'account_code',
          type: 'VARCHAR(20)',
          description: '账户代码'
        },
        {
          name: 'category',
          type: 'VARCHAR(50)',
          description: '类别'
        },
        {
          name: 'description',
          type: 'VARCHAR(200)',
          description: '描述'
        },
        {
          name: 'amount',
          type: 'DECIMAL(12,2)',
          description: '金额'
        },
        {
          name: 'transaction_type',
          type: 'VARCHAR(20)',
          description: '交易类型（收入/支出）'
        },
        {
          name: 'approver',
          type: 'VARCHAR(50)',
          description: '审批人',
          isNullable: true
        },
        {
          name: 'approval_date',
          type: 'DATE',
          description: '审批日期',
          isNullable: true
        },
        {
          name: 'status',
          type: 'VARCHAR(20)',
          description: '状态'
        }
      ]
    },
    accessHistory: [
      {
        userId: 'user21',
        userName: '吴财务总监',
        accessTime: '2024-03-27T14:30:00Z',
        purpose: '季度财务报表'
      },
      {
        userId: 'user22',
        userName: '郑校长',
        accessTime: '2024-03-25T10:15:00Z',
        purpose: '财务审核'
      }
    ],
    qualityScore: 9.6,
    updateFrequency: '每日更新'
  }
];

// 计算统计数据
const calculateStats = () => {
  const totalAssets = dataAssetsMock.length;
  const importantAssets = dataAssetsMock.filter(asset => asset.isImportant).length;
  
  const categoryStats = dataAssetsMock.reduce((acc, asset) => {
    if (!acc[asset.category]) {
      acc[asset.category] = 0;
    }
    acc[asset.category]++;
    return acc;
  }, {} as Record<string, number>);
  
  const typeStats = dataAssetsMock.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = 0;
    }
    acc[asset.type]++;
    return acc;
  }, {} as Record<string, number>);
  
  // 计算总体数据规模
  const totalSizeBytes = dataAssetsMock.reduce((total, asset) => {
    const sizeStr = asset.size;
    const sizeNumber = parseFloat(sizeStr.split(' ')[0]);
    const unit = sizeStr.split(' ')[1];
    
    let bytes = 0;
    if (unit === 'KB') bytes = sizeNumber * 1024;
    else if (unit === 'MB') bytes = sizeNumber * 1024 * 1024;
    else if (unit === 'GB') bytes = sizeNumber * 1024 * 1024 * 1024;
    else bytes = sizeNumber;
    
    return total + bytes;
  }, 0);
  
  // 转换为合适的单位
  let totalSize: string;
  if (totalSizeBytes < 1024 * 1024) {
    totalSize = `${(totalSizeBytes / 1024).toFixed(2)} KB`;
  } else if (totalSizeBytes < 1024 * 1024 * 1024) {
    totalSize = `${(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    totalSize = `${(totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
  
  return {
    totalAssets,
    importantAssets,
    categoryStats,
    typeStats,
    totalSize
  };
};

export const dataAssetsHandlers = [
  // 获取所有数据资产
  http.get('/api/data-assets', async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    
    let filteredAssets = [...dataAssetsMock];
    
    // 按分类筛选
    if (category && category !== 'all') {
      filteredAssets = filteredAssets.filter(asset => 
        asset.category.toLowerCase() === category.toLowerCase());
    }
    
    // 按搜索词筛选
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAssets = filteredAssets.filter(asset => 
        asset.name.toLowerCase().includes(searchLower) ||
        asset.description.toLowerCase().includes(searchLower) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return HttpResponse.json(filteredAssets);
  }),
  
  // 获取数据资产统计
  http.get('/api/data-assets/stats', async () => {
    await delay();
    const stats = calculateStats();
    return HttpResponse.json(stats);
  }),
  
  // 获取数据资产详情
  http.get('/api/data-assets/:id', async ({ params }) => {
    await delay();
    const { id } = params;
    const asset = dataAssetsMock.find(asset => asset.id === id);
    
    if (!asset) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(asset);
  })
]; 