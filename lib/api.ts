import { ApiErrorResponse } from './api-types';

// 使用环境变量配置API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
const API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENV || 'development';
const MSW_READY_TIMEOUT = 5000; // 5秒超时

// 等待MSW准备就绪
const waitForMsw = async (): Promise<boolean> => {
  // 只在启用了API模拟的环境中等待MSW
  if (!API_MOCKING) {
    console.log(`当前环境(${ENVIRONMENT})未启用API模拟，跳过MSW初始化等待`);
    return true;
  }
  
  // 只在浏览器环境中等待MSW
  if (typeof window === 'undefined') return true;
  
  // 如果MSW已经就绪，直接返回
  if (window.__MSW_READY__ === true) {
    console.log('MSW已就绪，继续API请求');
    return true;
  }
  
  // 不再等待MSW，直接继续API请求
  console.log('不再等待MSW初始化，直接继续API请求');
  return true;
};

// 为请求添加认证头
const getAuthHeaders = (): HeadersInit => {
  // 确保在客户端环境
  if (typeof window === 'undefined') {
    return { 'Content-Type': 'application/json' };
  }
  
  // 从localStorage获取令牌，确保它是字符串
  let accessToken = localStorage.getItem('accessToken') || '';
  
  // 如果localStorage中没有token，尝试从内存获取
  if (!accessToken && window.__AUTH_TOKEN__) {
    accessToken = window.__AUTH_TOKEN__;
    console.log('使用内存中的token:', accessToken.substring(0, 10) + '...');
  }
  
  if (accessToken) {
    const tokenPreview = accessToken.length > 10 ? 
      `${accessToken.substring(0, 10)}...` : 
      '(令牌格式可能不正确)';
    
    console.log(`添加认证头，token: ${tokenPreview}`);
    
    // 检查令牌是否是Bearer格式
    if (!accessToken.trim()) {
      console.warn('警告: 令牌为空字符串');
    }
    
    // 返回带认证头的headers
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };
  } else {
    console.log('没有token，使用无认证头');
    return { 'Content-Type': 'application/json' };
  }
};

// 通用请求处理
async function handleRequest<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    // 只在启用了API模拟的环境中等待MSW
    if (API_MOCKING) {
      await waitForMsw();
    }
    
    // 处理完整URL情况 - 如果URL已经是绝对URL，则直接使用
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
    
    // 每次请求时重新获取认证头，确保使用最新的token
    const headers = {
      ...getAuthHeaders(),
      ...options.headers
    };

    // 检查是否有认证头并记录日志
    const hasAuthHeader = 'Authorization' in headers;
    const authValue = hasAuthHeader ? (headers as any)['Authorization'] : '未设置';
    console.log(`API请求: ${fullUrl}`);
    console.log(`环境: ${ENVIRONMENT} - Authorization头: ${authValue}`);
    
    if (hasAuthHeader) {
      // 验证localStorage中的token
      const storedToken = localStorage.getItem('accessToken');
      console.log(`localStorage中的token: ${storedToken ? storedToken.substring(0, 10) + '...' : '不存在'}`);
    }

    // 执行请求
    const response = await fetch(fullUrl, {
      ...options,
      headers
    });
    
    // 处理401认证错误
    if (response.status === 401) {
      console.error('认证失败 (401)，清除token并提示用户重新登录');
      // 清除无效token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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
    
    // 处理404错误
    if (response.status === 404) {
      console.error(`API路径不存在 (404): ${fullUrl}`);
      
      // 尝试获取响应内容以诊断问题
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const htmlText = await response.text();
        console.error('返回的HTML片段:', htmlText.substring(0, 200) + '...');
        throw {
          message: 'API路径不存在',
          code: 'API_PATH_NOT_FOUND',
          details: { url: fullUrl, htmlSnippet: htmlText.substring(0, 200) }
        } as ApiErrorResponse;
      }
      
      throw {
        message: 'API路径不存在，请检查请求路径',
        code: '404',
        details: { url: fullUrl }
      } as ApiErrorResponse;
    }
    
    // 先检查响应类型
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error(`API返回了HTML而不是JSON: ${fullUrl}`);
      const htmlText = await response.text();
      console.error('返回的HTML片段:', htmlText.substring(0, 200) + '...');
      throw {
        message: '服务器返回了HTML而不是JSON，请检查API路径',
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
      console.error(`API请求失败: ${fullUrl} - 状态码: ${response.status}`, data);
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
    __AUTH_TOKEN__?: string;
    __MSW_READY__?: boolean;
  }
}

