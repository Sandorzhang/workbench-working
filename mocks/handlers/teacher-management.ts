import { http, HttpResponse, delay } from 'msw';
import { db, Teacher } from '../db';
import { faker } from '@faker-js/faker/locale/zh_CN';

// 生成模拟教师数据
function generateMockTeachers(count = 50) {
  const mockTeachers = [];
  
  for (let i = 0; i < count; i++) {
    mockTeachers.push({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      gender: faker.helpers.arrayElement(['male', 'female']),
      birthDate: faker.date.birthdate({ min: 25, max: 60, mode: 'age' }).toISOString().split('T')[0],
      subject: faker.helpers.arrayElement([
        '语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '体育', '音乐', '美术', '信息技术'
      ]),
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
  
  return mockTeachers;
}

// 确保教师数据存在
if (!db.teachers || db.teachers.length === 0) {
  db.teachers = generateMockTeachers();
}

// 获取教师列表，支持分页和搜索
export const getTeachersHandler = http.get('/api/teachers', async ({ request }) => {
  await delay();
  
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') || '1');
  const search = url.searchParams.get('search') || '';
  const limit = 10;
  
  let filteredTeachers = [...db.teachers];
  
  // 执行搜索
  if (search) {
    const lowerSearch = search.toLowerCase();
    filteredTeachers = filteredTeachers.filter(teacher => 
      teacher.name.toLowerCase().includes(lowerSearch) ||
      teacher.subject.toLowerCase().includes(lowerSearch)
    );
  }
  
  // 计算分页数据
  const totalItems = filteredTeachers.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);
  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);
  
  return HttpResponse.json({
    data: paginatedTeachers,
    total: totalItems,
    page,
    limit,
    totalPages
  });
});

// 根据ID获取单个教师
export const getTeacherByIdHandler = http.get('/api/teachers/:id', async ({ params }) => {
  await delay();
  
  const { id } = params;
  const teacher = db.teachers.find(t => t.id === id);
  
  if (!teacher) {
    return new HttpResponse(null, { status: 404 });
  }
  
  return HttpResponse.json(teacher);
});

// 创建教师
export const createTeacherHandler = http.post('/api/teachers', async ({ request }) => {
  await delay();
  
  const teacherData = await request.json() as Partial<Teacher>;
  
  // 输入验证（简单示例）
  if (!teacherData.name || !teacherData.gender || !teacherData.birthDate || !teacherData.subject) {
    return new HttpResponse(
      JSON.stringify({ error: '请提供所有必填字段' }), 
      { status: 400 }
    );
  }
  
  const newTeacher: Teacher = {
    id: faker.string.uuid(),
    name: teacherData.name,
    gender: teacherData.gender as 'male' | 'female',
    birthDate: teacherData.birthDate,
    subject: teacherData.subject,
    externalAppIds: teacherData.externalAppIds || [],
    avatar: teacherData.avatar,
  };
  
  db.teachers.unshift(newTeacher);
  
  return HttpResponse.json({ 
    message: '教师创建成功',
    teacher: newTeacher
  });
});

// 更新教师
export const updateTeacherHandler = http.put('/api/teachers/:id', async ({ params, request }) => {
  await delay();
  
  const { id } = params;
  const updateData = await request.json() as Partial<Teacher>;
  
  const teacherIndex = db.teachers.findIndex(t => t.id === id);
  
  if (teacherIndex === -1) {
    return new HttpResponse(
      JSON.stringify({ error: '教师不存在' }), 
      { status: 404 }
    );
  }
  
  const updatedTeacher: Teacher = {
    ...db.teachers[teacherIndex],
    ...updateData as Partial<Teacher>,
  };
  
  db.teachers[teacherIndex] = updatedTeacher;
  
  return HttpResponse.json({ 
    message: '教师更新成功',
    teacher: updatedTeacher
  });
});

// 删除教师
export const deleteTeacherHandler = http.delete('/api/teachers/:id', async ({ params }) => {
  await delay();
  
  const { id } = params;
  const teacherIndex = db.teachers.findIndex(t => t.id === id);
  
  if (teacherIndex === -1) {
    return new HttpResponse(
      JSON.stringify({ error: '教师不存在' }), 
      { status: 404 }
    );
  }
  
  db.teachers.splice(teacherIndex, 1);
  
  return HttpResponse.json({ 
    message: '教师删除成功'
  });
});

export const teacherManagementHandlers = [
  getTeachersHandler,
  getTeacherByIdHandler,
  createTeacherHandler,
  updateTeacherHandler,
  deleteTeacherHandler
]; 