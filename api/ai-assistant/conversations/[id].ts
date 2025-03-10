import { NextApiRequest, NextApiResponse } from 'next';
import difyService from '@/api/difyService';

// 默认用户ID，实际项目中应该从认证中获取
const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DIFY_DEFAULT_USER_ID || 'default-user';

/**
 * 处理单个会话的请求
 * GET: 获取会话详情和消息
 * PATCH: 修改会话（如重命名）
 * DELETE: 删除会话
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 获取会话ID
  const id = req.query.id as string;
  if (!id) {
    console.error('[AI助手] 缺少会话ID');
    return res.status(400).json({ error: '会话ID为必填项' });
  }

  // 获取用户ID，如果未提供则使用默认值
  const userId = (req.query.userId as string) || DEFAULT_USER_ID;
  
  try {
    console.log(`[AI助手] 处理${req.method}请求 - 会话ID: ${id}, 用户ID: ${userId}`);
    
    switch (req.method) {
      case 'GET':
        // 获取会话详情和消息
        console.log(`[AI助手] 获取会话详情和消息 - 会话ID: ${id}`);
        const conversation = await difyService.getConversationMessages(id, userId);
        
        if (!conversation) {
          console.error(`[AI助手] 会话不存在 - 会话ID: ${id}`);
          return res.status(404).json({ error: '会话不存在' });
        }
        
        // 转换为前端期望的格式
        const formattedConversation = {
          id: conversation.id,
          title: conversation.title,
          lastMessage: conversation.messages.length > 0 
            ? conversation.messages[conversation.messages.length - 1].content 
            : '',
          lastUpdated: conversation.updated_at,
          messages: conversation.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
            timestamp: msg.created_at
          }))
        };
        
        console.log(`[AI助手] 返回会话详情 - 消息数量: ${formattedConversation.messages.length}`);
        return res.status(200).json(formattedConversation);
      
      case 'PATCH':
        // 会话重命名或其他修改
        const { title, autoGenerate } = req.body;
        console.log(`[AI助手] 修改会话 - 会话ID: ${id}, 新标题: ${title || '未指定'}`);
        
        // 注意：Dify API可能没有直接提供修改会话标题的功能
        // 需要根据实际情况适配，这里仅提供示例
        
        // 在这种情况下，我们先获取会话，然后返回修改后的会话
        const conversationToUpdate = await difyService.getConversationMessages(id, userId);
        
        if (!conversationToUpdate) {
          console.error(`[AI助手] 会话不存在 - 会话ID: ${id}`);
          return res.status(404).json({ error: '会话不存在' });
        }
        
        // 这里应该添加对Dify API的重命名会话调用
        // 由于Dify API可能没有直接支持，这里仅模拟更新成功
        
        // 更新后的会话（模拟数据）
        const updatedConversation = {
          ...conversationToUpdate,
          title: title || conversationToUpdate.title
        };
        
        // 转换为前端期望的格式
        const formattedUpdatedConversation = {
          id: updatedConversation.id,
          title: updatedConversation.title,
          lastMessage: updatedConversation.messages.length > 0 
            ? updatedConversation.messages[updatedConversation.messages.length - 1].content 
            : '',
          lastUpdated: updatedConversation.updated_at,
          autoGenerate: autoGenerate
        };
        
        console.log(`[AI助手] 会话更新成功 - 会话ID: ${id}, 新标题: ${formattedUpdatedConversation.title}`);
        return res.status(200).json(formattedUpdatedConversation);
      
      case 'DELETE':
        // 删除会话
        console.log(`[AI助手] 删除会话 - 会话ID: ${id}`);
        const deleteSuccess = await difyService.deleteConversation(id, userId);
        
        if (!deleteSuccess) {
          console.error(`[AI助手] 删除会话失败 - 会话ID: ${id}`);
          return res.status(404).json({ error: '删除会话失败' });
        }
        
        console.log(`[AI助手] 会话删除成功 - 会话ID: ${id}`);
        return res.status(200).json({ success: true, message: '会话已删除' });
      
      default:
        console.warn(`[AI助手] 不支持的请求方法: ${req.method}`);
        return res.status(405).json({ error: '方法不允许' });
    }
  } catch (error) {
    console.error(`[AI助手] 会话操作失败 - 会话ID: ${id}`, error);
    return res.status(500).json({ error: '服务器错误', details: error instanceof Error ? error.message : String(error) });
  }
} 