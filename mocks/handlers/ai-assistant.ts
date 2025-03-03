import { http, HttpResponse, delay } from 'msw';

// 生成一个随机ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// 消息类型定义
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

// 会话类型定义
interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastUpdated: string;
  messages: Message[];
  agentId?: string; // 添加智能体ID字段
}

// 请求类型定义
interface ChatRequest {
  message: string;
  conversationId: string;
  agentId?: string; // 添加智能体ID字段
}

interface RenameRequest {
  title: string;
}

interface CreateConversationRequest {
  agentId?: string; // 创建会话时可以指定智能体ID
  title?: string;   // 可以指定标题
}

// 预设对话示例
const conversations: Conversation[] = [
  {
    id: "1",
    title: "如何设计有效的课堂活动",
    lastMessage: "你可以尝试小组合作学习方式，这对培养学生的团队协作能力很有帮助。",
    lastUpdated: new Date(2023, 2, 15).toISOString(),
    agentId: "1", // 智能教学助手ID
    messages: [
      {
        id: "m1",
        content: "你好，我想了解如何为初中学生设计更有趣的课堂活动？",
        role: "user",
        timestamp: new Date(2023, 2, 15, 10, 30).toISOString()
      },
      {
        id: "m2",
        content: "您好！为初中学生设计有趣的课堂活动需要考虑他们的认知发展和兴趣点。以下是一些建议：\n\n1. **游戏化学习**：将知识点融入游戏中，如知识竞赛、角色扮演或者学科相关的桌游。\n\n2. **小组项目**：设计需要合作完成的项目，培养团队协作能力。\n\n3. **实践活动**：动手实验或创作，如科学实验、艺术创作等。\n\n4. **辩论与讨论**：围绕课程主题进行辩论，培养批判性思维。\n\n5. **技术整合**：使用平板电脑、互动白板或教育应用程序进行互动学习。\n\n您希望我详细展开哪个方向的活动设计呢？",
        role: "assistant",
        timestamp: new Date(2023, 2, 15, 10, 32).toISOString()
      },
      {
        id: "m3",
        content: "小组项目听起来不错，你能详细说说如何组织小组合作学习吗？",
        role: "user",
        timestamp: new Date(2023, 2, 15, 10, 35).toISOString()
      },
      {
        id: "m4",
        content: "小组合作学习是一种非常有效的教学方法，特别适合初中生。以下是如何组织有效的小组合作学习：\n\n**1. 小组组建策略：**\n- 异质分组：将不同能力、学习风格和性格的学生混合，每组4-5人为宜\n- 考虑学生的社交关系，避免小团体或边缘化情况\n- 定期重组小组，让学生有机会与更多同学合作\n\n**2. 明确的角色分配：**\n- 组长：协调组内工作，确保任务进度\n- 记录员：记录讨论内容和决策\n- 材料管理员：负责管理学习资料\n- 报告员：向全班汇报小组成果\n- 鼓励官：给予组员积极反馈，保持团队士气\n\n**3. 项目设计要点：**\n- 设置明确的学习目标和成果要求\n- 任务应具有适当难度，需要团队合作才能完成\n- 提供清晰的评分标准\n- 设计需要不同技能的子任务，使每位学生都能贡献所长\n\n**4. 合作监督与指导：**\n- 巡视各小组，提供必要指导但不过度干预\n- 观察小组互动模式，及时调整不平衡情况\n- 引导学生学会如何有效沟通和解决冲突\n\n**5. 评估方式：**\n- 结合小组整体表现和个人贡献进行评分\n- 使用同伴评价作为参考\n- 让学生进行自我反思\n\n**6. 具体活动示例：**\n- 历史课：小组编写和表演历史事件微剧本\n- 科学课：设计和执行实验，分析结果并展示\n- 语文课：合作创作故事或编辑班级杂志\n- 数学课：解决现实生活中的数学问题并制作展示板\n\n您想要针对哪个具体学科设计一个小组合作学习活动？",
        role: "assistant",
        timestamp: new Date(2023, 2, 15, 10, 38).toISOString()
      },
      {
        id: "m5",
        content: "我是数学老师，请帮我设计一个数学课的小组合作活动。",
        role: "user",
        timestamp: new Date(2023, 2, 15, 10, 40).toISOString()
      },
      {
        id: "m6",
        content: "非常好！以下是一个为初中数学课设计的小组合作学习活动方案：\n\n# 初中数学小组合作学习活动：「现实世界中的几何学」\n\n## 活动目标\n- 理解并应用几何概念解决实际问题\n- 培养数据收集、分析和表示能力\n- 锻炼团队协作与沟通技巧\n- 提高数学建模能力\n\n## 活动设计（45-90分钟课堂 + 课外时间）\n\n### 第一阶段：问题提出与小组分工（15分钟）\n\n1. **情景导入**：展示学校或社区中的一个需要改进的空间设计问题，例如：\n   - 学校操场上最佳休息区的位置和大小\n   - 教室内如何重新安排座位以优化学习效果\n   - 校园内新建一个花园，如何设计路径使得总长度最短\n\n2. **分组**：将学生分为4-5人一组，确保每组技能互补\n\n3. **角色分配**：\n   - 项目经理：协调组内工作，确保进度\n   - 测量专家：负责实地测量和数据收集\n   - 计算专员：执行数学计算\n   - 设计师：进行图形设计和视觉表达\n   - 报告员：准备和展示最终方案\n\n### 第二阶段：数据收集与分析（课外20分钟 + 课堂20分钟）\n\n1. **实地测量**：使用卷尺、角度测量器等工具收集必要的数据\n   - 测量相关区域的尺寸\n   - 记录关键位置的坐标或距离\n\n2. **数据处理**：\n   - 整理收集的数据\n   - 应用适当的几何公式计算面积、体积、距离等\n   - 使用比例尺绘制草图\n\n### 第三阶段：解决方案设计（25分钟）\n\n1. **方案构思**：\n   - 应用几何原理（如三角形特性、勾股定理、圆的性质等）\n   - 考虑多种可能的解决方案\n   - 使用数学模型进行优化\n\n2. **方案展示准备**：\n   - 制作包含图表、计算和结论的展示板\n   - 准备3-5分钟的口头报告\n   - 说明应用的数学原理和解决方案的优势\n\n### 第四阶段：方案展示与评价（20分钟）\n\n1. **小组展示**：各小组向全班介绍其解决方案\n\n2. **同伴评价**：\n   - 其他小组根据评分标准给予反馈\n   - 评价标准：数学原理应用的正确性、解决方案的创新性、展示的清晰度\n\n3. **教师总结**：\n   - 强调各组方案的优点\n   - 指出数学概念在实际应用中的重要性\n\n## 评估方式\n\n1. **小组成果评估（60%）**：\n   - 数学概念应用正确性（20%）\n   - 解决方案的可行性和创新性（20%）\n   - 材料质量和展示效果（20%）\n\n2. **个人贡献评估（40%）**：\n   - 同伴评价（15%）\n   - 自我反思报告（15%）\n   - 教师观察（10%）\n\n## 扩展活动\n\n- 将最佳方案实际应用于学校环境\n- 使用3D建模软件将设计可视化\n- 计算实施方案的成本并做预算规划\n\n这个活动将几何学习与现实问题结合，使学生能够将抽象概念应用到实际环境中，同时培养团队合作能力。您可以根据具体的年级和已学内容调整难度和复杂度。\n\n您认为这个活动设计怎么样？需要我针对某个具体数学主题做更详细的调整吗？",
        role: "assistant",
        timestamp: new Date(2023, 2, 15, 10, 45).toISOString()
      },
      {
        id: "m7",
        content: "这个方案非常全面，我很喜欢！你可以尝试小组合作学习方式，这对培养学生的团队协作能力很有帮助。",
        role: "user",
        timestamp: new Date(2023, 2, 15, 10, 50).toISOString()
      }
    ]
  },
  {
    id: "2",
    title: "学生评价系统建议",
    lastMessage: "多元化评价体系可以更全面地反映学生的综合素质...",
    lastUpdated: new Date(2023, 2, 10).toISOString(),
    agentId: "1", // 智能教学助手ID
    messages: [
      {
        id: "m1",
        content: "我想建立一个更全面的学生评价系统，有什么建议？",
        role: "user",
        timestamp: new Date(2023, 2, 10, 14, 20).toISOString()
      },
      {
        id: "m2",
        content: "建立全面的学生评价系统是提升教育质量的重要步骤。以下是一些建议：\n\n1. **多元评价维度**：除学术成绩外，还应包括品德表现、创新能力、团队合作、解决问题能力等\n\n2. **形成性与终结性评价结合**：不仅关注期末考试，也重视平时的课堂表现、作业完成情况等\n\n3. **定性与定量方法并用**：数据量化评估与描述性评语相结合\n\n4. **多方参与评价**：教师评价、学生自评、同伴互评、家长参与等\n\n希望这些建议对您有所帮助！",
        role: "assistant",
        timestamp: new Date(2023, 2, 10, 14, 24).toISOString()
      }
    ]
  },
  {
    id: "3",
    title: "个性化学习方案",
    lastMessage: "根据学生的学习风格和需求，我推荐以下个性化学习策略...",
    lastUpdated: new Date(2023, 2, 5).toISOString(),
    agentId: "2", // 学科备课专家ID
    messages: []
  },
  {
    id: "4",
    title: "创新教学方法探讨",
    lastMessage: "游戏化教学可以大大提高学生的参与度和学习效果...",
    lastUpdated: new Date(2023, 3, 8).toISOString(),
    agentId: "3", // 创意教学设计师ID
    messages: [
      {
        id: "m1",
        content: "你能介绍一些创新的教学方法吗？",
        role: "user",
        timestamp: new Date(2023, 3, 8, 9, 15).toISOString()
      },
      {
        id: "m2",
        content: "当然可以！以下是一些创新教学方法：\n\n1. **游戏化教学**：将学习内容融入游戏机制中，设置积分、徽章和排行榜等元素，增强学习动机\n\n2. **翻转课堂**：学生在课前通过视频等方式自学知识点，课堂时间用于讨论和解决问题\n\n3. **项目式学习**：围绕真实问题或挑战开展学习活动，培养解决问题的能力\n\n4. **STEAM教育**：融合科学、技术、工程、艺术和数学，强调跨学科学习\n\n5. **情境教学**：创设真实或模拟的情境，让学生在具体情境中学习和应用知识\n\n您对哪种教学方法特别感兴趣？我可以为您提供更详细的实施建议。",
        role: "assistant",
        timestamp: new Date(2023, 3, 8, 9, 18).toISOString()
      }
    ]
  }
];

