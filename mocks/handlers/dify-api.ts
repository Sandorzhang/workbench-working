import { http, HttpResponse, delay } from 'msw';
import { v4 as uuidv4 } from 'uuid';
import {
  DifyConversation,
  DifyMessage,
  DifyChatResponse,
  DifyResponse,
  DifyChatRequest,
  DifyDeleteConversationRequest
} from '@/types/dify';

// 生成Dify格式的响应
function createDifyResponse<T>(data: T, status: 'success' | 'error' = 'success', message?: string): DifyResponse<T> {
  return {
    data,
    status,
    message
  };
}

// 模拟会话数据
const mockConversations: DifyConversation[] = [
  {
    id: "conv-1",
    title: "研究教育技术的最新趋势",
    created_at: new Date(2023, 2, 15).toISOString(),
    updated_at: new Date(2023, 2, 15).toISOString(),
    status: "normal"
  },
  {
    id: "conv-2",
    title: "如何优化课堂教学策略",
    created_at: new Date(2023, 2, 10).toISOString(),
    updated_at: new Date(2023, 2, 10).toISOString(),
    status: "normal"
  },
  {
    id: "conv-3",
    title: "AI在个性化学习中的应用",
    created_at: new Date(2023, 2, 5).toISOString(),
    updated_at: new Date(2023, 3, 1).toISOString(),
    status: "archived"
  }
];

// 模拟消息数据
const mockMessages: Record<string, DifyMessage[]> = {
  "conv-1": [
    {
      id: "msg-11",
      conversation_id: "conv-1",
      role: "user",
      content: "现在教育科技领域有哪些新兴趋势？",
      created_at: new Date(2023, 2, 15, 10, 30).toISOString()
    },
    {
      id: "msg-12",
      conversation_id: "conv-1",
      role: "assistant",
      content: "教育科技领域的新兴趋势包括：\n\n1. **AI个性化学习**: 利用人工智能为每个学生创建个性化学习路径\n\n2. **VR/AR沉浸式学习**: 虚拟和增强现实技术为学生提供沉浸式学习体验\n\n3. **微学习和移动学习**: 短小精悍的学习内容适合碎片化时间学习\n\n4. **学习分析和大数据**: 利用数据分析优化教学和学习过程\n\n5. **游戏化学习**: 将游戏元素融入教育，提高学习动力\n\n您对哪个趋势特别感兴趣？我可以深入介绍。",
      created_at: new Date(2023, 2, 15, 10, 32).toISOString()
    }
  ],
  "conv-2": [
    {
      id: "msg-21",
      conversation_id: "conv-2",
      role: "user",
      content: "我想了解如何改进课堂教学策略，使学生更加积极参与。",
      created_at: new Date(2023, 2, 10, 14, 20).toISOString()
    },
    {
      id: "msg-22",
      conversation_id: "conv-2",
      role: "assistant",
      content: "提高学生课堂参与度的有效策略包括：\n\n1. **主动学习技术**：如思考-配对-分享、小组讨论、案例研究\n\n2. **提问技巧**：使用开放式问题，给予充分思考时间\n\n3. **技术集成**：利用互动应用和数字工具增强参与感\n\n4. **多元评估**：形成性评估和多种反馈方式\n\n5. **建立积极课堂文化**：营造安全、鼓励参与的环境\n\n我可以详细介绍任何一种策略。您希望深入了解哪一个？",
      created_at: new Date(2023, 2, 10, 14, 24).toISOString()
    }
  ],
  "conv-3": [
    {
      id: "msg-31",
      conversation_id: "conv-3",
      role: "user",
      content: "AI如何帮助实现个性化学习？",
      created_at: new Date(2023, 2, 5, 9, 15).toISOString()
    },
    {
      id: "msg-32",
      conversation_id: "conv-3",
      role: "assistant",
      content: "AI在个性化学习中的应用方式：\n\n1. **学习路径定制**：根据学生能力和进度自动调整学习内容\n\n2. **实时反馈**：提供即时评估和针对性指导\n\n3. **智能辅导系统**：模仿人类导师，提供一对一支持\n\n4. **学习模式识别**：分析学习行为，识别优势和弱点\n\n5. **自适应评估**：根据学生表现调整题目难度\n\n6. **学习分析**：帮助教育者了解班级整体情况和个体需求\n\n这些技术正在改变教育方式，使学习更加个性化和高效。",
      created_at: new Date(2023, 2, 5, 9, 18).toISOString()
    }
  ]
};

// 生成对话回复
function generateAssistantResponse(query: string): string {
  if (query.includes('教育') || query.includes('学习')) {
    return "教育是培养人的过程，有效的学习策略对学生的发展至关重要。现代教育强调个性化学习、批判性思维和终身学习能力的培养。结合AI等新技术，教育正在经历前所未有的变革。您有什么具体的教育问题需要探讨吗？";
  } else if (query.includes('技术') || query.includes('AI')) {
    return "技术正在深刻改变教育领域。人工智能、虚拟现实和大数据分析等技术为个性化学习和教学效率提升带来了新的可能。这些工具可以帮助教师更好地了解学生需求，并提供有针对性的教学支持。您对教育技术的哪个方面特别感兴趣？";
  } else {
    return "您提出了一个有趣的问题。作为教育助手，我可以提供关于教学方法、学习策略、教育技术等方面的建议和信息。如果您有特定的教育相关问题，我很乐意深入探讨。";
  }
}

