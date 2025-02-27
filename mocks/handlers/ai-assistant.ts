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

// AI助手的预设回复
const presetResponses: Record<string, Record<string, string>> = {
  // 默认助手（通用）
  "default": {
    "greeting": "您好！我是您的智能教学助手，可以帮助您解决教学设计、课堂管理、学生评价等方面的问题。请问有什么我可以帮助您的？",
    "class_activity": "设计课堂活动时，应考虑以下几个方面：\n\n1. 明确教学目标\n2. 了解学生特点和兴趣\n3. 设计多样化的互动环节\n4. 准备适当的教学资源\n5. 预留时间进行总结和反思\n\n不同学科可以采用不同的活动形式，如角色扮演、小组讨论、实践操作等。",
    "student_evaluation": "现代学生评价应该是多元化的，建议从以下几个维度进行：\n\n1. 学业表现评价\n2. 课堂参与度评价\n3. 合作能力评价\n4. 创新思维评价\n5. 自我管理评价\n\n重要的是既关注结果也关注过程，既看到学生的优点也帮助学生改进不足。",
    "classroom_management": "有效的课堂管理策略包括：\n\n1. 建立明确的课堂规则和流程\n2. 培养积极的师生关系\n3. 使用分层教学策略\n4. 设计吸引人的教学内容\n5. 及时处理问题行为\n6. 表扬和鼓励积极行为\n\n重要的是保持一致性并理解学生行为背后的原因。",
    "teaching_resources": "优质教学资源的特点是：\n\n1. 与教学目标紧密相关\n2. 适合学生的认知水平\n3. 具有互动性和吸引力\n4. 可以根据需要灵活调整\n5. 促进深度思考和理解\n\n现代教学可以利用多媒体资源、在线平台、实物教具等多种资源类型。",
    "fallback": "作为教育工作者，我建议综合考虑学生特点、教学目标和教学资源，采用多样化的教学方法，并根据实际教学效果进行调整和优化。您对这个方向有什么具体问题吗？"
  },
  // 智能教学助手 (ID: 1)
  "1": {
    "greeting": "您好！我是智能教学助手，专注于帮助教师设计课堂活动、解决教学难题，提供学生评价建议。请问今天有什么教学问题需要我协助解决？",
    "class_activity": "针对课堂活动设计，我推荐：\n\n1. 目标导向：明确每个活动的教学目标\n2. 多样互动：设计师生、生生互动环节\n3. 节奏变化：交替使用不同类型的活动\n4. 差异化设计：照顾不同学习风格和能力的学生\n5. 结果导向：确保活动能产生可评估的学习成果\n\n我可以针对您的具体学科提供更详细的活动设计。",
    "fallback": "作为智能教学助手，我建议您可以从教学设计、课堂管理和学生评价三个维度思考这个问题。每个班级和学生的情况不同，教学策略需要因地制宜。您需要我在哪个方面提供更具体的建议吗？"
  },
  // 学科备课专家 (ID: 2)
  "2": {
    "greeting": "您好！我是学科备课专家，专注于提供教案设计和知识点讲解。请问您需要哪个学科的备课支持？",
    "teaching_plan": "一份优质的教案应包含以下要素：\n\n1. 明确的教学目标\n2. 教学重点与难点\n3. 详细的教学过程\n4. 教学资源清单\n5. 课堂练习和作业设计\n6. 教学反思部分\n\n我可以帮您设计特定学科和年级的教案，请告诉我您的具体需求。",
    "fallback": "作为学科备课专家，我建议从教学目标、重点难点、教学策略和评价方式几个方面系统思考。不同的教学内容需要采用不同的教学方法。您希望我针对哪个具体知识点或教学单元提供备课建议？"
  },
  // 创意教学设计师 (ID: 3)
  "3": {
    "greeting": "您好！我是创意教学设计师，专注于提供创新教学方法和活动设计，激发学生学习兴趣。请问您想了解哪方面的创新教学？",
    "creative_teaching": "创新教学的核心是突破传统教学模式的局限，以下是一些创意教学方法：\n\n1. 故事化教学：将知识点融入引人入胜的故事中\n2. 游戏化学习：设计教育游戏，增强学习体验\n3. 角色扮演：让学生通过扮演角色深入理解知识\n4. 创客教育：通过动手制作培养创新思维\n5. 跨学科整合：打破学科界限，促进知识迁移\n\n我可以为您的具体教学内容提供创意设计方案。",
    "fallback": "作为创意教学设计师，我建议尝试突破常规思维，将艺术、游戏、技术等元素融入教学中。创新不一定是全新的方法，而是对现有方法的创造性改进。您希望我针对哪个具体场景设计创新教学活动？"
  }
};

// 根据智能体ID和关键词生成AI回复
const generateResponse = (message: string, agentId?: string): string => {
  // 确定使用哪个智能体的回复模板
  const responseSet = agentId && presetResponses[agentId] 
    ? presetResponses[agentId] 
    : presetResponses.default;

  // 根据消息内容匹配回复
  if (message.toLowerCase().includes("hello") || message.includes("你好")) {
    return responseSet.greeting || presetResponses.default.greeting;
  } else if (message.includes("课堂活动") || message.includes("教学活动")) {
    return responseSet.class_activity || presetResponses.default.class_activity;
  } else if (message.includes("评价") || message.includes("考核")) {
    return responseSet.student_evaluation || presetResponses.default.student_evaluation;
  } else if (message.includes("课堂管理") || message.includes("学生行为")) {
    return responseSet.classroom_management || presetResponses.default.classroom_management;
  } else if (message.includes("资源") || message.includes("教材")) {
    return responseSet.teaching_resources || presetResponses.default.teaching_resources;
  } else if (message.includes("教案") || message.includes("备课")) {
    return responseSet.teaching_plan || presetResponses.default.teaching_resources;
  } else if (message.includes("创新") || message.includes("创意")) {
    return responseSet.creative_teaching || (responseSet.fallback || presetResponses.default.fallback);
  } else {
    return responseSet.fallback || presetResponses.default.fallback;
  }
};

// 获取智能体名称
const getAgentName = async (agentId: string): Promise<string> => {
  try {
    // 这里可以模拟从API获取智能体信息
    const agentNames: Record<string, string> = {
      "1": "智能教学助手",
      "2": "学科备课专家",
      "3": "创意教学设计师",
      "4": "学习分析专家",
      "5": "教育研究助手",
      "6": "课程设计专家"
    };
    
    return agentNames[agentId] || "智能助手";
  } catch {
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
      agentId
    };
    
    conversations.push(newConversation);
    
    await delay(300);
    return HttpResponse.json(newConversation);
  }),
  
  // 发送聊天消息并获取AI回复
  http.post<any, ChatRequest>('*/api/ai-assistant/chat', async ({ request }) => {
    const req = await request.json() as ChatRequest;
    const { message, conversationId, agentId } = req;
    
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // 记录用户消息
    const userMessage: Message = {
      id: generateId(),
      content: message,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    conversation.messages.push(userMessage);
    
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