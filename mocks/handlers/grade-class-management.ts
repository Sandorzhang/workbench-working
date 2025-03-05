import { http, HttpResponse, delay } from 'msw';
import { db, Grade, Class } from '../db';
import { faker } from '@faker-js/faker/locale/zh_CN';

// 辅助函数 - 处理分页请求
const getPaginatedData = <T>(data: T[], page = 1, pageSize = 10) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    total: data.length,
    page,
    limit: pageSize,
    totalPages: Math.ceil(data.length / pageSize)
  };
};

// 辅助函数 - 处理搜索和筛选
const filterData = <T extends Record<string, any>>(
  data: T[],
  search: string,
  filters: Record<string, any> = {}
) => {
  let filteredData = [...data];
  
  // 处理搜索
  if (search && search.trim() !== '') {
    const lowerSearch = search.toLowerCase();
    filteredData = filteredData.filter(item => {
      // 简单实现: 检查对象中是否有任何字符串属性包含搜索词
      return Object.values(item).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(lowerSearch)
      );
    });
  }
  
  // 处理筛选条件
  if (filters && Object.keys(filters).length > 0) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filteredData = filteredData.filter(item => item[key] === value);
      }
    });
  }
  
  return filteredData;
};

// 生成模拟年级数据
function generateMockGrades() {
  if (db.grades.length > 0) return;
  
  const academicYears = ['2022-2023', '2023-2024', '2024-2025'];
  const gradeLevels = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三'];
  
  const mockGrades: Grade[] = [];
  
  academicYears.forEach(year => {
    gradeLevels.forEach(level => {
      mockGrades.push({
        id: faker.string.uuid(),
        gradeLevel: level,
        academicYear: year
      });
    });
  });
  
  db.grades = mockGrades;
}

// 生成模拟班级数据
function generateMockClasses() {
  if (db.classes.length > 0) return;
  
  // 确保有年级数据
  if (db.grades.length === 0) {
    generateMockGrades();
  }
  
  const mockClasses: Class[] = [];
  
  // 为每个年级创建多个班级
  db.grades.forEach(grade => {
    const numClasses = faker.number.int({ min: 3, max: 6 }); // 每个年级3-6个班
    for (let i = 1; i <= numClasses; i++) {
      mockClasses.push({
        id: faker.string.uuid(),
        name: `${i}班`,
        academicYear: grade.academicYear,
        gradeId: grade.id
      });
    }
  });
  
  db.classes = mockClasses;
}

// 确保年级和班级数据存在
generateMockGrades();
generateMockClasses();

// 获取年级列表
export const getGradesHandler = http.get('/api/grades', async ({ request }) => {
  await delay(300);
  
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') || '1');
  const pageSize = Number(url.searchParams.get('pageSize') || '10');
  const search = url.searchParams.get('search') || '';
  const academicYear = url.searchParams.get('academicYear') || '';
  
  // 筛选年级数据
  let filteredGrades = filterData(db.grades, search, { 
    academicYear: academicYear || undefined
  });
  
  // 对结果进行排序
  filteredGrades.sort((a, b) => a.academicYear.localeCompare(b.academicYear));
  
  const result = getPaginatedData(filteredGrades, page, pageSize);
  return HttpResponse.json(result);
});

// 根据ID获取年级
export const getGradeByIdHandler = http.get('/api/grades/:id', async ({ params }) => {
  await delay(300);
  
  const { id } = params;
  const grade = db.grades.find(g => g.id === id);
  
  if (!grade) {
    return new HttpResponse(
      JSON.stringify({ error: '年级不存在' }), 
      { status: 404 }
    );
  }
  
  return HttpResponse.json(grade);
});

// 创建年级
export const createGradeHandler = http.post('/api/grades', async ({ request }) => {
  await delay(300);
  
  const gradeData = await request.json() as Partial<Grade>;
  
  // 输入验证
  if (!gradeData.gradeLevel || !gradeData.academicYear) {
    return new HttpResponse(
      JSON.stringify({ error: '请提供所有必填字段' }), 
      { status: 400 }
    );
  }
  
  const newGrade: Grade = {
    id: faker.string.uuid(),
    gradeLevel: gradeData.gradeLevel,
    academicYear: gradeData.academicYear
  };
  
  db.grades.push(newGrade);
  
  return HttpResponse.json({ 
    message: '年级创建成功',
    grade: newGrade
  });
});

// 更新年级
export const updateGradeHandler = http.put('/api/grades/:id', async ({ params, request }) => {
  await delay(300);
  
  const { id } = params;
  const updateData = await request.json() as Partial<Grade>;
  
  const gradeIndex = db.grades.findIndex(g => g.id === id);
  
  if (gradeIndex === -1) {
    return new HttpResponse(
      JSON.stringify({ error: '年级不存在' }), 
      { status: 404 }
    );
  }
  
  const updatedGrade: Grade = {
    ...db.grades[gradeIndex],
    ...updateData as Partial<Grade>,
  };
  
  db.grades[gradeIndex] = updatedGrade;
  
  return HttpResponse.json({ 
    message: '年级更新成功',
    grade: updatedGrade
  });
});

