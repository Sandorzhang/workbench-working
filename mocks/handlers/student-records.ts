import { http, HttpResponse, delay } from 'msw';
import { v4 as uuidv4 } from 'uuid';
import { StudentRecord, RecordType, RecordStatus } from '@/features/mentor-system/types';

// 模拟数据
let studentRecords: StudentRecord[] = [
  // 添加一些初始测试数据
  {
    id: "test-record-1",
    studentId: "1", // 默认学生ID
    type: "note",
    status: "notStarted",
    title: "初始测试记录1",
    content: "这是一条系统自动生成的测试记录，用于验证记录显示功能",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "系统",
  },
  {
    id: "test-record-2",
    studentId: "1", // 默认学生ID
    type: "intervention",
    status: "inProgress",
    title: "初始测试记录2",
    content: "这是另一条系统自动生成的测试记录，用于验证不同类型和状态的记录显示",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 昨天
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: "系统",
  }
];

// 从teacher.ts导入学生数据
// 这里我们为了简化，假设学生ID为"1"是默认学生
const defaultStudentId = "1";

// 获取学生记录
export const getStudentRecordsHandler = http.get('/api/student/:studentId/records', async ({ params }) => {
  await delay(500);
  
  const { studentId } = params;
  console.log(">>> [MSW拦截] 获取学生记录，学生ID:", studentId);
  
  const records = studentRecords.filter(record => record.studentId === studentId);
  console.log(">>> [MSW拦截] 获取到记录数量:", records.length);
  console.log(">>> [MSW拦截] 过滤后的记录:", JSON.stringify(records, null, 2));
  
  return HttpResponse.json(records);
});

// 添加学生记录的请求体类型
interface AddRecordRequest {
  studentId: string;
  type: RecordType;
  status: RecordStatus;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
  metadata?: Record<string, any>;
}

// 添加学生记录 - 原始端点（通配符匹配）
export const addStudentRecordHandler = http.post('/api/student/records', async ({ request }) => {
  await delay(700);
  
  const record = await request.json() as AddRecordRequest;
  console.log(">>> [MSW拦截] 原始端点添加记录:", JSON.stringify(record, null, 2));
  
  const newRecord: StudentRecord = {
    id: uuidv4(),
    studentId: record.studentId,
    type: record.type,
    status: record.status,
    title: record.title,
    content: record.content,
    createdAt: record.createdAt,
    updatedAt: record.createdAt, 
    createdBy: record.createdBy || "当前用户", // 实际实现中应该从令牌或会话中获取
    metadata: record.metadata
  };
  
  studentRecords.push(newRecord);
  console.log(">>> [MSW拦截] 原始端点添加记录成功，当前记录总数:", studentRecords.length);
  
  return HttpResponse.json(newRecord, { status: 201 });
});

// 添加学生记录 - 新端点，支持在路径中指定学生ID（通配符匹配）
export const addStudentRecordByIdHandler = http.post('/api/student/:studentId/records', async ({ params, request }) => {
  await delay(700);
  
  const studentId = params.studentId as string;
  console.log(">>> [MSW拦截] 添加记录，学生ID:", studentId);
  
  const record = await request.json() as Omit<AddRecordRequest, 'studentId'>;
  console.log(">>> [MSW拦截] 添加记录数据:", JSON.stringify(record, null, 2));
  
  const newRecord: StudentRecord = {
    id: uuidv4(),
    studentId: studentId,
    type: record.type,
    status: record.status,
    title: record.title,
    content: record.content,
    createdAt: record.createdAt,
    updatedAt: record.createdAt, 
    createdBy: record.createdBy || "当前用户",
    metadata: record.metadata
  };
  
  studentRecords.push(newRecord);
  console.log(">>> [MSW拦截] 添加记录成功，当前记录总数:", studentRecords.length);
  console.log(">>> [MSW拦截] 当前所有记录:", JSON.stringify(studentRecords, null, 2));
  
  return HttpResponse.json(newRecord, { status: 201 });
});

// 更新学生记录的请求体类型
interface UpdateRecordRequest {
  status?: RecordStatus;
  title?: string;
  content?: string;
  metadata?: Record<string, any>;
}

// 更新学生记录
export const updateStudentRecordHandler = http.put('/api/student/records/:recordId', async ({ params, request }) => {
  await delay(600);
  
  const { recordId } = params;
  const updatedData = await request.json() as UpdateRecordRequest;
  
  const index = studentRecords.findIndex(record => record.id === recordId);
  
  if (index === -1) {
    return new HttpResponse(null, { status: 404 });
  }
  
  studentRecords[index] = {
    ...studentRecords[index],
    ...(updatedData.status && { status: updatedData.status }),
    ...(updatedData.title && { title: updatedData.title }),
    ...(updatedData.content && { content: updatedData.content }),
    ...(updatedData.metadata && { metadata: updatedData.metadata }),
    updatedAt: new Date().toISOString()
  };
  
  return HttpResponse.json(studentRecords[index]);
});

// 删除学生记录
export const deleteStudentRecordHandler = http.delete('/api/student/records/:recordId', async ({ params }) => {
  await delay(500);
  
  const { recordId } = params;
  
  const index = studentRecords.findIndex(record => record.id === recordId);
  
  if (index === -1) {
    return new HttpResponse(null, { status: 404 });
  }
  
  studentRecords = studentRecords.filter(record => record.id !== recordId);
  
  return new HttpResponse(null, { status: 204 });
});

// 添加获取默认学生的处理程序
export const getDefaultStudentHandler = http.get('/api/teacher/default-student', () => {
  return HttpResponse.json({
    id: defaultStudentId
  });
}); 