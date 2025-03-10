import { NextApiRequest, NextApiResponse } from 'next';
import difyService from '@/api/difyService';
import { DifyChatRequest } from '@/types/dify';

// 默认用户ID，实际项目中应该从认证中获取
const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DIFY_DEFAULT_USER_ID || 'default-user';

/**
 * 处理聊天消息发送请求
 * POST: 发送新消息
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 只允许POST方法
  if (req.method !== 'POST') {
    console.warn(`[AI助手] 不支持的请求方法: ${req.method}`);
    return res.status(405).json({ error: '方法不允许' });
  }

  // 获取请求参数
  const { message, conversationId, agentId } = req.body;
  
  // 参数验证
  if (!message) {
    console.error('[AI助手] 消息内容为空');
    return res.status(400).json({ error: '消息内容为必填项' });
  }
  
  if (!conversationId) {
    console.error('[AI助手] 会话ID为空');
    return res.status(400).json({ error: '会话ID为必填项' });
  }
  
  // 获取用户ID，如果未提供则使用默认值
  const userId = req.body.userId || DEFAULT_USER_ID;
  
  try {
    console.log(`[AI助手] 发送聊天消息 - 会话ID: ${conversationId}, 用户ID: ${userId}, 智能体ID: ${agentId || '未指定'}`);
    console.log(`[AI助手] 消息内容: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`);
    
    // 构建请求参数
    const chatRequest: DifyChatRequest = {
      inputs: {}, // 这里可以放置任何额外的输入参数
      query: message,
      response_mode: "blocking", // 或 "streaming" 如果要支持流式响应
      conversation_id: conversationId,
      user: userId
    };
    
    // 发送消息到Dify
    console.log(`[AI助手] 调用Dify API发送消息`);
    const startTime = Date.now();
    const response = await difyService.sendChatMessage(chatRequest);
    const responseTime = Date.now() - startTime;
    
    if (!response) {
      console.error(`[AI助手] 发送消息失败 - 无响应`);
      return res.status(500).json({ error: '发送消息失败' });
    }
    
    console.log(`[AI助手] 获取到助手回复 - 响应时间: ${responseTime}ms`);
    
    // 从响应中提取助手回复
    const assistantMessage = {
      id: response.message_id,
      content: response.answer,
      role: 'assistant',
      timestamp: new Date().toISOString()
    };
    
    console.log(`[AI助手] 返回助手回复 - 消息ID: ${assistantMessage.id}, 回复长度: ${assistantMessage.content.length}`);
    return res.status(200).json(assistantMessage);
  } catch (error) {
    console.error('[AI助手] 发送消息失败:', error);
    return res.status(500).json({ error: '服务器错误', details: error instanceof Error ? error.message : String(error) });
  }
} 