// 删除年级
export const deleteGradeHandler = http.delete('/api/grades/:id', async ({ params }) => {
  await delay(300);
  
  const { id } = params;
  const gradeIndex = db.grades.findIndex(g => g.id === id);
  
  if (gradeIndex === -1) {
    return new HttpResponse(
      JSON.stringify({ error: '年级不存在' }), 
      { status: 404 }
    );
  }
  
  // 检查是否有班级引用了该年级
  const hasClasses = db.classes.some(c => c.gradeId === id);
  if (hasClasses) {
    return new HttpResponse(
      JSON.stringify({ error: '无法删除该年级，存在关联的班级' }), 
      { status: 400 }
    );
  }
  
  db.grades.splice(gradeIndex, 1);
  
  return HttpResponse.json({ 
    message: '年级删除成功'
  });
});

// 获取班级列表
export const getClassesHandler = http.get('/api/classes', async ({ request }) => {
  await delay(300);
  
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') || '1');
  const pageSize = Number(url.searchParams.get('pageSize') || '10');
  const search = url.searchParams.get('search') || '';
  const gradeId = url.searchParams.get('gradeId') || '';
  const academicYear = url.searchParams.get('academicYear') || '';
  
  // 筛选班级数据
  let filteredClasses = filterData(db.classes, search, { 
    gradeId: gradeId || undefined,
    academicYear: academicYear || undefined
  });
  
  // 扩展班级数据，添加年级名称
  const classesWithGrade = filteredClasses.map(cls => {
    const grade = db.grades.find(g => g.id === cls.gradeId);
    return {
      ...cls,
      gradeName: grade ? grade.gradeLevel : '未知年级'
    };
  });
  
  const result = getPaginatedData(classesWithGrade, page, pageSize);
  return HttpResponse.json(result);
});

// 根据ID获取班级
export const getClassByIdHandler = http.get('/api/classes/:id', async ({ params }) => {
  await delay(300);
  
  const { id } = params;
  const cls = db.classes.find(c => c.id === id);
  
  if (!cls) {
    return new HttpResponse(
      JSON.stringify({ error: '班级不存在' }), 
      { status: 404 }
    );
  }
  
  // 添加年级名称
  const grade = db.grades.find(g => g.id === cls.gradeId);
  const result = {
    ...cls,
    gradeName: grade ? grade.gradeLevel : '未知年级'
  };
  
  return HttpResponse.json(result);
});

// 创建班级
export const createClassHandler = http.post('/api/classes', async ({ request }) => {
  await delay(300);
  
  const classData = await request.json() as Partial<Class>;
  
  // 输入验证
  if (!classData.name || !classData.academicYear || !classData.gradeId) {
    return new HttpResponse(
      JSON.stringify({ error: '请提供所有必填字段' }), 
      { status: 400 }
    );
  }
  
  // 验证年级是否存在
  if (classData.gradeId) {
    const gradeExists = db.grades.some(g => g.id === classData.gradeId);
    if (!gradeExists) {
      return new HttpResponse(
        JSON.stringify({ error: '指定的年级不存在' }), 
        { status: 400 }
      );
    }
  }
  
  const newClass: Class = {
    id: faker.string.uuid(),
    name: classData.name,
    academicYear: classData.academicYear,
    gradeId: classData.gradeId
  };
  
  db.classes.push(newClass);
  
  return HttpResponse.json({ 
    message: '班级创建成功',
    class: newClass
  });
});

// 更新班级
export const updateClassHandler = http.put('/api/classes/:id', async ({ params, request }) => {
  await delay(300);
  
  const { id } = params;
  const updateData = await request.json() as Partial<Class>;
  
  const classIndex = db.classes.findIndex(c => c.id === id);
  
  if (classIndex === -1) {
    return new HttpResponse(
      JSON.stringify({ error: '班级不存在' }), 
      { status: 404 }
    );
  }
  
  // 验证年级是否存在
  if (updateData.gradeId) {
    const gradeExists = db.grades.some(g => g.id === updateData.gradeId);
    if (!gradeExists) {
      return new HttpResponse(
        JSON.stringify({ error: '指定的年级不存在' }), 
        { status: 400 }
      );
    }
  }
  
  const updatedClass: Class = {
    ...db.classes[classIndex],
    ...updateData as Partial<Class>,
  };
  
  db.classes[classIndex] = updatedClass;
  
  return HttpResponse.json({ 
    message: '班级更新成功',
    class: updatedClass
  });
});

// 删除班级
export const deleteClassHandler = http.delete('/api/classes/:id', async ({ params }) => {
  await delay(300);
  
  const { id } = params;
  const classIndex = db.classes.findIndex(c => c.id === id);
  
  if (classIndex === -1) {
    return new HttpResponse(
      JSON.stringify({ error: '班级不存在' }), 
      { status: 404 }
    );
  }
  
  // 检查是否有学生引用了该班级
  const hasStudents = db.students.some(s => s.classId === id);
  if (hasStudents) {
    return new HttpResponse(
      JSON.stringify({ error: '无法删除该班级，存在关联的学生' }), 
      { status: 400 }
    );
  }
  
  db.classes.splice(classIndex, 1);
  
  return HttpResponse.json({ 
    message: '班级删除成功'
  });
});

export const gradeManagementHandlers = [
  getGradesHandler,
  getGradeByIdHandler,
  createGradeHandler,
  updateGradeHandler,
  deleteGradeHandler
];

export const classManagementHandlers = [
  getClassesHandler,
  getClassByIdHandler,
  createClassHandler,
  updateClassHandler,
  deleteClassHandler
]; 