import { http, HttpResponse } from 'msw'
import { db } from '../db'

// 定义考试数据类型
interface ExamData {
  name?: string
  subject?: string
  grade?: string
  semester?: string
  startTime?: string
  endTime?: string
  status?: string
}

// 初始化考试数据库，如果还没有数据
const initExams = () => {
  if (db.exam.count() === 0) {
    // 添加示例数据
    db.exam.create({
      id: 'E-00300008',
      name: '2024-06-12四年级下学期数学期末',
      subject: '数学',
      grade: '四年级',
      semester: '第二学期',
      startTime: '2024-06-12 09:00:00',
      endTime: '2024-06-12 11:00:00',
      status: 'published',
    })
    
    db.exam.create({
      id: 'E-00300009',
      name: '2024-06-07四年级下学期数学练习',
      subject: '数学',
      grade: '四年级',
      semester: '第二学期',
      startTime: '2024-06-07 09:00:00',
      endTime: '2024-06-07 11:00:00',
      status: 'published',
    })
    
    db.exam.create({
      id: 'E-00300012',
      name: '2024-03-04四年级下学期数学练习',
      subject: '数学',
      grade: '四年级',
      semester: '第二学期',
      startTime: '2024-03-04 09:00:00',
      endTime: '2024-03-04 11:00:00',
      status: 'published',
    })
    
    db.exam.create({
      id: 'E-00300013',
      name: '2024-05-20四年级下学期数学练习',
      subject: '数学',
      grade: '四年级',
      semester: '第二学期',
      startTime: '2024-05-20 09:00:00',
      endTime: '2024-05-20 11:00:00',
      status: 'published',
    })
    
    db.exam.create({
      id: 'E-00300014',
      name: '2024-04-18四年级下学期数学练习',
      subject: '数学',
      grade: '四年级',
      semester: '第二学期',
      startTime: '2024-04-18 09:00:00',
      endTime: '2024-04-18 11:00:00',
      status: 'published',
    })
  }
}

// 确保在导出处理程序前初始化数据
initExams();

export const examHandlers = [
  // 获取所有考试
  http.get('/api/exams', () => {
    const exams = db.exam.getAll()
    return HttpResponse.json({
      exams,
    })
  }),

  // 获取单个考试详情
  http.get('/api/exams/:id', ({ params }) => {
    const id = typeof params.id === 'string' ? params.id : String(params.id)
    const exam = db.exam.findFirst({
      where: { id: { equals: id } }
    })
    
    if (!exam) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Exam not found',
      })
    }
    
    return HttpResponse.json(exam)
  }),

  // 创建新考试
  http.post('/api/exams', async ({ request }) => {
    const requestData = await request.json() as ExamData
    
    // 生成新的考试ID
    const newId = `E-${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`
    
    // 确保数据的类型正确
    const newExam = db.exam.create({
      id: newId,
      name: String(requestData.name || ''),
      subject: String(requestData.subject || ''),
      grade: String(requestData.grade || ''),
      semester: String(requestData.semester || ''),
      startTime: String(requestData.startTime || ''),
      endTime: String(requestData.endTime || ''),
      status: String(requestData.status || 'draft'),
    })
    
    return HttpResponse.json(newExam, { status: 201 })
  }),

  // 更新考试
  http.put('/api/exams/:id', async ({ params, request }) => {
    const id = typeof params.id === 'string' ? params.id : String(params.id)
    const exam = db.exam.findFirst({
      where: { id: { equals: id } }
    })
    
    if (!exam) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Exam not found',
      })
    }
    
    const requestData = await request.json() as ExamData
    
    // 更新考试，确保类型正确
    const updatedExam = db.exam.update({
      where: { id: { equals: id } },
      data: {
        name: requestData.name !== undefined ? String(requestData.name) : undefined,
        subject: requestData.subject !== undefined ? String(requestData.subject) : undefined,
        grade: requestData.grade !== undefined ? String(requestData.grade) : undefined,
        semester: requestData.semester !== undefined ? String(requestData.semester) : undefined,
        startTime: requestData.startTime !== undefined ? String(requestData.startTime) : undefined,
        endTime: requestData.endTime !== undefined ? String(requestData.endTime) : undefined,
        status: requestData.status !== undefined ? String(requestData.status) : undefined,
      }
    })
    
    return HttpResponse.json(updatedExam)
  }),

  // 删除考试
  http.delete('/api/exams/:id', ({ params }) => {
    const id = typeof params.id === 'string' ? params.id : String(params.id)
    const exam = db.exam.findFirst({
      where: { id: { equals: id } }
    })
    
    if (!exam) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Exam not found',
      })
    }
    
    db.exam.delete({
      where: { id: { equals: id } }
    })
    
    return new HttpResponse(null, { status: 204 })
  }),
] 