// API请求函数
export const api = {
  // 用户认证
  auth: {
    login: async (username: string, password: string) => {
      console.log(`尝试登录，用户名: ${username}`);
      
      try {
        return await handleRequest(`/auth/backend/login`, {
          method: 'POST',
          body: JSON.stringify({ identity: username, verify: password, type: 'ACCOUNT' })
        });
      } catch (error) {
        console.error('登录失败:', error);
        // 重新抛出错误以便被上层处理
        throw error;
      }
    },
    
    loginWithCode: (phone: string, code: string) => 
      handleRequest(`/auth/login-with-code`, {
        method: 'POST',
        body: JSON.stringify({ phone, code })
      }),
    
    sendVerificationCode: (phone: string) => 
      handleRequest(`/auth/send-code`, {
        method: 'POST',
        body: JSON.stringify({ phone })
      }),
    
    getCurrentUser: async () => {
      // 尝试多个可能的API路径
      const possiblePaths = [
        '/auth/backend/me',            // 首先尝试当前路径
        '/auth/me',                    // 尝试不带backend的路径
        '/user/current',               // 尝试另一种常见用户路径
        '/user/info',                  // 尝试另一种常见用户路径
        '/auth/backend/user/current',  // 更多可能的路径
        '/api/auth/me'                 // 尝试带api前缀的路径
      ];
      
      // 优先从localStorage获取
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            return { code: 0, msg: '成功', data: JSON.parse(storedUser) };
          } catch (e) {
            console.error('解析localStorage中的用户数据失败', e);
            // 解析失败继续尝试API调用
          }
        }
      }
      
      // 使用Promise.any尝试所有可能的路径，返回第一个成功的
      try {
        // 尝试第一个路径
        return await handleRequest(`${possiblePaths[0]}`);
      } catch (error) {
        console.error(`尝试路径 ${possiblePaths[0]} 失败:`, error);
        
        // 顺序尝试其他路径
        for (let i = 1; i < possiblePaths.length; i++) {
          try {
            console.log(`尝试备选路径: ${possiblePaths[i]}`);
            return await handleRequest(`${possiblePaths[i]}`);
          } catch (pathError) {
            console.error(`尝试路径 ${possiblePaths[i]} 失败:`, pathError);
            // 继续尝试下一个路径
          }
        }
        
        // 所有路径都失败
        throw new Error('无法获取用户信息，所有API路径都失败');
      }
    },
    
    logout: () => 
      handleRequest(`/auth/backend/logout`, {
        method: 'POST'
      })
  },
  
  // 用户管理API
  userApi: {
    // 获取用户列表
    getUsers: (filters?: { role?: string; school?: string }) => {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.role) params.append('role', filters.role);
        if (filters.school) params.append('school', filters.school);
      }
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return handleRequest(`${API_BASE_URL}/users${queryString}`);
    },
    
    // 获取单个用户
    getUser: (id: string) => 
      handleRequest(`${API_BASE_URL}/users/${id}`),
    
    // 创建用户
    createUser: (userData: any) => 
      handleRequest(`${API_BASE_URL}/users`, {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    
    // 更新用户
    updateUser: (id: string, userData: any) => 
      handleRequest(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      }),
    
    // 删除用户
    deleteUser: (id: string) => 
      handleRequest(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE'
      })
  },
  
  // 超级管理员专用API
  superadminApi: {
    // 获取所有用户
    getUsers: () => 
      handleRequest(`${API_BASE_URL}/superadmin/users`),
    
    // 获取单个用户
    getUser: (id: string) => 
      handleRequest(`${API_BASE_URL}/superadmin/users/${id}`),
    
    // 创建用户
    createUser: (userData: any) => 
      handleRequest(`${API_BASE_URL}/superadmin/users`, {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    
    // 更新用户
    updateUser: (id: string, userData: any) => 
      handleRequest(`${API_BASE_URL}/superadmin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      }),
    
    // 删除用户
    deleteUser: (id: string) => 
      handleRequest(`${API_BASE_URL}/superadmin/users/${id}`, {
        method: 'DELETE'
      }),
    
    // 更新用户状态（锁定/解锁）
    updateUserStatus: (id: string, status: 'active' | 'inactive' | 'locked') => 
      handleRequest(`${API_BASE_URL}/superadmin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
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
  
  // 单课教案
  teachingPlans: {
    getList: (page = 1, pageSize = 10) => 
      handleRequest(`${API_BASE_URL}/teaching-plans?page=${page}&pageSize=${pageSize}`),
    
    getDetails: (id: string) => 
      handleRequest(`${API_BASE_URL}/teaching-plans/${id}`)
  }
};

// 导出常用API模块，便于直接导入
export const { userApi, superadminApi, auth, workbench, calendar, agents } = api;