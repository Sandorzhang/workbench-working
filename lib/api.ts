import { ApiErrorResponse } from './api-types';

const API_BASE_URL = '/api';

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
      throw {
        message: '登录已过期，请重新登录',
        code: '401',
        details: {}
      } as ApiErrorResponse;
    }
    
    // 处理其他HTTP错误
    if (!response.ok) {
      console.error(`API请求失败: ${url} - 状态码: ${response.status}`);
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || '请求失败',
        code: response.status.toString(),
        details: errorData.details || {}
      } as ApiErrorResponse;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw {
        message: data.message || '请求失败',
        code: data.code || response.status.toString(),
        details: data
      } as ApiErrorResponse;
    }
    
    return data as T;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
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