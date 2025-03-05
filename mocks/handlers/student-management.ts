import { http, HttpResponse, delay } from 'msw';
import { db, Student } from '../db';
import { faker } from '@faker-js/faker/locale/zh_CN';

// 生成模拟学生数据
function generateMockStudents(count = 100) {
  // 获取年级ID，如果没有则创建一些默认年级
  let gradeIds = db.grades.map(grade => grade.id);
  if (gradeIds.length === 0) {
    for (let i = 0; i < 6; i++) {
      const id = faker.string.uuid();
      db.grades.push({
        id,
        gradeLevel: `${i + 1}年级`,
        academicYear: '2023-2024'
      });
      gradeIds.push(id);
    }
  }

  // 获取班级ID，如果没有则创建一些默认班级
  let classIds = db.classes.map(cls => cls.id);
  if (classIds.length === 0) {
    for (let i = 0; i < gradeIds.length; i++) {
      for (let j = 1; j <= 5; j++) {
        const id = faker.string.uuid();
        db.classes.push({
          id,
          name: `${i + 1}年级${j}班`,
          academicYear: '2023-2024',
          gradeId: gradeIds[i]
        });
        classIds.push(id);
      }
    }
  }

  // 生成学生数据
  const mockStudents = [];
  
  for (let i = 0; i < count; i++) {
    const randomClassIndex = faker.number.int({ min: 0, max: classIds.length - 1 });
    const selectedClass = db.classes.find(cls => cls.id === classIds[randomClassIndex]);
    const selectedGradeId = selectedClass ? selectedClass.gradeId : gradeIds[0];

    mockStudents.push({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      gender: faker.helpers.arrayElement(['male', 'female']),
      enrollmentYear: 2023 - faker.number.int({ min: 0, max: 5 }),
      birthDate: faker.date.birthdate({ min: 6, max: 18, mode: 'age' }).toISOString().split('T')[0],
      studentNumber: faker.string.numeric(10),
      classId: classIds[randomClassIndex],
      gradeId: selectedGradeId,
      externalAppIds: faker.helpers.arrayElements(
        [
          { appId: 'app1', appName: '知了课堂', externalId: faker.string.alphanumeric(8) },
          { appId: 'app2', appName: '智慧学习', externalId: faker.string.alphanumeric(8) },
          { appId: 'app3', appName: '云校', externalId: faker.string.alphanumeric(8) }
        ],
        faker.number.int({ min: 0, max: 3 })
      )
    });
  }
  
  return mockStudents;
}

// 确保学生数据存在
if (!db.students || db.students.length === 0) {
  db.students = generateMockStudents();
}

// 获取学生列表，支持分页和搜索
export const getStudentsHandler = http.get('/api/students', async ({ request }) => {
  await delay(500);
  
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') || '1');
  const pageSize = Number(url.searchParams.get('pageSize') || '10');
  const search = url.searchParams.get('search') || '';
  const gradeId = url.searchParams.get('gradeId') || '';
  const classId = url.searchParams.get('classId') || '';
  
  let filteredStudents = [...db.students];
  
  // 执行搜索
  if (search) {
    const lowerSearch = search.toLowerCase();
    filteredStudents = filteredStudents.filter(student => 
      student.name.toLowerCase().includes(lowerSearch) ||
      student.studentNumber.includes(search)
    );
  }
  
  // 按年级筛选
  if (gradeId) {
    filteredStudents = filteredStudents.filter(student => student.gradeId === gradeId);
  }
  
  // 按班级筛选
  if (classId) {
    filteredStudents = filteredStudents.filter(student => student.classId === classId);
  }
  
  // 计算分页数据
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
  
  return HttpResponse.json({
    data: paginatedStudents,
    total: totalItems,
    page,
    limit: pageSize,
    totalPages
  });
});

// 创建学生
export const createStudentHandler = http.post('/api/students', async ({ request }) => {
  await delay(500);
  
  const studentData = await request.json() as Partial<Student>;
  
  // 输入验证
  if (!studentData.name || !studentData.gender || !studentData.birthDate || 
      !studentData.enrollmentYear || !studentData.studentNumber || 
      !studentData.classId || !studentData.gradeId) {
    return new HttpResponse(
      JSON.stringify({ error: '请提供所有必填字段' }), 
      { status: 400 }
    );
  }
  
  // 验证班级和年级是否存在
  const classExists = db.classes.some(c => c.id === studentData.classId);
  const gradeExists = db.grades.some(g => g.id === studentData.gradeId);
  
  if (!classExists) {
    return new HttpResponse(
      JSON.stringify({ error: '指定的班级不存在' }), 
      { status: 400 }
    );
  }
  
  if (!gradeExists) {
    return new HttpResponse(
      JSON.stringify({ error: '指定的年级不存在' }), 
      { status: 400 }
    );
  }
  
  const newStudent: Student = {
    id: faker.string.uuid(),
    name: studentData.name,
    gender: studentData.gender as 'male' | 'female',
    enrollmentYear: Number(studentData.enrollmentYear),
    birthDate: studentData.birthDate,
    studentNumber: studentData.studentNumber,
    classId: studentData.classId,
    gradeId: studentData.gradeId,
    externalAppIds: studentData.externalAppIds || [],
    avatar: studentData.avatar,
  };
  
  db.students.unshift(newStudent);
  
  return HttpResponse.json({ 
    message: '学生创建成功',
    student: newStudent
  });
});

// 更新学生
export const updateStudentHandler = http.put('/api/students/:id', async ({ params, request }) => {
  await delay(500);
  
  const { id } = params;
  const updateData = await request.json() as Partial<Student>;
  
  const studentIndex = db.students.findIndex(s => s.id === id);
  
  if (studentIndex === -1) {
    return new HttpResponse(
      JSON.stringify({ error: '学生不存在' }), 
      { status: 404 }
    );
  }
  
  // 验证班级和年级是否存在（如果提供）
  if (updateData.classId) {
    const classExists = db.classes.some(c => c.id === updateData.classId);
    if (!classExists) {
      return new HttpResponse(
        JSON.stringify({ error: '指定的班级不存在' }), 
        { status: 400 }
      );
    }
  }
  
  if (updateData.gradeId) {
    const gradeExists = db.grades.some(g => g.id === updateData.gradeId);
    if (!gradeExists) {
      return new HttpResponse(
        JSON.stringify({ error: '指定的年级不存在' }), 
        { status: 400 }
      );
    }
  }
  
  const updatedStudent: Student = {
    ...db.students[studentIndex],
    ...updateData as Partial<Student>,
  };
  
  db.students[studentIndex] = updatedStudent;
  
  return HttpResponse.json({ 
    message: '学生更新成功',
    student: updatedStudent
  });
});

// 删除学生
export const deleteStudentHandler = http.delete('/api/students/:id', async ({ params }) => {
  await delay(500);
  
  const { id } = params;
  const studentIndex = db.students.findIndex(s => s.id === id);
  
  if (studentIndex === -1) {
    return new HttpResponse(
      JSON.stringify({ error: '学生不存在' }), 
      { status: 404 }
    );
  }
  
  db.students.splice(studentIndex, 1);
  
  return HttpResponse.json({ 
    message: '学生删除成功'
  });
});

export const studentManagementHandlers = [
  getStudentsHandler,
  createStudentHandler,
  updateStudentHandler,
  deleteStudentHandler
]; 