// 智能体回复生成逻辑
const generateResponse = (message: string, agentId?: string): string => {
  // 根据智能体ID和用户消息生成不同的回复
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi') || message.toLowerCase().includes('hey') || message.toLowerCase().includes('你好')) {
    return "您好！很高兴为您服务。请问有什么我可以帮助您的吗？";
  }
  
  if (message.toLowerCase().includes('thank') || message.toLowerCase().includes('谢谢')) {
    return "不客气！如果您还有其他问题，随时可以问我。";
  }
  
  // 教育相关问题
  if (message.includes('教学') || message.includes('课程') || message.includes('学生')) {
    return "作为一名教育助手，我可以帮助您解决教学过程中遇到的各种挑战。您可以向我咨询课程设计、教学方法、学生管理等方面的问题。我会根据最新的教育理念和实践经验为您提供建议。您想了解哪方面的具体内容呢？";
  }
  
  // AI和技术相关问题
  if (message.includes('AI') || message.includes('人工智能') || message.includes('技术')) {
    return "人工智能正在逐渐改变教育领域。它可以通过个性化学习、智能评估、自动化管理等方式，提高教学效率和学习效果。您对教育中的AI应用有什么具体的问题吗？";
  }
  
  // 根据智能体ID生成不同的专业回复
  if (agentId === "1") { // 教学助手
    return "作为教学助手，我认为这个问题涉及到教学设计的核心原则。有效的教学需要明确的学习目标、合适的教学策略、及时的反馈和评估。您的问题很有价值，我建议从学生的认知发展水平和已有知识基础出发，设计符合其学习需求的教学活动。您希望我从哪个方面进一步展开分析呢？";
  } else if (agentId === "2") { // 学生助手
    return "我理解你作为学生可能面临的挑战。学习是一个需要策略和方法的过程，不仅仅是记忆知识点。我建议你尝试主动学习方法，比如间隔复习、知识连接和实践应用。你也可以寻找学习伙伴，互相解释概念可以加深理解。有什么具体的学习困难我可以帮你解决吗？";
  } else if (agentId === "3") { // 研究助手
    return "从教育研究的角度看，这个问题涉及到多个理论框架。近期的实证研究表明，混合学习模式结合了传统课堂教学和在线学习的优势，可以显著提高学习成效。Hattie的元分析研究也指出，教师反馈、形成性评估和自我报告成绩是影响学习效果最大的因素。您想了解哪方面的研究证据？";
  }
  
  // 默认回复
  return "您提出了一个很有思考价值的问题。在教育领域，我们需要综合考虑学习者特点、教学目标和环境条件。基于当前的教育理念，我认为个性化学习和培养批判性思维尤为重要。您有什么具体的场景或者挑战需要探讨吗？";
};

