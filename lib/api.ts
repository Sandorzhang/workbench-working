import { ApiErrorResponse } from './api-types';

const API_BASE_URL = '/api';

// 为请求添加认证头
const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
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
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });
    
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
      // 首先尝试调用退出登录API
      try {
        // 不等待API响应，因为即使API调用失败我们也要清除本地token
        if (typeof window !== 'undefined') {
          fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: getAuthHeaders()
          }).catch(error => {
            console.error('登出API调用失败:', error);
          });
        }
      } catch (error) {
        console.error('处理登出过程中出错:', error);
      }
      
      // 无论API调用成功与否，都清除本地token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      
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