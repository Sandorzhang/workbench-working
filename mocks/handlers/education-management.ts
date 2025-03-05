import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { nanoid } from 'nanoid';

// 辅助函数 - 处理分页请求
const getPaginatedData = (data, page = 1, pageSize = 10) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    total: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize)
  };
};

// 辅助函数 - 处理搜索和筛选
const filterData = (data, search, filters = {}) => {
  let filteredData = [...data];
  
  // 处理搜索
  if (search && search.trim() !== '') {
    const searchTerm = search.toLowerCase();
    filteredData = filteredData.filter(item => 
      item.name?.toLowerCase().includes(searchTerm) || 
      item.studentNumber?.toLowerCase().includes(searchTerm) ||
      item.subject?.toLowerCase().includes(searchTerm)
    );
  }
  
  // 处理筛选条件
  if (filters && Object.keys(filters).length > 0) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filteredData = filteredData.filter(item => {
          if (Array.isArray(value)) {
            return value.includes(item[key]);
          } else {
            return item[key] === value;
          }
        });
      }
    });
  }
  
  return filteredData;
};

// ====================== 教师管理 API ======================
export const teacherManagementHandlers = [
  // 获取教师列表
  http.get('/api/teachers', async ({ request }) => {
    await delay(500);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    const subject = url.searchParams.get('subject') || '';
    
    let teachers = db.teacherManagement.getAll();
    
    // 处理筛选条件
    teachers = filterData(teachers, search, { 
      subject: subject || undefined 
    });
    
    // 处理分页
    const response = getPaginatedData(teachers, page, pageSize);
    
    return HttpResponse.json(response);
  }),
  
  // 获取单个教师详情
  http.get('/api/teachers/:id', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    const teacher = db.teacherManagement.findFirst({
      where: { id: { equals: id } }
    });
    
    if (!teacher) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(teacher);
  }),
  
  // 创建教师
  http.post('/api/teachers', async ({ request }) => {
    await delay(500);
    
    const newTeacher = await request.json();
    const createdTeacher = db.teacherManagement.create({
      id: nanoid(),
      ...newTeacher,
      externalAppIds: newTeacher.externalAppIds || []
    });
    
    return HttpResponse.json(createdTeacher, { status: 201 });
  }),
  
  // 更新教师
  http.put('/api/teachers/:id', async ({ params, request }) => {
    await delay(500);
    
    const { id } = params;
    const updateData = await request.json();
    
    const teacher = db.teacherManagement.findFirst({
      where: { id: { equals: id } }
    });
    
    if (!teacher) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const updatedTeacher = db.teacherManagement.update({
      where: { id: { equals: id } },
      data: updateData
    });
    
    return HttpResponse.json(updatedTeacher);
  }),
  
  // 删除教师
  http.delete('/api/teachers/:id', async ({ params }) => {
    await delay(500);
    
    const { id } = params;
    
    const teacher = db.teacherManagement.findFirst({
      where: { id: { equals: id } }
    });
    
    if (!teacher) {
      return new HttpResponse(null, { status: 404 });
    }
    
    db.teacherManagement.delete({
      where: { id: { equals: id } }
    });
    
    return new HttpResponse(null, { status: 204 });
  })
];