// 获取智能体名称
const getAgentName = async (agentId: string): Promise<string> => {
  // 模拟API调用获取智能体名称
  if (agentId === "1") {
    return "教学助手";
  } else if (agentId === "2") {
    return "学生助手";
  } else if (agentId === "3") {
    return "研究助手";
  } else {
    return "智能助手";
  }
};

// 处理程序
export const aiAssistantHandlers = [
  // 获取所有会话（支持按智能体ID过滤）
  http.get('*/api/ai-assistant/conversations', async ({ request }) => {
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agentId');
    
    await delay(500);
    
    if (agentId) {
      // 如果提供了智能体ID，只返回该智能体的会话
      const filteredConversations = conversations.filter(conv => conv.agentId === agentId);
      return HttpResponse.json(filteredConversations);
    }
    
    // 否则返回所有会话
    return HttpResponse.json(conversations);
  }),
  
  // 获取特定会话
  http.get('*/api/ai-assistant/conversations/:id', async ({ params }) => {
    const { id } = params;
    const conversation = conversations.find(conv => conv.id === id);
    
    if (!conversation) {
      return new HttpResponse(null, { status: 404 });
    }
    
    await delay(300);
    return HttpResponse.json(conversation);
  }),
  
  // 创建新会话
  http.post<any, CreateConversationRequest>('*/api/ai-assistant/conversations', async ({ request }) => {
    let req: CreateConversationRequest = {};
    
    try {
      req = await request.json() as CreateConversationRequest;
    } catch (e) {
      // 如果没有请求体，使用空对象
      req = {};
    }
    
    const { agentId, title } = req;
    
    // 如果提供了智能体ID，尝试获取智能体名称
    let conversationTitle = title || "新的对话";
    
    if (agentId) {
      try {
        const agentName = await getAgentName(agentId);
        if (!title) {
          conversationTitle = `与${agentName}的对话`;
        }
      } catch (error) {
        console.error("获取智能体名称失败", error);
      }
    }
    
    const newConversation: Conversation = {
      id: generateId(),
      title: conversationTitle,
      lastMessage: "",
      lastUpdated: new Date().toISOString(),
      messages: [],
      agentId // 存储智能体ID
    };
    
    conversations.unshift(newConversation); // 添加到最前面
    
    await delay(500);
    return HttpResponse.json(newConversation);
  }),
  
  // 发送聊天消息
  http.post<any, ChatRequest>('*/api/ai-assistant/chat', async ({ request }) => {
    const req = await request.json() as ChatRequest;
    const { message, conversationId, agentId } = req;
    
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) {
      return new HttpResponse(null, { status: 404, statusText: "Conversation not found" });
    }
    
    // 用户消息已经在前端添加，这里不需要再添加
    // 但在实际生产环境中，应该在后端添加用户消息
    
    // 生成AI回复，优先使用对话绑定的agentId，其次使用请求中的agentId
    await delay(1000); // 模拟AI处理时间
    
    const aiResponse: Message = {
      id: generateId(),
      content: generateResponse(message, conversation.agentId || agentId),
      role: 'assistant',
      timestamp: new Date().toISOString()
    };
    
    conversation.messages.push(aiResponse);
    conversation.lastMessage = aiResponse.content;
    conversation.lastUpdated = aiResponse.timestamp;
    
    // 如果是第一条消息，更新会话标题
    if (conversation.messages.length === 2) {
      conversation.title = message.length > 20 
        ? `${message.substring(0, 20)}...` 
        : message;
    }
    
    return HttpResponse.json(aiResponse);
  }),
  
  // 删除会话
  http.delete('*/api/ai-assistant/conversations/:id', async ({ params }) => {
    const { id } = params;
    const index = conversations.findIndex(conv => conv.id === id);
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    conversations.splice(index, 1);
    
    await delay(300);
    return HttpResponse.json({ success: true });
  }),
  
  // 重命名会话
  http.patch<any, RenameRequest>('*/api/ai-assistant/conversations/:id', async ({ request, params }) => {
    const { id } = params;
    const req = await request.json() as RenameRequest;
    const { title } = req;
    
    const conversation = conversations.find(conv => conv.id === id);
    if (!conversation) {
      return new HttpResponse(null, { status: 404 });
    }
    
    conversation.title = title;
    
    await delay(300);
    return HttpResponse.json(conversation);
  })
]; 