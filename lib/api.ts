import { ApiErrorResponse } from './api-types';

const API_BASE_URL = '/api';
const MSW_READY_TIMEOUT = 5000; // 5秒超时

// 等待MSW准备就绪
const waitForMsw = async (): Promise<boolean> => {
  // 只在浏览器环境中等待MSW
  if (typeof window === 'undefined') return true;
  
  // 如果MSW已经就绪，直接返回
  if (window.__MSW_READY__ === true) {
    console.log('MSW已就绪，继续API请求');
    return true;
  }
  
  console.log('等待MSW初始化...');
  
  // 等待MSW就绪，最多等待MSW_READY_TIMEOUT毫秒
  return new Promise(resolve => {
    const startTime = Date.now();
    
    const checkMswReady = () => {
      // 如果MSW已就绪或超时，则解析Promise
      if (window.__MSW_READY__ === true) {
        console.log('MSW已就绪，继续API请求');
        resolve(true);
        return;
      }
      
      // 检查是否超时
      if (Date.now() - startTime > MSW_READY_TIMEOUT) {
        console.warn('等待MSW就绪超时，继续API请求（可能会导致错误）');
        resolve(false);
        return;
      }
      
      // 继续等待
      setTimeout(checkMswReady, 100);
    };
    
    checkMswReady();
  });
};

// 为请求添加认证头
const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (token) {
    console.log(`添加认证头，token: ${token.substring(0, 5)}...`);
  } else {
    console.log('没有token，使用无认证头');
  }
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// 通用请求处理
async function handleRequest<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    // 在开发环境中等待MSW就绪
    if (process.env.NODE_ENV === 'development') {
      await waitForMsw();
    }
    
    // 每次请求时重新获取认证头，确保使用最新的token
    const headers = {
      ...getAuthHeaders(),
      ...options.headers
    };

    // 检查是否有认证头并记录日志
    const hasAuthHeader = 'Authorization' in headers;
    console.log(`API请求: ${url} - Authorization头: ${hasAuthHeader ? '已设置' : '未设置'}`);
    
    // 执行请求
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // 处理401认证错误
    if (response.status === 401) {
      console.error('认证失败 (401)，清除token并提示用户重新登录');
      // 清除无效token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // 添加导航到登录页的逻辑，如果在客户端
        console.log('尝试重定向到登录页');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || '登录已过期，请重新登录',
        code: '401',
        details: errorData.details || {}
      } as ApiErrorResponse;
    }
    
    // 先检查响应类型
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error(`API返回了HTML而不是JSON: ${url}`);
      const htmlText = await response.text();
      console.error('返回的HTML片段:', htmlText.substring(0, 200) + '...');
      throw {
        message: '服务器返回了HTML而不是JSON，请检查API路径或MSW配置',
        code: 'INVALID_RESPONSE_TYPE',
        details: { contentType, htmlSnippet: htmlText.substring(0, 200) }
      } as ApiErrorResponse;
    }
    
    // 尝试解析响应
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('响应解析失败:', parseError);
      
      // 尝试获取文本响应以提供更多诊断信息
      let responseText = '';
      try {
        // 克隆响应，因为原始响应已被消费
        const clonedResponse = response.clone();
        responseText = await clonedResponse.text();
        console.error('响应内容预览:', responseText.substring(0, 200));
      } catch (textError) {
        console.error('无法获取响应文本:', textError);
      }
      
      throw {
        message: '服务器响应格式错误',
        code: response.status.toString(),
        details: { parseError, responsePreview: responseText.substring(0, 200) }
      } as ApiErrorResponse;
    }
    
    // 处理非成功状态码
    if (!response.ok) {
      console.error(`API请求失败: ${url} - 状态码: ${response.status}`, data);
      throw {
        message: data.message || `请求失败 (${response.status})`,
        code: response.status.toString(),
        details: data.details || data
      } as ApiErrorResponse;
    }
    
    return data as T;
  } catch (error) {
    console.error('API请求错误:', error);
    
    // 确保返回标准化的错误格式
    if ((error as ApiErrorResponse).code) {
      throw error;
    }
    
    // 创建更健壮的错误对象
    const standardError: ApiErrorResponse = {
      message: error instanceof Error ? error.message : '请求失败',
      code: 'UNKNOWN',
      details: { originalError: error }
    };
    
    console.log('标准化API错误:', standardError);
    throw standardError;
  }
}