// ====================== 学生管理 API ======================
export const studentManagementHandlers = [
  // 获取学生列表
  http.get('/api/students', async ({ request }) => {
    await delay(500);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    const gradeId = url.searchParams.get('gradeId') || '';
    const classId = url.searchParams.get('classId') || '';
    const enrollmentYear = url.searchParams.get('enrollmentYear') || '';
    
    let students = db.studentManagement.getAll();
    
    // 处理筛选条件
    students = filterData(students, search, { 
      gradeId: gradeId || undefined,
      classId: classId || undefined,
      enrollmentYear: enrollmentYear ? parseInt(enrollmentYear) : undefined
    });
    
    // 处理分页
    const response = getPaginatedData(students, page, pageSize);
    
    return HttpResponse.json(response);
  }),
  
  // 获取单个学生详情
  http.get('/api/students/:id', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    const student = db.studentManagement.findFirst({
      where: { id: { equals: id } }
    });
    
    if (!student) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // 获取关联的班级和年级信息
    if (student.classId) {
      const classInfo = db.classManagement.findFirst({
        where: { id: { equals: student.classId } }
      });
      
      if (classInfo) {
        student.className = classInfo.name;
      }
    }
    
    if (student.gradeId) {
      const gradeInfo = db.gradeManagement.findFirst({
        where: { id: { equals: student.gradeId } }
      });
      
      if (gradeInfo) {
        student.gradeName = gradeInfo.gradeLevel;
      }
    }
    
    return HttpResponse.json(student);
  }),
  
  // 创建学生
  http.post('/api/students', async ({ request }) => {
    await delay(500);
    
    const newStudent = await request.json();
    const createdStudent = db.studentManagement.create({
      id: nanoid(),
      ...newStudent,
      externalAppIds: newStudent.externalAppIds || []
    });
    
    return HttpResponse.json(createdStudent, { status: 201 });
  }),
  
  // 更新学生
  http.put('/api/students/:id', async ({ params, request }) => {
    await delay(500);
    
    const { id } = params;
    const updateData = await request.json();
    
    const student = db.studentManagement.findFirst({
      where: { id: { equals: id } }
    });
    
    if (!student) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const updatedStudent = db.studentManagement.update({
      where: { id: { equals: id } },
      data: updateData
    });
    
    return HttpResponse.json(updatedStudent);
  }),
  
  // 删除学生
  http.delete('/api/students/:id', async ({ params }) => {
    await delay(500);
    
    const { id } = params;
    
    const student = db.studentManagement.findFirst({
      where: { id: { equals: id } }
    });
    
    if (!student) {
      return new HttpResponse(null, { status: 404 });
    }
    
    db.studentManagement.delete({
      where: { id: { equals: id } }
    });
    
    return new HttpResponse(null, { status: 204 });
  })
];

