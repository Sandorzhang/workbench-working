import { http, HttpResponse } from 'msw'

export const teachingDesignsHandlers = [
  // 获取教学设计列表
  http.get('/api/teaching-designs', () => {
    console.log('收到获取教学设计列表请求')
    
    return HttpResponse.json([
      {
        id: 'td1',
        title: '代数基础概念教学设计',
        subject: '数学',
        grade: '高一',
        author: '李老师',
        createdAt: '2023-04-15',
        updatedAt: '2023-05-10',
        status: 'published'
      },
      {
        id: 'td2',
        title: '函数图像与性质教学设计',
        subject: '数学',
        grade: '高一',
        author: '李老师',
        createdAt: '2023-03-20',
        updatedAt: '2023-04-05',
        status: 'published'
      },
      {
        id: 'td3',
        title: '三角函数教学设计',
        subject: '数学',
        grade: '高一',
        author: '李老师',
        createdAt: '2023-02-10',
        updatedAt: '2023-03-01',
        status: 'draft'
      }
    ])
  }),
  
  // 获取特定教学设计
  http.get('/api/teaching-designs/:id', ({ params }) => {
    console.log(`收到获取教学设计请求，ID: ${params.id}`)
    
    const designDetails = {
      'td1': {
        id: 'td1',
        title: '代数基础概念教学设计',
        subject: '数学',
        grade: '高一',
        author: '李老师',
        createdAt: '2023-04-15',
        updatedAt: '2023-05-10',
        status: 'published',
        objectives: [
          '理解代数基本概念和定义',
          '掌握代数运算法则',
          '能够应用代数知识解决简单实际问题'
        ],
        content: '本教学设计围绕代数基础概念展开，通过例题讲解和互动练习帮助学生掌握代数的基本概念和运算法则...',
        activities: [
          {
            name: '导入活动',
            duration: '10分钟',
            description: '通过日常生活中的例子引入代数概念'
          },
          {
            name: '讲解示例',
            duration: '20分钟',
            description: '讲解代数基本概念和运算法则'
          },
          {
            name: '小组讨论',
            duration: '15分钟',
            description: '小组合作解决代数应用问题'
          },
          {
            name: '总结回顾',
            duration: '5分钟',
            description: '梳理本节课重点内容'
          }
        ],
        resources: [
          {
            name: '教学PPT',
            type: 'presentation',
            url: '#'
          },
          {
            name: '练习题',
            type: 'worksheet',
            url: '#'
          }
        ]
      }
    };
    
    const design = designDetails[params.id as keyof typeof designDetails];
    
    if (design) {
      return HttpResponse.json(design);
    } else {
      return new HttpResponse(null, { status: 404 });
    }
  })
] 