import { http, HttpResponse, delay } from 'msw'
import { v4 as uuidv4 } from 'uuid'
import { Question, LearningObjective } from '@/types/question'

// 问题数据存储
export let questions: Question[] = []

// 学业目标数据
let learningObjectives: LearningObjective[] = [
  {
    id: '1',
    code: 'LO-MATH-01',
    description: '能够理解和运用基本的数学概念',
    category: '数学'
  },
  {
    id: '2',
    code: 'LO-MATH-02',
    description: '能够解决简单的代数方程',
    category: '数学'
  },
  {
    id: '3',
    code: 'LO-MATH-03',
    description: '能够分析和解释数学问题',
    category: '数学'
  },
  {
    id: '4',
    code: 'LO-ENG-01',
    description: '能够理解英语阅读材料的主要内容',
    category: '英语'
  },
  {
    id: '5',
    code: 'LO-ENG-02',
    description: '能够用英语进行基本的书面表达',
    category: '英语'
  },
  {
    id: '6',
    code: 'LO-SCI-01',
    description: '能够理解基本的科学原理',
    category: '科学'
  },
  {
    id: '7',
    code: 'LO-SCI-02',
    description: '能够进行简单的科学实验并解释结果',
    category: '科学'
  },
  {
    id: '8',
    code: 'LO-HIST-01',
    description: '能够识别和描述重要的历史事件',
    category: '历史'
  },
  {
    id: '9',
    code: 'LO-PHYS-01',
    description: '理解牛顿运动定律并能应用于简单力学问题',
    category: '物理'
  },
  {
    id: '10',
    code: 'LO-CHEM-01',
    description: '掌握元素周期表的基本结构和性质',
    category: '化学'
  },
  {
    id: '11',
    code: 'LO-CHIN-01',
    description: '能够理解和分析中国古代文学作品',
    category: '语文'
  },
  {
    id: '12',
    code: 'LO-CHIN-02',
    description: '能够进行规范的书面表达',
    category: '语文'
  }
]

