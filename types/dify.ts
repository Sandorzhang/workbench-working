// Dify API 相关类型定义

// 通用响应接口
export interface DifyResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// 聊天消息类型
export interface DifyMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// 会话类型
export interface DifyConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  status: 'normal' | 'archived';
}

// 会话详情（包含消息历史）
export interface DifyConversationDetail extends DifyConversation {
  messages: DifyMessage[];
}

// 聊天请求参数
export interface DifyChatRequest {
  inputs: Record<string, string | number | boolean | null>;
  query: string;
  response_mode: 'streaming' | 'blocking';
  conversation_id?: string;
  user: string;
}

// 聊天响应
export interface DifyChatResponse {
  conversation_id: string;
  message_id: string;
  answer: string;
}

// 会话列表请求参数
export interface DifyConversationsRequest {
  page?: number;
  limit?: number;
  user: string;
}

// 删除会话请求
export interface DifyDeleteConversationRequest {
  user: string;
} 