import { http, HttpResponse } from 'msw'

export const schoolHandlers = [
  // 获取学校列表
  http.get('/api/schools', () => {
    console.log('收到获取学校列表请求')
    
    return HttpResponse.json([
      {
        id: 'sch1',
        name: '实验中学',
        address: '北京市海淀区',
        type: '公立',
        level: '中学'
      },
      {
        id: 'sch2',
        name: '第一中学',
        address: '北京市朝阳区',
        type: '公立',
        level: '中学'
      },
      {
        id: 'sch3',
        name: '国际学校',
        address: '北京市顺义区',
        type: '私立',
        level: '中学'
      }
    ])
  }),
  
  // 获取学校信息
  http.get('/api/schools/:id', ({ params }) => {
    console.log(`收到获取学校信息请求，学校ID: ${params.id}`)
    
    const schools = {
      'sch1': {
        id: 'sch1',
        name: '实验中学',
        address: '北京市海淀区中关村南大街5号',
        type: '公立',
        level: '中学',
        established: '1956',
        principal: '张校长',
        contact: '010-12345678',
        email: 'shiyanzhongxue@edu.cn',
        website: 'www.shiyanzhongxue.edu.cn',
        description: '实验中学是一所具有悠久历史和优良传统的重点中学，以培养全面发展的创新型人才为目标。',
        departments: [
          { id: 'dep1', name: '数学教研组' },
          { id: 'dep2', name: '语文教研组' },
          { id: 'dep3', name: '英语教研组' },
          { id: 'dep4', name: '科学教研组' }
        ]
      },
      'sch2': {
        id: 'sch2',
        name: '第一中学',
        address: '北京市朝阳区建国路100号',
        type: '公立',
        level: '中学',
        established: '1960',
        principal: '李校长',
        contact: '010-87654321',
        email: 'diyizhongxue@edu.cn',
        website: 'www.diyizhongxue.edu.cn',
        description: '第一中学是一所现代化的重点中学，注重学生的综合素质培养和创新能力发展。',
        departments: [
          { id: 'dep1', name: '数学教研组' },
          { id: 'dep2', name: '语文教研组' },
          { id: 'dep3', name: '英语教研组' },
          { id: 'dep4', name: '科学教研组' }
        ]
      }
    };
    
    const school = schools[params.id as keyof typeof schools];
    
    if (school) {
      return HttpResponse.json(school);
    } else {
      return new HttpResponse(null, { status: 404 });
    }
  })
] 