// 初始化样例数据
const initializeQuestionsData = () => {
  // 清空现有数据
  questions = []

  // 为ID为'1'的考试添加问题
  questions.push(
    {
      id: uuidv4(),
      examId: '1',
      questionNumber: '1',
      learningObjective: 'LO-MATH-01',
      score: 5,
      description: '解二元一次方程组',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      examId: '1',
      questionNumber: '2',
      learningObjective: 'LO-MATH-02',
      score: 10,
      description: '因式分解',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      examId: '1',
      questionNumber: '3',
      learningObjective: 'LO-MATH-03',
      score: 15,
      description: '应用题：行程问题',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  )

  // 为ID为'2'的考试添加问题
  questions.push(
    {
      id: uuidv4(),
      examId: '2',
      questionNumber: '1a',
      learningObjective: 'LO-ENG-01',
      score: 5,
      description: '阅读理解',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      examId: '2',
      questionNumber: '1b',
      learningObjective: 'LO-ENG-01',
      score: 5,
      description: '阅读理解续',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      examId: '2',
      questionNumber: '2',
      learningObjective: 'LO-ENG-02',
      score: 20,
      description: '英语作文',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  )

  console.log('Initialized questions data:', questions)
}

// 立即初始化数据
initializeQuestionsData()

// 获取指定考试的所有问题
export const getQuestionsByExamId = http.get('/api/exams/:examId/questions', async ({ params }) => {
  await delay()

  const examId = params.examId as string
  
  const examQuestions = questions.filter(q => q.examId === examId)
  
  return HttpResponse.json(examQuestions, { status: 200 })
})

// 获取单个问题
export const getQuestionById = http.get('/api/questions/:id', async ({ params }) => {
  await delay()

  const questionId = params.id as string
  const question = questions.find(q => q.id === questionId)
  
  if (!question) {
    return new HttpResponse(null, { status: 404 })
  }
  
  return HttpResponse.json(question, { status: 200 })
})

// 创建新问题
export const createQuestion = http.post('/api/questions', async ({ request }) => {
  await delay()

  const body = await request.json() as Partial<Question>
  
  if (!body.examId || !body.questionNumber || !body.learningObjective || body.score === undefined) {
    console.log('缺少必要字段:', body);
    return new Response(
      JSON.stringify({ message: '缺少必要字段' }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  
  // 检查题号是否已存在于同一考试中
  const questionNumberExists = questions.some(q => 
    q.examId === body.examId && 
    q.questionNumber === body.questionNumber
  )
  
  if (questionNumberExists) {
    console.log('题号已存在:', body.questionNumber);
    return new Response(
      JSON.stringify({ message: '题号已存在，请使用不同的题号' }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  
  const newQuestion: Question = {
    id: uuidv4(),
    examId: body.examId,
    questionNumber: body.questionNumber,
    learningObjective: body.learningObjective,
    score: body.score,
    description: body.description || '',
    imageUrl: body.imageUrl || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  questions.push(newQuestion)
  
  return HttpResponse.json(newQuestion, { status: 201 })
})

// 更新问题
export const updateQuestion = http.put('/api/questions/:id', async ({ params, request }) => {
  await delay()

  const questionId = params.id as string
  const body = await request.json() as Partial<Question>
  
  const questionIndex = questions.findIndex(q => q.id === questionId)
  
  if (questionIndex === -1) {
    return new Response(
      JSON.stringify({ message: '未找到要更新的题目' }), 
      { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  
  // 如果更新题号，检查新题号是否已存在于同一考试中（排除当前题目）
  if (body.questionNumber && body.questionNumber !== questions[questionIndex].questionNumber) {
    const questionNumberExists = questions.some(q => 
      q.examId === questions[questionIndex].examId && 
      q.id !== questionId &&
      q.questionNumber === body.questionNumber
    )
    
    if (questionNumberExists) {
      console.log('更新时题号已存在:', body.questionNumber);
      return new Response(
        JSON.stringify({ message: '题号已存在，请使用不同的题号' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
  
  const updatedQuestion = {
    ...questions[questionIndex],
    ...body,
    updatedAt: new Date().toISOString()
  }
  
  questions[questionIndex] = updatedQuestion
  
  return HttpResponse.json(updatedQuestion, { status: 200 })
})

// 删除问题
export const deleteQuestion = http.delete('/api/questions/:id', async ({ params }) => {
  await delay()

  const questionId = params.id as string
  const questionIndex = questions.findIndex(q => q.id === questionId)
  
  if (questionIndex === -1) {
    return new HttpResponse(null, { status: 404 })
  }
  
  questions.splice(questionIndex, 1)
  
  return new HttpResponse(null, { status: 204 })
})

// 获取学业目标列表，可按学科筛选
export const getLearningObjectives = http.get('/api/learning-objectives', async ({ request }) => {
  await delay()
  
  const url = new URL(request.url)
  const subject = url.searchParams.get('subject')
  
  // 如果提供了学科参数，则筛选对应学科的学业目标
  if (subject) {
    // 学科到类别的映射
    const subjectToCategoryMap: Record<string, string[]> = {
      '数学': ['数学'],
      '语文': ['语文'],
      '英语': ['英语'],
      '物理': ['物理'],
      '化学': ['化学'],
      '生物': ['生物'],
      '历史': ['历史'],
      '地理': ['地理'],
      '政治': ['政治'],
      '科学': ['科学', '物理', '化学', '生物'],
      '综合': ['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '科学']
    }
    
    const categories = subjectToCategoryMap[subject] || []
    
    if (categories.length > 0) {
      const filteredObjectives = learningObjectives.filter(obj => 
        categories.includes(obj.category || '')
      )
      return HttpResponse.json(filteredObjectives, { status: 200 })
    }
  }
  
  // 如果没有学科参数或找不到匹配的类别，返回所有学业目标
  return HttpResponse.json(learningObjectives, { status: 200 })
})

// 获取考试详情（包括问题）
export const getExamDetails = http.get('/api/exams/:id/details', async ({ params }) => {
  await delay()

  const examId = params.id as string
  
  // 这里假设已经有了exam处理程序，我们通过网络请求获取考试信息
  const examResponse = await fetch(`/api/exams/${examId}`)
  
  if (!examResponse.ok) {
    return new HttpResponse(null, { status: 404 })
  }
  
  const exam = await examResponse.json()
  const examQuestions = questions.filter(q => q.examId === examId)
  
  // 计算总分
  const totalScore = examQuestions.reduce((sum, q) => sum + q.score, 0)
  
  return HttpResponse.json({
    ...exam,
    questions: examQuestions,
    totalScore
  }, { status: 200 })
})

// PDF导入题目
export const importQuestionsFromPdf = http.post('/api/questions/import-pdf', async ({ request }) => {
  await delay(3000) // 模拟较长的处理时间
  
  const formData = await request.formData()
  const examId = formData.get('examId')
  const file = formData.get('file')
  
  if (!examId) {
    return new Response(
      JSON.stringify({ message: '缺少考试ID' }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  
  if (!file || !(file instanceof File) || file.type !== 'application/pdf') {
    return new Response(
      JSON.stringify({ message: '请上传有效的PDF文件' }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  
  // 模拟PDF识别结果
  const mockQuestions: Question[] = [
    {
      id: uuidv4(),
      examId: examId as string,
      questionNumber: '1',
      learningObjective: 'LO-MATH-01',
      score: 5,
      description: '计算 25 + 18 的结果',
      imageUrl: 'https://via.placeholder.com/300x200?text=Question+1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      examId: examId as string,
      questionNumber: '2',
      learningObjective: 'LO-MATH-02',
      score: 10,
      description: '解方程 3x + 7 = 22',
      imageUrl: 'https://via.placeholder.com/300x200?text=Question+2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      examId: examId as string,
      questionNumber: '3',
      learningObjective: 'LO-MATH-03',
      score: 15,
      description: '计算三角形的面积，底为6cm，高为8cm',
      imageUrl: 'https://via.placeholder.com/300x200?text=Question+3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      examId: examId as string,
      questionNumber: '4',
      learningObjective: 'LO-SCI-01',
      score: 10,
      description: '说明光合作用的基本过程',
      imageUrl: 'https://via.placeholder.com/300x200?text=Question+4',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      examId: examId as string,
      questionNumber: '5',
      learningObjective: 'LO-CHIN-01',
      score: 20,
      description: '分析下面这首古诗的主题和写作手法',
      imageUrl: 'https://via.placeholder.com/300x200?text=Question+5',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
  
  // 添加到问题数据库
  questions.push(...mockQuestions)
  
  return HttpResponse.json({
    success: true,
    message: '导入成功',
    questions: mockQuestions,
    count: mockQuestions.length
  })
})

// 批量更新分数
export const bulkUpdateScores = http.put('/api/questions/bulk-update-scores', async ({ request }) => {
  await delay(1000)
  
  const body = await request.json() as { 
    examId: string; 
    questions: Array<{ 
      id: string; 
      score: number 
    }> 
  }
  
  const { examId, questions: updatedQuestions } = body
  
  if (!examId || !updatedQuestions || !Array.isArray(updatedQuestions)) {
    return new Response(
      JSON.stringify({ message: '缺少必要参数' }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  
  // 更新题目分数
  for (const updatedQuestion of updatedQuestions) {
    const questionIndex = questions.findIndex(q => q.id === updatedQuestion.id)
    
    if (questionIndex !== -1) {
      questions[questionIndex] = {
        ...questions[questionIndex],
        score: updatedQuestion.score,
        updatedAt: new Date().toISOString()
      }
    }
  }
  
  // 获取更新后的考试题目
  const examQuestions = questions.filter(q => q.examId === examId)
  
  return HttpResponse.json({
    success: true,
    message: '批量更新分数成功',
    questions: examQuestions
  })
})

// 更新导出的处理程序
export const questionsHandlers = [
  getQuestionsByExamId,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getLearningObjectives,
  importQuestionsFromPdf,
  bulkUpdateScores
] 