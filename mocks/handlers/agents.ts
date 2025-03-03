import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

// 定义请求类型
interface AgentListParams {
  userId?: string;
  status?: string;
}

// 智能体数据
const agents = [
  {
    id: 'agent-001',
    name: '数学辅导助手',
    avatar: '/agents/math.png',
    description: '能够解答初中数学问题，提供详细步骤和解析',
    status: 'active',
    createdAt: '2023-08-01',
    type: 'education',
    capabilities: ['问答', '习题解析', '知识点讲解']
  },
  {
    id: 'agent-002',
    name: '英语口语教练',
    avatar: '/agents/english.png',
    description: '帮助学生提高英语口语表达能力，纠正发音问题',
    status: 'active',
    createdAt: '2023-07-15',
    type: 'language',
    capabilities: ['口语练习', '发音纠正', '情景对话']
  },
  {
    id: 'agent-003',
    name: '历史知识百科',
    avatar: '/agents/history.png',
    description: '提供中国历史相关知识问答，包含重要历史事件和人物',
    status: 'disabled',
    createdAt: '2023-06-20',
    type: 'education',
    capabilities: ['问答', '故事讲述', '历史事件分析']
  },
  {
    id: 'agent-004',
    name: '课堂管理助手',
    avatar: '/agents/classroom.png',
    description: '帮助教师管理课堂秩序，提供教学活动建议',
    status: 'active',
    createdAt: '2023-08-10',
    type: 'management',
    capabilities: ['活动建议', '时间管理', '行为分析']
  },
  {
    id: 'agent-005',
    name: '科学实验指导',
    avatar: '/agents/science.png',
    description: '为中小学科学实验提供指导和安全提示',
    status: 'active',
    createdAt: '2023-07-25',
    type: 'education',
    capabilities: ['实验指导', '安全提示', '现象解释']
  }
];

// 用户-智能体关联数据（哪个用户可以访问哪些智能体）
const userAgents: Record<string, string[]> = {
  '1': ['agent-001', 'agent-002', 'agent-004', 'agent-005'], // admin用户可访问的智能体
  '2': ['agent-001', 'agent-003', 'agent-005'] // teacher用户可访问的智能体
};

export const agentHandlers = [
  // 获取智能体列表
  http.get('*/api/agents', async ({ request }) => {
    await delay(400);
    
    // 从请求头获取令牌
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // 查找用户会话
    const session = db.session.findFirst({
      where: {
        token: {
          equals: token,
        },
      },
    });
    
    if (!session) {
      return HttpResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // 获取用户信息
    const user = db.user.findFirst({
      where: {
        id: {
          equals: session.userId,
        },
      },
    });
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // 过滤该用户可访问的智能体
    const userAgentIds = userAgents[user.id] || [];
    const accessibleAgents = agents.filter(agent => 
      userAgentIds.includes(agent.id) && agent.status === 'active'
    );
    
    return HttpResponse.json({
      agents: accessibleAgents
    });
  }),
  
  // 获取单个智能体详情
  http.get('*/api/agents/:id', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    const agent = agents.find(agent => agent.id === id);
    
    if (!agent) {
      return HttpResponse.json(
        { message: 'Agent not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(agent);
  }),
  
  // 与智能体对话
  http.post('*/api/agents/:id/chat', async ({ params, request }) => {
    await delay(800);
    
    const { id } = params;
    const { message } = await request.json() as { message: string };
    
    const agent = agents.find(agent => agent.id === id);
    
    if (!agent) {
      return HttpResponse.json(
        { message: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // 根据不同的智能体类型返回不同的回复
    let response = '';
    
    switch (agent.id) {
      case 'agent-001': // 数学辅导助手
        response = '你好，我是数学辅导助手，我可以帮你解答数学问题。请告诉我你遇到的困难。';
        break;
      case 'agent-002': // 英语口语教练
        response = 'Hello! I\'m your English speaking coach. What would you like to practice today?';
        break;
      case 'agent-004': // 课堂管理助手
        response = '你好，我是课堂管理助手。我可以帮助你规划课堂活动和管理课堂秩序。';
        break;
      case 'agent-005': // 科学实验指导
        response = '你好，我是科学实验指导助手。请问你需要进行什么实验？我会提供相关的指导和安全提示。';
        break;
      default:
        response = '你好，我是AI助手，有什么可以帮助你的？';
    }
    
    return HttpResponse.json({
      agentId: id,
      message: response,
      timestamp: new Date().toISOString()
    });
  })
]; 