// ====================== 年级管理 API ======================
export const gradeManagementHandlers = [
  // 获取年级列表
  http.get('/api/grades', async ({ request }) => {
    await delay(500);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    const academicYear = url.searchParams.get('academicYear') || '';
    
    let grades = db.gradeManagement.getAll();
    
    // 处理筛选条件
    grades = filterData(grades, search, { 
      academicYear: academicYear || undefined
    });
    
    // 处理分页
    const response = getPaginatedData(grades, page, pageSize);
    
    return HttpResponse.json(response);
  }),
  
  // 获取所有年级（不分页，用于下拉选择）
  http.get('/api/grades/all', async () => {
    await delay(300);
    
    const grades = db.gradeManagement.getAll();
    
    return HttpResponse.json(grades);
  }),
  
  // 获取单个年级详情
  http.get('/api/grades/:id', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    const grade = db.gradeManagement.findFirst({
      where: { id: { equals: id } }
    });
    
    if (!grade) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(grade);
  }),
  
  // 创建年级
  http.post('/api/grades', async ({ request }) => {
    await delay(500);
    
    const newGrade = await request.json();
    const createdGrade = db.gradeManagement.create({
      id: nanoid(),
      ...newGrade
    });
    
    return HttpResponse.json(createdGrade, { status: 201 });
  }),
  
  // 更新年级
  http.put('/api/grades/:id', async ({ params, request }) => {
    await delay(500);
    
    const { id } = params;
    const updateData = await request.json();
    
    const grade = db.gradeManagement.findFirst({
      where: { id: { equals: id } }
    });
    
    if (!grade) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const updatedGrade = db.gradeManagement.update({
      where: { id: { equals: id } },
      data: updateData
    });
    
    return HttpResponse.json(updatedGrade);
  }),
  
  // 删除年级
  http.delete('/api/grades/:id', async ({ params }) => {
    await delay(500);
    
    const { id } = params;
    
    const grade = db.gradeManagement.findFirst({
      where: { id: { equals: id } }
    });
    
    if (!grade) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // 检查是否有班级或学生与此年级关联
    const relatedClasses = db.classManagement.findMany({
      where: { gradeId: { equals: id } }
    });
    
    const relatedStudents = db.studentManagement.findMany({
      where: { gradeId: { equals: id } }
    });
    
    if (relatedClasses.length > 0 || relatedStudents.length > 0) {
      return new HttpResponse(
        JSON.stringify({ error: '无法删除年级，有关联的班级或学生' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    db.gradeManagement.delete({
      where: { id: { equals: id } }
    });
    
    return new HttpResponse(null, { status: 204 });
  })
];

// ====================== 班级管理 API ======================
export const classManagementHandlers = [
  // 获取班级列表
  http.get('/api/classes', async ({ request }) => {
    await delay(500);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    const gradeId = url.searchParams.get('gradeId') || '';
    const academicYear = url.searchParams.get('academicYear') || '';
    
    let classes = db.classManagement.getAll();
    
    // 处理筛选条件
    classes = filterData(classes, search, { 
      gradeId: gradeId || undefined,
      academicYear: academicYear || undefined
    });
    
    // 扩展数据，添加年级信息
    classes = classes.map(classItem => {
      let result = { ...classItem };
      
      if (classItem.gradeId) {
        const grade = db.gradeManagement.findFirst({
          where: { id: { equals: classItem.gradeId } }
        });
        
        if (grade) {
          result.gradeName = grade.gradeLevel;
        }
      }
      
      return result;
    });
    
    // 处理分页
    const response = getPaginatedData(classes, page, pageSize);
    
    return HttpResponse.json(response);
  }),
  
  // 获取所有班级（不分页，用于下拉选择）
  http.get('/api/classes/all', async ({ request }) => {
    await delay(300);
    
    const url = new URL(request.url);
    const gradeId = url.searchParams.get('gradeId') || '';
    
    let classes = db.classManagement.getAll();
    
    if (gradeId) {
      classes = classes.filter(classItem => classItem.gradeId === gradeId);
    }
    
    // 添加年级信息
    classes = classes.map(classItem => {
      let result = { ...classItem };
      
      if (classItem.gradeId) {
        const grade = db.gradeManagement.findFirst({
          where: { id: { equals: classItem.gradeId } }
        });
        
        if (grade) {
          result.gradeName = grade.gradeLevel;
        }
      }
      
      return result;
    });
    
    return HttpResponse.json(classes);
  }),
  
  // 获取单个班级详情
  http.get('/api/classes/:id', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    const classItem = db.classManagement.findFirst({
      where: { id: { equals: id } }
    });
    
    if (!classItem) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // 添加年级信息
    let result = { ...classItem };
    
    if (classItem.gradeId) {
      const grade = db.gradeManagement.findFirst({
        where: { id: { equals: classItem.gradeId } }
      });
      
      if (grade) {
        result.gradeName = grade.gradeLevel;
      }
    }
    
    return HttpResponse.json(result);
  }),
  
  // 创建班级
  http.post('/api/classes', async ({ request }) => {
    await delay(500);
    
    const newClass = await request.json();
    const createdClass = db.classManagement.create({
      id: nanoid(),
      ...newClass
    });
    
    return HttpResponse.json(createdClass, { status: 201 });
  }),
  
  // 更新班级
  http.put('/api/classes/:id', async ({ params, request }) => {
    await delay(500);
    
    const { id } = params;
    const updateData = await request.json();
    
    const classItem = db.classManagement.findFirst({
      where: { id: { equals: id } }
    });
    
    if (!classItem) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const updatedClass = db.classManagement.update({
      where: { id: { equals: id } },
      data: updateData
    });
    
    return HttpResponse.json(updatedClass);
  }),
  
  // 删除班级
  http.delete('/api/classes/:id', async ({ params }) => {
    await delay(500);
    
    const { id } = params;
    
    const classItem = db.classManagement.findFirst({
      where: { id: { equals: id } }
    });
    
    if (!classItem) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // 检查是否有学生与此班级关联
    const relatedStudents = db.studentManagement.findMany({
      where: { classId: { equals: id } }
    });
    
    if (relatedStudents.length > 0) {
      return new HttpResponse(
        JSON.stringify({ error: '无法删除班级，有关联的学生' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    db.classManagement.delete({
      where: { id: { equals: id } }
    });
    
    return new HttpResponse(null, { status: 204 });
  })
];

// 合并所有处理程序
export const educationManagementHandlers = [
  ...teacherManagementHandlers,
  ...studentManagementHandlers,
  ...gradeManagementHandlers,
  ...classManagementHandlers
];