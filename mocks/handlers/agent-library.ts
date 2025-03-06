import { http, HttpResponse, delay } from 'msw';

// 智能体类型定义
interface AIAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
}

// 用户智能体关系类型
interface UserAgentRelation {
  userId: string;
  agentId: string;
  dateAdded: string;
}

// 模拟智能体数据
const agents: AIAgent[] = [
  {
    id: '1',
    name: '智能教学助手',
    description: '帮助老师设计课堂活动、解决教学难题，提供学生评价建议',
    icon: 'Brain',
    category: 'education',
    tags: ['教学设计', '学生评价', '课堂管理']
  },
  {
    id: '2',
    name: '学科备课专家',
    description: '专注于学科专业知识，提供教案设计和知识点讲解',
    icon: 'BookOpen',
    category: 'education',
    tags: ['备课', '教案', '知识点']
  },
  {
    id: '3',
    name: '创意教学设计师',
    description: '提供创新教学方法和活动设计，激发学生学习兴趣',
    icon: 'Sparkles',
    category: 'education',
    tags: ['创新', '教学活动', '游戏化学习']
  },
  {
    id: '4',
    name: '学习分析专家',
    description: '分析学生学习数据，提供个性化的教学建议',
    icon: 'PieChart',
    category: 'analysis',
    tags: ['数据分析', '个性化', '学习评估']
  },
  {
    id: '5',
    name: '教育研究助手',
    description: '辅助教育研究工作，提供研究方法和文献分析',
    icon: 'Lightbulb',
    category: 'research',
    tags: ['研究方法', '文献分析', '论文写作']
  },
  {
    id: '6',
    name: '课程设计专家',
    description: '专注于课程体系设计，提供教学目标和评价建议',
    icon: 'Pencil',
    category: 'education',
    tags: ['课程设计', '教学目标', '评价体系']
  }
];

// 默认用户已添加的智能体
const userAgentRelations: UserAgentRelation[] = [
  {
    userId: 'default',
    agentId: '1',
    dateAdded: new Date().toISOString()
  }
];

// 处理程序
export const agentLibraryHandlers = [
  // 获取所有智能体
  http.get('*/api/agent-library/agents', async () => {
    await delay(500);
    return HttpResponse.json(agents);
  }),
  
  // 获取单个智能体信息
  http.get('*/api/agent-library/agents/:id', async ({ params }) => {
    const id = params.id as string;
    const agent = agents.find(a => a.id === id);
    
    if (!agent) {
      return new HttpResponse(null, { status: 404 });
    }
    
    await delay(300);
    return HttpResponse.json(agent);
  }),
  
  // 获取用户添加的智能体
  http.get('*/api/agent-library/user-agents', async ({ request }) => {
    try {
      // 在真实环境中，这里会基于授权信息获取用户ID
      const userId = 'default';
      
      console.log('收到获取用户智能体请求');
      
      // 找出用户添加的所有智能体ID
      const userAgentIds = userAgentRelations
        .filter(rel => rel.userId === userId)
        .map(rel => rel.agentId);
      
      console.log(`找到 ${userAgentIds.length} 个用户智能体`);
      
      // 获取对应的智能体详情
      const userAgents = agents.filter(agent => userAgentIds.includes(agent.id));
      
      await delay(500);
      return HttpResponse.json(userAgents);
    } catch (error) {
      console.error('获取用户智能体失败:', error);
      return HttpResponse.json(
        { message: '获取智能体失败', error: String(error) },
        { status: 500 }
      );
    }
  }),
  
  // 添加智能体到用户列表
  http.post('*/api/agent-library/user-agents/:id', async ({ params }) => {
    const id = params.id as string;
    const userId = 'default'; // 默认用户ID
    
    // 检查智能体是否存在
    const agent = agents.find(a => a.id === id);
    if (!agent) {
      return new HttpResponse(null, { status: 404, statusText: '智能体不存在' });
    }
    
    // 检查是否已添加
    const alreadyAdded = userAgentRelations.some(
      rel => rel.userId === userId && rel.agentId === id
    );
    
    if (!alreadyAdded) {
      userAgentRelations.push({
        userId,
        agentId: id,
        dateAdded: new Date().toISOString()
      });
    }
    
    await delay(300);
    return HttpResponse.json({ success: true });
  }),
  
  // 从用户列表中移除智能体
  http.delete('*/api/agent-library/user-agents/:id', async ({ params }) => {
    const id = params.id as string;
    const userId = 'default'; // 默认用户ID
    
    const index = userAgentRelations.findIndex(
      rel => rel.userId === userId && rel.agentId === id
    );
    
    if (index !== -1) {
      userAgentRelations.splice(index, 1);
    }
    
    await delay(300);
    return HttpResponse.json({ success: true });
  }),
  
  // 获取用户是否已添加特定智能体
  http.get('*/api/agent-library/user-agents/:id/status', async ({ params }) => {
    const id = params.id as string;
    const userId = 'default'; // 默认用户ID
    
    const isAdded = userAgentRelations.some(
      rel => rel.userId === userId && rel.agentId === id
    );
    
    await delay(200);
    return HttpResponse.json({ isAdded });
  })
]; 