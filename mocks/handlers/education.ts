import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';

// Types
interface Teacher {
  id: string;
  name: string;
  gender: string;
  age: number;
  subject: string;
  title: string;
  phone: string;
  email: string;
  status: string;
  classes?: string[]; // 关联的班级ID
}

interface Student {
  id: string;
  name: string;
  gender: string;
  age: number;
  class: string;
  grade: string;
  studentId: string;
  phone: string;
  guardian: string;
  status: string;
}

interface Grade {
  id: string;
  name: string;
  year: string;
  description?: string;
}

interface Class {
  id: string;
  name: string;
  gradeId: string;
  headTeacherId?: string;
  teacherIds: string[];
  studentIds: string[];
  roomNumber?: string;
  description?: string;
}

// 模拟数据
const teachers: Teacher[] = [
  {
    id: '1',
    name: '张明',
    gender: '男',
    age: 35,
    subject: '数学',
    title: '高级教师',
    phone: '13800138001',
    email: 'zhangming@school.edu',
    status: '在职',
    classes: ['class-1', 'class-3']
  },
  {
    id: '2',
    name: '李华',
    gender: '女',
    age: 42,
    subject: '语文',
    title: '特级教师',
    phone: '13800138002',
    email: 'lihua@school.edu',
    status: '在职',
    classes: ['class-2']
  },
  {
    id: '3',
    name: '王强',
    gender: '男',
    age: 28,
    subject: '英语',
    title: '一级教师',
    phone: '13800138003',
    email: 'wangqiang@school.edu',
    status: '在职',
    classes: ['class-3']
  }
];

const students: Student[] = [
  {
    id: '1',
    name: '赵小明',
    gender: '男',
    age: 13,
    class: 'class-1',
    grade: 'grade-1',
    studentId: 'STU20240001',
    phone: '13800138011',
    guardian: '赵父',
    status: '在读'
  },
  {
    id: '2',
    name: '钱小红',
    gender: '女',
    age: 13,
    class: 'class-1',
    grade: 'grade-1',
    studentId: 'STU20240002',
    phone: '13800138012',
    guardian: '钱母',
    status: '在读'
  },
  {
    id: '3',
    name: '孙小刚',
    gender: '男',
    age: 14,
    class: 'class-2',
    grade: 'grade-2',
    studentId: 'STU20240003',
    phone: '13800138013',
    guardian: '孙父',
    status: '在读'
  }
];

const grades: Grade[] = [
  {
    id: 'grade-1',
    name: '初一',
    year: '2024',
    description: '初中一年级'
  },
  {
    id: 'grade-2',
    name: '初二',
    year: '2024',
    description: '初中二年级'
  }
];

const classes: Class[] = [
  {
    id: 'class-1',
    name: '初一(1)班',
    gradeId: 'grade-1',
    headTeacherId: '1',
    teacherIds: ['1', '2'],
    studentIds: ['1', '2'],
    roomNumber: '101',
    description: '初一第一班'
  },
  {
    id: 'class-2',
    name: '初二(1)班',
    gradeId: 'grade-2',
    headTeacherId: '2',
    teacherIds: ['2'],
    studentIds: ['3'],
    roomNumber: '201',
    description: '初二第一班'
  },
  {
    id: 'class-3',
    name: '初一(2)班',
    gradeId: 'grade-1',
    headTeacherId: '3',
    teacherIds: ['1', '3'],
    studentIds: [],
    roomNumber: '102',
    description: '初一第二班'
  }
];

// 保存数据函数
let teachersData = [...teachers];
let studentsData = [...students];
let gradesData = [...grades];
let classesData = [...classes];