// 确保声明全局类型
declare global {
  interface Window {
    __MSW_READY__?: boolean;
  }
}

// API请求函数
export const api = {
  // 用户认证
  auth: {
    login: (username: string, password: string) => 
      handleRequest(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      }),
    
    loginWithCode: (phone: string, code: string) => 
      handleRequest(`${API_BASE_URL}/auth/login-with-code`, {
        method: 'POST',
        body: JSON.stringify({ phone, code })
      }),
    
    sendVerificationCode: (phone: string) => 
      handleRequest(`${API_BASE_URL}/auth/send-code`, {
        method: 'POST',
        body: JSON.stringify({ phone })
      }),
    
    getCurrentUser: () => 
      handleRequest(`${API_BASE_URL}/auth/me`),
      
    logout: () => {
      // 首先清除本地token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      
      // 然后调用退出登录API (如果在浏览器环境)
      if (typeof window !== 'undefined') {
        return fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: getAuthHeaders()
        })
        .then(response => {
          if (!response.ok && response.status !== 401) {
            // 如果不是401错误（表示已经没有有效会话），则记录错误
            console.warn('登出API调用返回非200状态码:', response.status);
          }
          // 即使API调用失败，也返回成功，因为我们已经清除了本地存储
          return Promise.resolve();
        })
        .catch(error => {
          console.error('登出API调用失败:', error);
          // 因为我们已经清除了本地存储，即使API调用失败，也视为登出成功
          return Promise.resolve();
        });
      }
      
      // 如果不在浏览器环境，直接返回成功
      return Promise.resolve();
    }
  },
  
  // 工作台配置
  workbench: {
    getConfig: () => 
      handleRequest(`${API_BASE_URL}/workbench-config`),
      
    getModule: (id: string) => 
      handleRequest(`${API_BASE_URL}/workbench-config/${id}`),
      
    updatePreferences: (modules: string[]) => 
      handleRequest(`${API_BASE_URL}/workbench-config/preferences`, {
        method: 'POST',
        body: JSON.stringify({ modules })
      })
  },
  
  // 智能体
  agents: {
    getList: () => 
      handleRequest(`${API_BASE_URL}/agents`),
      
    getDetails: (id: string) => 
      handleRequest(`${API_BASE_URL}/agents/${id}`),
      
    sendMessage: (id: string, message: string) => 
      handleRequest(`${API_BASE_URL}/agents/${id}/chat`, {
        method: 'POST',
        body: JSON.stringify({ message })
      })
  },
  
  // 日历事件
  calendar: {
    getEvents: (startDate?: string, endDate?: string) => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      return handleRequest(`${API_BASE_URL}/calendar-events${queryString}`);
    },
    
    createEvent: (event: any) => 
      handleRequest(`${API_BASE_URL}/calendar-events`, {
        method: 'POST',
        body: JSON.stringify(event)
      }),
      
    updateEvent: (id: string, event: any) => 
      handleRequest(`${API_BASE_URL}/calendar-events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(event)
      }),
      
    deleteEvent: (id: string) => 
      handleRequest(`${API_BASE_URL}/calendar-events/${id}`, {
        method: 'DELETE'
      })
  },
  
  // 教案
  teachingPlans: {
    getList: (page = 1, pageSize = 10) => 
      handleRequest(`${API_BASE_URL}/teaching-plans?page=${page}&pageSize=${pageSize}`),
      
    getDetails: (id: string) => 
      handleRequest(`${API_BASE_URL}/teaching-plans/${id}`),
      
    create: (plan: any) => 
      handleRequest(`${API_BASE_URL}/teaching-plans`, {
        method: 'POST',
        body: JSON.stringify(plan)
      }),
      
    update: (id: string, plan: any) => 
      handleRequest(`${API_BASE_URL}/teaching-plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(plan)
      }),
      
    delete: (id: string) => 
      handleRequest(`${API_BASE_URL}/teaching-plans/${id}`, {
        method: 'DELETE'
      })
  }
}; 