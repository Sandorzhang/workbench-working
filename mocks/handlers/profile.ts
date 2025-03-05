import { http, HttpResponse } from 'msw'

export const profileHandlers = [
  // 获取用户个人资料
  http.get('/api/profile', () => {
    console.log('收到获取用户个人资料请求')
    
    return HttpResponse.json({
      id: 'u1',
      name: '李老师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher',
      email: 'teacher@school.edu',
      role: 'teacher',
      department: '数学教研组',
      title: '高级教师',
      specialties: ['数学', '物理', '编程']
    })
  }),
  
  // 更新用户个人资料
  http.put('/api/profile', async ({ request }) => {
    const data = await request.json()
    console.log('收到更新用户个人资料请求', data)
    
    return HttpResponse.json({
      success: true,
      message: '个人资料更新成功'
    })
  })
] 