// 模拟Dify API的处理程序
export const difyApiHandlers = [
  // 获取会话列表
  http.get('https://api.dify.ai/v1/conversations', async ({ request }) => {
    await delay(300);
    
    const url = new URL(request.url);
    const user = url.searchParams.get('user');
    
    if (!user) {
      return HttpResponse.json(
        createDifyResponse([], 'error', '缺少user参数'),
        { status: 400 }
      );
    }
    
    // 返回会话列表，确保使用DifyResponse格式包裹数据
    return HttpResponse.json(
      createDifyResponse(mockConversations)
    );
  }),
  
  // 获取会话消息历史
  http.get('https://api.dify.ai/v1/messages', async ({ request }) => {
    await delay(300);
    
    const url = new URL(request.url);
    const conversationId = url.searchParams.get('conversation_id');
    const user = url.searchParams.get('user');
    
    if (!conversationId || !user) {
      return HttpResponse.json(
        createDifyResponse([], 'error', '缺少必要参数'),
        { status: 400 }
      );
    }
    
    const messages = mockMessages[conversationId] || [];
    
    // 返回消息历史，确保使用DifyResponse格式包裹数据
    return HttpResponse.json(
      createDifyResponse(messages)
    );
  }),
  
  // 获取单个会话详情
  http.get('https://api.dify.ai/v1/conversations/:id', async ({ params, request }) => {
    await delay(300);
    
    const { id } = params;
    const url = new URL(request.url);
    const user = url.searchParams.get('user');
    
    if (!user) {
      return HttpResponse.json(
        createDifyResponse(null, 'error', '缺少user参数'),
        { status: 400 }
      );
    }
    
    const conversation = mockConversations.find(conv => conv.id === id);
    
    if (!conversation) {
      return HttpResponse.json(
        createDifyResponse(null, 'error', '会话不存在'),
        { status: 404 }
      );
    }
    
    // 返回会话详情，确保使用DifyResponse格式包裹数据
    return HttpResponse.json(
      createDifyResponse(conversation)
    );
  }),
  
  // 删除会话
  http.delete<{ id: string }, DifyDeleteConversationRequest>('https://api.dify.ai/v1/conversations/:id', async ({ params, request }) => {
    await delay(300);
    
    const { id } = params;
    
    try {
      const body = await request.json();
      
      if (!body.user) {
        return HttpResponse.json(
          createDifyResponse(null, 'error', '缺少user参数'),
          { status: 400 }
        );
      }
      
      // 检查会话是否存在
      const conversationIndex = mockConversations.findIndex(conv => conv.id === id);
      if (conversationIndex === -1) {
        return HttpResponse.json(
          createDifyResponse(null, 'error', '会话不存在'),
          { status: 404 }
        );
      }
      
      // 模拟删除操作（在实际应用中，这里会从数据库中删除记录）
      // 这里仅作示意
      
      // 返回成功响应
      return HttpResponse.json(
        createDifyResponse({ success: true })
      );
    } catch (err) {
      console.error('删除会话处理错误:', err);
      return HttpResponse.json(
        createDifyResponse(null, 'error', '请求参数解析错误'),
        { status: 400 }
      );
    }
  }),
  
  // 发送聊天消息
  http.post<never, DifyChatRequest>('https://api.dify.ai/v1/chat-messages', async ({ request }) => {
    await delay(500);
    
    try {
      const body = await request.json();
      const { query, conversation_id, user, response_mode } = body;
      
      if (!query || !user) {
        return HttpResponse.json(
          createDifyResponse(null, 'error', '缺少必要参数'),
          { status: 400 }
        );
      }
      
      // 生成响应消息
      const assistantResponse = generateAssistantResponse(query);
      
      // 如果没有提供会话ID，创建一个新的会话
      let activeConversationId = conversation_id;
      if (!activeConversationId) {
        activeConversationId = `conv-${uuidv4()}`;
        const newConversation: DifyConversation = {
          id: activeConversationId,
          title: query.length > 20 ? query.substring(0, 20) + '...' : query,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'normal'
        };
        
        mockConversations.push(newConversation);
        mockMessages[activeConversationId] = [];
      }
      
      // 创建用户消息
      const userMessageId = `msg-${uuidv4()}`;
      const userMessage: DifyMessage = {
        id: userMessageId,
        conversation_id: activeConversationId,
        role: 'user',
        content: query,
        created_at: new Date().toISOString()
      };
      
      // 创建助手响应消息
      const assistantMessageId = `msg-${uuidv4()}`;
      const assistantMessage: DifyMessage = {
        id: assistantMessageId,
        conversation_id: activeConversationId,
        role: 'assistant',
        content: assistantResponse,
        created_at: new Date().toISOString()
      };
      
      // 添加消息到会话历史
      if (!mockMessages[activeConversationId]) {
        mockMessages[activeConversationId] = [];
      }
      
      mockMessages[activeConversationId].push(userMessage);
      mockMessages[activeConversationId].push(assistantMessage);
      
      // 更新会话的最后更新时间
      const conversation = mockConversations.find(conv => conv.id === activeConversationId);
      if (conversation) {
        conversation.updated_at = new Date().toISOString();
      }
      
      // 返回响应
      const chatResponse: DifyChatResponse = {
        conversation_id: activeConversationId,
        message_id: assistantMessageId,
        answer: assistantResponse
      };
      
      // 根据不同的响应模式返回不同的响应
      if (response_mode === 'streaming') {
        // 流式响应（实际应用中这里需要实现SSE）
        // MSW目前不支持真正的流式响应，这里简化处理
        return HttpResponse.json(
          createDifyResponse(chatResponse)
        );
      } else {
        // 阻塞模式响应
        return HttpResponse.json(
          createDifyResponse(chatResponse)
        );
      }
    } catch (err) {
      console.error('发送聊天消息处理错误:', err);
      return HttpResponse.json(
        createDifyResponse(null, 'error', '请求参数解析错误'),
        { status: 400 }
      );
    }
  })
]; 