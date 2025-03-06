import { ApiErrorResponse } from './api-types';
import { envConfig } from './env-config';

// 使用环境配置
const API_BASE_URL = envConfig.apiBaseUrl;
const API_MOCKING = envConfig.apiMocking;
const ENVIRONMENT = envConfig.environment;
const MSW_READY_TIMEOUT = 5000; // 5秒超时

console.log(`[API客户端] 配置: API_BASE_URL=${API_BASE_URL}, API_MOCKING=${API_MOCKING}, ENV=${ENVIRONMENT}`);

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
  
  // 设置超时等待
  console.log(`等待MSW初始化，超时时间: ${MSW_READY_TIMEOUT}ms`);
  try {
    await new Promise<void>((resolve, reject) => {
      // 设置超时
      const timeout = setTimeout(() => {
        console.warn(`MSW初始化等待超时(${MSW_READY_TIMEOUT}ms)`);
        resolve();
      }, MSW_READY_TIMEOUT);
      
      // 监听MSW就绪状态变化
      const checkInterval = setInterval(() => {
        if (window.__MSW_READY__ === true) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          console.log('MSW已就绪，继续API请求');
          resolve();
        }
      }, 100);
    });
  } catch (error) {
    console.error('等待MSW过程中出错:', error);
  }
  
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
  
  // 如果localStorage中没有token，尝试从内存中获取
  if (!accessToken && window.__AUTH_TOKEN__) {
    console.log('从内存中获取token:', window.__AUTH_TOKEN__?.substring(0, 10) + '...');
    accessToken = window.__AUTH_TOKEN__ || '';
  }
  
  // 检查token是否有效
  const isTokenValid = accessToken && accessToken !== 'null' && accessToken !== 'undefined';
  
  // 日志token状态（不包含完整token内容）
  console.log(`认证头Token状态: ${isTokenValid ? '有效' : '无效'} - 长度: ${accessToken?.length || 0}`);

  // 确保不返回"Bearer null"或"Bearer undefined"
  if (!isTokenValid) {
    console.warn('请求中没有提供有效的访问令牌');
    // 没有token时只返回基本头信息，不包含Authorization头
    return { 'Content-Type': 'application/json' };
  }
  
  // 返回带有授权头的配置
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  };
};

// 构建API路径的辅助函数
const buildApiPath = (path: string): string => {
  // 处理API_BASE_URL，确保它没有尾随斜杠
  const baseUrl = API_BASE_URL.endsWith('/') 
    ? API_BASE_URL.slice(0, -1) 
    : API_BASE_URL;
  
  // 确保path有前导斜杠
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
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
    const fullUrl = url.startsWith('http') 
      ? url 
      : buildApiPath(url);
    
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
        return await handleRequest(`/auth/login`, {
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
    
    // 获取当前用户信息
    me: () => handleRequest(`/auth/me`),
    
    // 退出登录
    logout: () => handleRequest(`/auth/logout`, { method: 'POST' }),
  },
  
  // 用户管理
  users: {
    // 获取用户列表
    list: (page = 1, pageSize = 10, filters = {}) => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('pageSize', pageSize.toString());
      
      // 添加过滤条件
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      const queryString = `?${queryParams.toString()}`;
      return handleRequest(`/users${queryString}`);
    },
    
    // 获取单个用户
    get: (id: string) => 
      handleRequest(`/users/${id}`),
    
    // 创建用户
    create: (userData: any) => 
      handleRequest(`/users`, {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    
    // 更新用户
    update: (id: string, userData: any) => 
      handleRequest(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      }),
    
    // 删除用户
    delete: (id: string) => 
      handleRequest(`/users/${id}`, {
        method: 'DELETE'
      })
  },
  
  // 超级管理员API
  superadmin: {
    // 获取所有用户
    listUsers: () => 
      handleRequest(`/superadmin/users`),
    
    // 获取单个用户
    getUser: (id: string) => 
      handleRequest(`/superadmin/users/${id}`),
    
    // 创建用户
    createUser: (userData: any) => 
      handleRequest(`/superadmin/users`, {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    
    // 更新用户
    updateUser: (id: string, userData: any) => 
      handleRequest(`/superadmin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      }),
    
    // 删除用户
    deleteUser: (id: string) => 
      handleRequest(`/superadmin/users/${id}`, {
        method: 'DELETE'
      }),
    
    // 更新用户状态
    updateUserStatus: (id: string, status: 'active' | 'inactive') => 
      handleRequest(`/superadmin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
  },
  
  // 工作台配置
  workbench: {
    // 获取工作台配置
    getConfig: () => 
      handleRequest(`/workbench-config`),
    
    // 获取特定配置
    getConfigById: (id: string) => 
      handleRequest(`/workbench-config/${id}`),
    
    // 保存用户偏好设置
    savePreferences: (preferences: any) => 
      handleRequest(`/workbench-config/preferences`, {
        method: 'POST',
        body: JSON.stringify(preferences)
      })
  },
  
  // 智能助手
  agents: {
    // 获取所有助手
    list: () => 
      handleRequest(`/agents`),
    
    // 获取单个助手
    get: (id: string) => 
      handleRequest(`/agents/${id}`),
    
    // 与助手聊天
    chat: (id: string, message: string) => 
      handleRequest(`/agents/${id}/chat`, {
        method: 'POST',
        body: JSON.stringify({ message })
      })
  },
  
  // 日历事件
  calendar: {
    // 获取日历事件
    getEvents: (start?: string, end?: string, type?: string) => {
      const params = new URLSearchParams();
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      if (type) params.append('type', type);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return handleRequest(`/calendar-events${queryString}`);
    },
    
    // 创建事件
    createEvent: (eventData: any) => 
      handleRequest(`/calendar-events`, {
        method: 'POST',
        body: JSON.stringify(eventData)
      }),
    
    // 更新事件
    updateEvent: (id: string, eventData: any) => 
      handleRequest(`/calendar-events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData)
      }),
    
    // 删除事件
    deleteEvent: (id: string) => 
      handleRequest(`/calendar-events/${id}`, {
        method: 'DELETE'
      })
  },
  
  // 教学计划
  teachingPlans: {
    // 获取教学计划列表
    list: (page = 1, pageSize = 10) => 
      handleRequest(`/teaching-plans?page=${page}&pageSize=${pageSize}`),
    
    // 获取单个教学计划
    get: (id: string) => 
      handleRequest(`/teaching-plans/${id}`)
  }
};

// 导出常用API模块，便于直接导入
export const { users, superadmin, auth, workbench, calendar, agents } = api;