export const educationHandlers = [
  // 教师相关API
  http.get('*/api/teachers', async () => {
    await delay(300);
    return HttpResponse.json(teachersData);
  }),

  http.get('*/api/teachers/:id', async ({ params }) => {
    await delay(300);
    const { id } = params;
    const teacher = teachersData.find(t => t.id === id);
    
    if (!teacher) {
      return HttpResponse.json({ message: '未找到该教师' }, { status: 404 });
    }
    
    return HttpResponse.json(teacher);
  }),

  http.post('*/api/teachers', async ({ request }) => {
    await delay(500);
    const newTeacher = await request.json() as Omit<Teacher, 'id'>;
    
    const teacher: Teacher = {
      id: uuidv4(),
      ...newTeacher,
      classes: newTeacher.classes || []
    };
    
    teachersData.push(teacher);
    return HttpResponse.json(teacher, { status: 201 });
  }),

  http.put('*/api/teachers/:id', async ({ request, params }) => {
    await delay(500);
    const { id } = params;
    const updates = await request.json() as Partial<Teacher>;
    
    const teacherIndex = teachersData.findIndex(t => t.id === id);
    if (teacherIndex === -1) {
      return HttpResponse.json({ message: '未找到该教师' }, { status: 404 });
    }
    
    teachersData[teacherIndex] = { ...teachersData[teacherIndex], ...updates };
    return HttpResponse.json(teachersData[teacherIndex]);
  }),

  http.delete('*/api/teachers/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    
    const teacherIndex = teachersData.findIndex(t => t.id === id);
    if (teacherIndex === -1) {
      return HttpResponse.json({ message: '未找到该教师' }, { status: 404 });
    }
    
    // 从班级中移除该教师
    classesData = classesData.map(c => ({
      ...c,
      teacherIds: c.teacherIds.filter(tId => tId !== id),
      headTeacherId: c.headTeacherId === id ? undefined : c.headTeacherId
    }));
    
    // 删除教师
    teachersData.splice(teacherIndex, 1);
    return HttpResponse.json({ success: true });
  }),

  // 学生相关API
  http.get('*/api/students', async ({ request }) => {
    await delay(300);
    // 支持按班级或年级过滤
    const url = new URL(request.url);
    const classId = url.searchParams.get('classId');
    const gradeId = url.searchParams.get('gradeId');
    
    let filteredStudents = [...studentsData];
    
    if (classId) {
      filteredStudents = filteredStudents.filter(s => s.class === classId);
    }
    
    if (gradeId) {
      filteredStudents = filteredStudents.filter(s => s.grade === gradeId);
    }
    
    return HttpResponse.json(filteredStudents);
  }),

  http.get('*/api/students/:id', async ({ params }) => {
    await delay(300);
    const { id } = params;
    const student = studentsData.find(s => s.id === id);
    
    if (!student) {
      return HttpResponse.json({ message: '未找到该学生' }, { status: 404 });
    }
    
    return HttpResponse.json(student);
  }),

  http.post('*/api/students', async ({ request }) => {
    await delay(500);
    const newStudent = await request.json() as Omit<Student, 'id'>;
    
    const student: Student = {
      id: uuidv4(),
      ...newStudent
    };
    
    studentsData.push(student);
    
    // 更新班级学生列表
    const classIndex = classesData.findIndex(c => c.id === student.class);
    if (classIndex !== -1) {
      classesData[classIndex].studentIds.push(student.id);
    }
    
    return HttpResponse.json(student, { status: 201 });
  }),

  http.put('*/api/students/:id', async ({ request, params }) => {
    await delay(500);
    const { id } = params;
    const updates = await request.json() as Partial<Student>;
    
    const studentIndex = studentsData.findIndex(s => s.id === id);
    if (studentIndex === -1) {
      return HttpResponse.json({ message: '未找到该学生' }, { status: 404 });
    }
    
    const oldClassId = studentsData[studentIndex].class;
    studentsData[studentIndex] = { ...studentsData[studentIndex], ...updates };
    
    // 如果班级发生变更，需要更新班级学生列表
    if (updates.class && updates.class !== oldClassId) {
      // 从旧班级移除
      const oldClassIndex = classesData.findIndex(c => c.id === oldClassId);
      if (oldClassIndex !== -1) {
        classesData[oldClassIndex].studentIds = classesData[oldClassIndex].studentIds.filter(sId => sId !== id);
      }
      
      // 添加到新班级
      const newClassIndex = classesData.findIndex(c => c.id === updates.class);
      if (newClassIndex !== -1) {
        classesData[newClassIndex].studentIds.push(id);
      }
    }
    
    return HttpResponse.json(studentsData[studentIndex]);
  }),

  http.delete('*/api/students/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    
    const studentIndex = studentsData.findIndex(s => s.id === id);
    if (studentIndex === -1) {
      return HttpResponse.json({ message: '未找到该学生' }, { status: 404 });
    }
    
    // 从班级中移除该学生
    const classId = studentsData[studentIndex].class;
    const classIndex = classesData.findIndex(c => c.id === classId);
    if (classIndex !== -1) {
      classesData[classIndex].studentIds = classesData[classIndex].studentIds.filter(sId => sId !== id);
    }
    
    // 删除学生
    studentsData.splice(studentIndex, 1);
    return HttpResponse.json({ success: true });
  }),

  // 年级相关API
  http.get('*/api/grades', async () => {
    await delay(300);
    return HttpResponse.json(gradesData);
  }),

  http.get('*/api/grades/:id', async ({ params }) => {
    await delay(300);
    const { id } = params;
    const grade = gradesData.find(g => g.id === id);
    
    if (!grade) {
      return HttpResponse.json({ message: '未找到该年级' }, { status: 404 });
    }
    
    return HttpResponse.json(grade);
  }),

  http.post('*/api/grades', async ({ request }) => {
    await delay(500);
    const newGrade = await request.json() as Omit<Grade, 'id'>;
    
    const grade: Grade = {
      id: uuidv4(),
      ...newGrade
    };
    
    gradesData.push(grade);
    return HttpResponse.json(grade, { status: 201 });
  }),

  http.put('*/api/grades/:id', async ({ request, params }) => {
    await delay(500);
    const { id } = params;
    const updates = await request.json() as Partial<Grade>;
    
    const gradeIndex = gradesData.findIndex(g => g.id === id);
    if (gradeIndex === -1) {
      return HttpResponse.json({ message: '未找到该年级' }, { status: 404 });
    }
    
    gradesData[gradeIndex] = { ...gradesData[gradeIndex], ...updates };
    return HttpResponse.json(gradesData[gradeIndex]);
  }),

  http.delete('*/api/grades/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    
    const gradeIndex = gradesData.findIndex(g => g.id === id);
    if (gradeIndex === -1) {
      return HttpResponse.json({ message: '未找到该年级' }, { status: 404 });
    }
    
    // 检查年级下是否有班级
    const hasClasses = classesData.some(c => c.gradeId === id);
    if (hasClasses) {
      return HttpResponse.json({ 
        message: '该年级下存在班级，无法删除',
        hasClasses: true 
      }, { status: 400 });
    }
    
    // 删除年级
    gradesData.splice(gradeIndex, 1);
    return HttpResponse.json({ success: true });
  }),

  // 班级相关API
  http.get('*/api/classes', async ({ request }) => {
    await delay(300);
    // 支持按年级过滤
    const url = new URL(request.url);
    const gradeId = url.searchParams.get('gradeId');
    
    let filteredClasses = [...classesData];
    
    if (gradeId) {
      filteredClasses = filteredClasses.filter(c => c.gradeId === gradeId);
    }
    
    return HttpResponse.json(filteredClasses);
  }),

  http.get('*/api/classes/:id', async ({ params }) => {
    await delay(300);
    const { id } = params;
    const classData = classesData.find(c => c.id === id);
    
    if (!classData) {
      return HttpResponse.json({ message: '未找到该班级' }, { status: 404 });
    }
    
    return HttpResponse.json(classData);
  }),

  http.post('*/api/classes', async ({ request }) => {
    await delay(500);
    const newClass = await request.json() as Omit<Class, 'id'>;
    
    const classData: Class = {
      id: uuidv4(),
      ...newClass,
      teacherIds: newClass.teacherIds || [],
      studentIds: newClass.studentIds || []
    };
    
    classesData.push(classData);
    
    // 更新教师的班级关联
    classData.teacherIds.forEach(teacherId => {
      const teacherIndex = teachersData.findIndex(t => t.id === teacherId);
      if (teacherIndex !== -1) {
        teachersData[teacherIndex].classes = [
          ...(teachersData[teacherIndex].classes || []),
          classData.id
        ];
      }
    });
    
    return HttpResponse.json(classData, { status: 201 });
  }),

  http.post('*/api/classes/batch', async ({ request }) => {
    await delay(800);
    const { gradeId, classCount, namePrefix = '班', startNumber = 1 } = await request.json() as { 
      gradeId: string;
      classCount: number;
      namePrefix?: string;
      startNumber?: number;
    };
    
    // 检查年级是否存在
    const grade = gradesData.find(g => g.id === gradeId);
    if (!grade) {
      return HttpResponse.json({ message: '未找到该年级' }, { status: 404 });
    }
    
    const newClasses: Class[] = [];
    
    // 批量创建班级
    for (let i = 0; i < classCount; i++) {
      const classNumber = startNumber + i;
      const newClass: Class = {
        id: uuidv4(),
        name: `${grade.name}(${classNumber})${namePrefix}`,
        gradeId,
        teacherIds: [],
        studentIds: [],
        roomNumber: `${classNumber}01`,
        description: `${grade.name}第${classNumber}${namePrefix}`
      };
      
      newClasses.push(newClass);
      classesData.push(newClass);
    }
    
    return HttpResponse.json({ 
      success: true,
      classes: newClasses
    }, { status: 201 });
  }),

  http.put('*/api/classes/:id', async ({ request, params }) => {
    await delay(500);
    const { id } = params;
    const updates = await request.json() as Partial<Class>;
    
    const classIndex = classesData.findIndex(c => c.id === id);
    if (classIndex === -1) {
      return HttpResponse.json({ message: '未找到该班级' }, { status: 404 });
    }
    
    const oldTeacherIds = classesData[classIndex].teacherIds;
    classesData[classIndex] = { ...classesData[classIndex], ...updates };
    
    // 如果教师列表有变更，需要更新教师的班级关联
    if (updates.teacherIds) {
      // 移除旧教师关联
      oldTeacherIds.forEach(teacherId => {
        const teacherIndex = teachersData.findIndex(t => t.id === teacherId);
        if (teacherIndex !== -1 && !updates.teacherIds?.includes(teacherId)) {
          teachersData[teacherIndex].classes = teachersData[teacherIndex].classes?.filter(c => c !== id);
        }
      });
      
      // 添加新教师关联
      updates.teacherIds.forEach(teacherId => {
        const teacherIndex = teachersData.findIndex(t => t.id === teacherId);
        if (teacherIndex !== -1 && !oldTeacherIds.includes(teacherId)) {
          teachersData[teacherIndex].classes = [
            ...(teachersData[teacherIndex].classes || []),
            id
          ];
        }
      });
    }
    
    return HttpResponse.json(classesData[classIndex]);
  }),

  http.delete('*/api/classes/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    
    const classIndex = classesData.findIndex(c => c.id === id);
    if (classIndex === -1) {
      return HttpResponse.json({ message: '未找到该班级' }, { status: 404 });
    }
    
    const classData = classesData[classIndex];
    
    // 检查班级下是否有学生
    if (classData.studentIds.length > 0) {
      return HttpResponse.json({ 
        message: '该班级下存在学生，无法删除',
        hasStudents: true 
      }, { status: 400 });
    }
    
    // 从教师关联中移除
    classData.teacherIds.forEach(teacherId => {
      const teacherIndex = teachersData.findIndex(t => t.id === teacherId);
      if (teacherIndex !== -1) {
        const classes = teachersData[teacherIndex].classes || [];
        teachersData[teacherIndex].classes = classes.filter(c => c !== id);
      }
    });
    
    // 删除班级
    classesData.splice(classIndex, 1);
    return HttpResponse.json({ success: true });
  }),

  // 班级-教师关联API
  http.post('*/api/classes/:classId/teachers', async ({ request, params }) => {
    await delay(500);
    const { classId } = params;
    const { teacherIds, isHeadTeacher } = await request.json() as { 
      teacherIds: string[];
      isHeadTeacher?: string; // 班主任ID，可选
    };
    
    const classIndex = classesData.findIndex(c => c.id === classId);
    if (classIndex === -1) {
      return HttpResponse.json({ message: '未找到该班级' }, { status: 404 });
    }
    
    // 更新班级教师列表，避免重复
    const existingTeacherIds = new Set(classesData[classIndex].teacherIds);
    teacherIds.forEach(id => existingTeacherIds.add(id));
    classesData[classIndex].teacherIds = Array.from(existingTeacherIds);
    
    // 设置班主任
    if (isHeadTeacher && teacherIds.includes(isHeadTeacher)) {
      classesData[classIndex].headTeacherId = isHeadTeacher;
    }
    
    // 更新教师关联
    teacherIds.forEach(teacherId => {
      const teacherIndex = teachersData.findIndex(t => t.id === teacherId);
      if (teacherIndex !== -1) {
        const teacherClasses = new Set(teachersData[teacherIndex].classes || []);
        teacherClasses.add(classId as string);
        teachersData[teacherIndex].classes = Array.from(teacherClasses);
      }
    });
    
    return HttpResponse.json(classesData[classIndex]);
  }),

  // 班级-学生关联API
  http.post('*/api/classes/:classId/students', async ({ request, params }) => {
    await delay(500);
    const { classId } = params;
    const { studentIds } = await request.json() as { studentIds: string[] };
    
    const classIndex = classesData.findIndex(c => c.id === classId);
    if (classIndex === -1) {
      return HttpResponse.json({ message: '未找到该班级' }, { status: 404 });
    }
    
    const classData = classesData[classIndex];
    const gradeId = classData.gradeId;
    
    // 获取当前班级的学生列表
    const existingStudentIds = new Set(classData.studentIds);
    
    // 添加新学生
    studentIds.forEach(id => {
      const studentIndex = studentsData.findIndex(s => s.id === id);
      if (studentIndex !== -1) {
        // 如果学生已在其他班级，先移除
        const oldClassId = studentsData[studentIndex].class;
        if (oldClassId && oldClassId !== classId) {
          const oldClassIndex = classesData.findIndex(c => c.id === oldClassId);
          if (oldClassIndex !== -1) {
            classesData[oldClassIndex].studentIds = classesData[oldClassIndex].studentIds.filter(sId => sId !== id);
          }
        }
        
        // 更新学生信息
        studentsData[studentIndex].class = classId as string;
        studentsData[studentIndex].grade = gradeId;
        
        // 添加到班级学生列表
        existingStudentIds.add(id);
      }
    });
    
    // 更新班级学生列表
    classesData[classIndex].studentIds = Array.from(existingStudentIds);
    
    return HttpResponse.json(classesData[classIndex]);
  }),
  
  // 查询班级详情（包含教师和学生信息）
  http.get('*/api/classes/:id/detail', async ({ params }) => {
    await delay(500);
    const { id } = params;
    
    const classData = classesData.find(c => c.id === id);
    if (!classData) {
      return HttpResponse.json({ message: '未找到该班级' }, { status: 404 });
    }
    
    // 获取年级信息
    const grade = gradesData.find(g => g.id === classData.gradeId);
    
    // 获取教师信息
    const teachers = teachersData.filter(t => classData.teacherIds.includes(t.id));
    
    // 获取班主任信息
    const headTeacher = classData.headTeacherId 
      ? teachersData.find(t => t.id === classData.headTeacherId)
      : null;
    
    // 获取学生信息
    const students = studentsData.filter(s => classData.studentIds.includes(s.id));
    
    return HttpResponse.json({
      ...classData,
      grade,
      teachers,
      headTeacher,
      students,
      studentCount: students.length
    });
  })
]; 