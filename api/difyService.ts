import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  DifyConversation,
  DifyConversationDetail,
  DifyChatRequest,
  DifyChatResponse,
  DifyMessage
} from '@/types/dify';

class DifyService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;
  private isInitialized: boolean;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_DIFY_API_KEY || '';
    this.baseUrl = process.env.NEXT_PUBLIC_DIFY_API_URL || 'https://api.dify.ai/v1';
    this.isInitialized = false;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      timeout: 30000 // 30秒超时
    });
    
    // 配置请求拦截器 - 记录请求日志
    this.client.interceptors.request.use(config => {
      console.log(`[DifyAPI请求] ${config.method?.toUpperCase()} ${config.url}`);
      if (process.env.NODE_ENV === 'development') {
        console.log('[DifyAPI请求参数]', config.params || config.data);
      }
      return config;
    });
    
    // 响应拦截器 - 只记录，不修改数据
    this.client.interceptors.response.use(
      response => {
        // 成功响应处理
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DifyAPI响应] ${response.status} ${response.config.url}`);
          
          // 只在开发环境打印详细响应数据，并限制大小
          const responseDataStr = JSON.stringify(response.data).substring(0, 500);
          console.log(`[DifyAPI响应数据] ${responseDataStr}${responseDataStr.length >= 500 ? '...' : ''}`);
        }
        return response;
      },
      (error: AxiosError) => {
        // 错误响应处理
        const status = error.response?.status;
        const url = error.config?.url;
        
        console.error(`[DifyAPI错误] ${status} ${url}`);
        
        if (error.response?.data) {
          console.error('[DifyAPI错误详情]', error.response.data);
        }
        
        // 处理特定状态码的错误
        if (status === 401) {
          console.error('Dify API认证失败: API密钥无效或已过期');
        } else if (status === 404) {
          console.error('Dify API资源不存在');
        } else if (status === 429) {
          console.error('Dify API请求速率限制');
        }
        
        return Promise.reject(error);
      }
    );
    
    // 检查初始化状态
    this.checkInitialization();
  }
  
  /**
   * 检查API服务是否正确初始化
   */
  private checkInitialization() {
    // 检查API密钥是否已设置
    if (!this.apiKey) {
      console.warn('Dify API密钥未设置，请检查环境变量NEXT_PUBLIC_DIFY_API_KEY');
      return;
    }
    
    this.isInitialized = true;
    console.log('Dify API服务已初始化');
  }

  /**
   * 获取会话列表
   * @param userId 用户ID
   * @returns 会话列表
   */
  async getConversations(userId: string): Promise<DifyConversation[]> {
    try {
      if (!this.isInitialized) {
        console.error('Dify API服务未正确初始化');
        return [];
      }
      
      const response = await this.client.get('/conversations', {
        params: { user: userId }
      });
      
      // 确保返回数组数据
      const responseData = response.data;
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }
      
      return [];
    } catch (error) {
      this.handleError('获取会话列表失败', error);
      return [];
    }
  }

  /**
   * 获取会话详情和消息历史
   * @param conversationId 会话ID
   * @param userId 用户ID
   * @returns 会话详情，包含消息历史
   */
  async getConversationMessages(conversationId: string, userId: string): Promise<DifyConversationDetail | null> {
    try {
      if (!this.isInitialized) {
        console.error('Dify API服务未正确初始化');
        return null;
      }
      
      // 获取会话详情
      const conversationResponse = await this.client.get(`/conversations/${conversationId}`, {
        params: { user: userId }
      });
      
      // 获取会话消息历史
      const messagesResponse = await this.client.get('/messages', {
        params: { 
          conversation_id: conversationId,
          user: userId,
          limit: 100 // 可以根据需要调整
        }
      });
      
      // 确保能够正确获取会话详情和消息
      const convData = conversationResponse.data;
      const messagesData = messagesResponse.data;
      
      if (!convData) {
        console.error('获取会话详情失败');
        return null;
      }
      
      // 组合结果并确保符合类型定义
      const conversationDetail: DifyConversationDetail = {
        id: convData.id || conversationId,
        title: convData.title || '未命名会话',
        created_at: convData.created_at || new Date().toISOString(),
        updated_at: convData.updated_at || new Date().toISOString(),
        status: (convData.status as 'normal' | 'archived') || 'normal',
        messages: []
      };
      
      // 处理消息数据
      if (messagesData && messagesData.data && Array.isArray(messagesData.data)) {
        conversationDetail.messages = messagesData.data as DifyMessage[];
      }
      
      return conversationDetail;
    } catch (error) {
      this.handleError('获取会话消息历史失败', error);
      return null;
    }
  }

  /**
   * 删除会话
   * @param conversationId 会话ID
   * @param userId 用户ID
   * @returns 删除是否成功
   */
  async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.error('Dify API服务未正确初始化');
        return false;
      }
      
      const response = await this.client.delete(`/conversations/${conversationId}`, {
        data: { user: userId }
      });
      
      return response.status === 200;
    } catch (error) {
      this.handleError('删除会话失败', error);
      return false;
    }
  }

  /**
   * 发送聊天消息
   * @param request 聊天请求参数
   * @returns 聊天响应
   */
  async sendChatMessage(request: DifyChatRequest): Promise<DifyChatResponse | null> {
    try {
      if (!this.isInitialized) {
        console.error('Dify API服务未正确初始化');
        return null;
      }
      
      const response = await this.client.post('/chat-messages', request);
      const responseData = response.data;
      
      // 确保返回对象符合DifyChatResponse类型
      if (responseData) {
        return {
          conversation_id: responseData.conversation_id || '',
          message_id: responseData.message_id || '',
          answer: responseData.answer || ''
        };
      }
      
      return null;
    } catch (error) {
      this.handleError('发送聊天消息失败', error);
      return null;
    }
  }
  
  /**
   * 统一处理错误
   * @param message 错误描述
   * @param error 错误对象
   */
  private handleError(message: string, error: unknown): void {
    console.error(`[DifyAPI]: ${message}`);
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error(`状态码: ${axiosError.response?.status || '未知'}`);
      console.error(`错误信息: ${axiosError.message}`);
      
      if (axiosError.response?.data) {
        console.error('响应数据:', axiosError.response.data);
      }
    } else {
      console.error('错误详情:', error);
    }
  }
}

// 导出单例实例
const difyService = new DifyService();
export default difyService; 