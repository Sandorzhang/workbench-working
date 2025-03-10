import { NextApiRequest, NextApiResponse } from 'next';
import difyService from '@/api/difyService';

// 默认用户ID，实际项目中应该从认证中获取
const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DIFY_DEFAULT_USER_ID || 'default-user';

/**
 * 处理会话相关请求
 * GET: 获取会话列表
 * POST: 创建新会话
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 获取用户ID，如果未提供则使用默认值
  const userId = (req.query.userId as string) || DEFAULT_USER_ID;
  
  try {
    console.log(`[AI助手] 处理${req.method}请求 - 用户ID: ${userId}`);
    
    // 根据请求方法处理不同的操作
    switch (req.method) {
      case 'GET':
        // 获取会话列表
        const agentId = req.query.agentId as string;
        console.log(`[AI助手] 获取会话列表 - 智能体ID: ${agentId || '未指定'}`);
        
        const conversations = await difyService.getConversations(userId);
        
        // 如果指定了agentId，则过滤只返回该agent的会话
        const filteredConversations = agentId 
          ? conversations
          : conversations;
           
        // 转换为前端期望的格式
        const formattedConversations = filteredConversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          lastMessage: '', // 需要从消息中获取最后一条
          lastUpdated: conv.updated_at,
          messages: [], // 会话列表不包含消息内容
          agentId: agentId || 'default' // 添加agentId字段以配前端期望
        }));
        
        console.log(`[AI助手] 返回${formattedConversations.length}个会话`);
        return res.status(200).json(formattedConversations);
        
      case 'POST':
        // 创建新会话时前端可能会发送一些初始参数
        const { agentId: newAgentId, title } = req.body;
        console.log(`[AI助手] 创建新会话 - 智能体ID: ${newAgentId || '未指定'}, 标题: ${title || '未指定'}`);
        
        // 这里直接调用Dify API创建会话
        // 注意：Dify API可能不直接支持创建空会话，可能需要发送一个初始消息
        // 这里我们假设可以通过发送首条系统消息来创建会话
        const initialMessage = {
          inputs: {},
          query: "初始化会话",
          response_mode: "blocking" as const,
          user: userId
        };
        
        console.log(`[AI助手] 发送初始消息创建会话`);
        const chatResponse = await difyService.sendChatMessage(initialMessage);
        
        if (!chatResponse) {
          console.error(`[AI助手] 创建会话失败 - 无响应`);
          return res.status(500).json({ error: '创建会话失败' });
        }
        
        // 获取新创建的会话详情
        console.log(`[AI助手] 获取新创建的会话详情 - 会话ID: ${chatResponse.conversation_id}`);
        const newConversation = await difyService.getConversationMessages(
          chatResponse.conversation_id,
          userId
        );
        
        if (!newConversation) {
          console.error(`[AI助手] 获取新会话详情失败 - 会话ID: ${chatResponse.conversation_id}`);
          return res.status(500).json({ error: '获取新会话详情失败' });
        }
        
        // 转换为前端期望的格式
        const formattedNewConversation = {
          id: newConversation.id,
          title: title || newConversation.title || "新的对话",
          lastMessage: '',
          lastUpdated: newConversation.updated_at,
          messages: newConversation.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
            timestamp: msg.created_at
          })),
          agentId: newAgentId || 'default'
        };
        
        console.log(`[AI助手] 成功创建新会话 - ID: ${formattedNewConversation.id}`);
        return res.status(201).json(formattedNewConversation);
        
      default:
        console.warn(`[AI助手] 不支持的请求方法: ${req.method}`);
        return res.status(405).json({ error: '方法不允许' });
    }
  } catch (error) {
    console.error('[AI助手] 会话操作失败:', error);
    return res.status(500).json({ error: '服务器错误', details: error instanceof Error ? error.message : String(error) });
  }
} 