/**
 * 核心API处理功能
 * 提供统一的API请求处理、错误处理和认证管理
 */

// 使用环境变量配置API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
const API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENV || 'development';

/**
 * 为请求添加认证头
 */
export const getAuthHeaders = (): HeadersInit => {
  // 确保在客户端环境
  if (typeof window === 'undefined') {
    return { 'Content-Type': 'application/json' };
  }
  
  // 从localStorage获取令牌，确保它是字符串
  let accessToken = localStorage.getItem('accessToken') || '';
  
  // 如果localStorage中没有token，尝试从内存中获取
  if (!accessToken && (window as any).__AUTH_TOKEN__) {
    console.log('从内存中获取token:', (window as any).__AUTH_TOKEN__?.substring(0, 10) + '...');
    accessToken = (window as any).__AUTH_TOKEN__ || '';
  }
  
  // 检查token是否有效
  const isTokenValid = accessToken && accessToken !== 'null' && accessToken !== 'undefined';
  
  return {
    'Content-Type': 'application/json',
    ...(isTokenValid ? { 'Authorization': `Bearer ${accessToken}` } : {})
  };
};

/**
 * 标准API错误响应接口
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

/**
 * 标准API响应包装器
 */
export interface ApiResponse<T> {
  data: T;
  code: number;
  message: string;
  success: boolean;
}

/**
 * 处理API请求，包含标准化的错误处理
 * @param url API URL
 * @param options Fetch选项
 * @returns 解析为响应数据的Promise
 */
export async function handleRequest<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    // 设置默认的请求头（如果没有提供）
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string> || {})
    };

    // 执行请求
    const response = await fetch(url, {
      ...options,
      headers
    });

    // 处理HTTP错误响应
    if (!response.ok) {
      if (response.status === 401) {
        // 认证失败时清除无效令牌
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // 可选：重定向到登录页
          // window.location.href = '/login';
        }
        
        throw {
          message: '认证已失效，请重新登录',
          code: '401'
        } as ApiErrorResponse;
      }

      // 尝试解析错误响应
      let errorMessage = '请求失败';
      let errorCode = String(response.status);
      let errorDetails = {};
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorCode = errorData.code || errorCode;
        errorDetails = errorData.details || {};
      } catch (e) {
        // 无法解析JSON响应，使用默认错误信息
      }
      
      throw {
        message: errorMessage,
        code: errorCode,
        details: errorDetails
      } as ApiErrorResponse;
    }

    // 解析成功响应
    return await response.json();
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
}

/**
 * 构建标准化的API路径
 * @param feature 功能模块名称（例如"auth"、"workbench"）
 * @param path 特定端点路径
 * @returns 完整格式化的API路径
 */
export const buildApiPath = (feature: string, path: string): string => {
  // 确保feature没有前导或尾随斜杠
  const normalizedFeature = feature.replace(/^\/|\/$/g, '');
  
  // 确保path有前导斜杠但没有尾随斜杠
  const normalizedPath = path 
    ? (path.startsWith('/') ? path : `/${path}`)
    : '';
  
  // 格式: /api/[feature]/[path]
  return `${API_BASE_URL}/${normalizedFeature}${normalizedPath}`;
};

// 声明全局窗口接口扩展
declare global {
  interface Window {
    __AUTH_TOKEN__?: string;
    __MSW_READY__?: boolean;
  }
} 