/**
 * 核心API处理功能
 * 提供统一的API请求处理、错误处理和认证管理
 */

import { envConfig } from '@/lib/env-config';
import tokenService from '@/shared/auth/token-service';

// 使用环境配置
const API_BASE_URL = envConfig.apiBaseUrl;
const API_MOCKING = envConfig.apiMocking;
const ENVIRONMENT = envConfig.environment;

console.log(`[共享API] 配置: API_BASE_URL=${API_BASE_URL}, API_MOCKING=${API_MOCKING}, ENV=${ENVIRONMENT}`);

/**
 * 为请求添加认证头
 */
export const getAuthHeaders = (): HeadersInit => {
  // 确保在客户端环境
  if (typeof window === 'undefined') {
    return { 'Content-Type': 'application/json' };
  }
  
  // 使用令牌服务获取访问令牌
  const accessToken = tokenService.getAccessToken();
  
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
    // MSW预处理：在开发环境中，确保MSW已就绪
    if (API_MOCKING === true && typeof window !== 'undefined') {
      // 如果MSW初始化仍在进行中，等待初始化完成
      if ((window as any).__MSW_READY__ === undefined) {
        console.log('等待MSW初始化...');
        await new Promise<void>((resolve) => {
          const checkMswReady = () => {
            if ((window as any).__MSW_READY__ === true) {
              resolve();
            } else if ((window as any).__MSW_READY__ === false) {
              // MSW初始化失败，继续执行
              console.warn('MSW初始化失败，将直接发送请求');
              resolve();
            } else {
              // 继续等待，每100ms检查一次
              setTimeout(checkMswReady, 100);
            }
          };
          
          // 设置超时
          const timeoutId = setTimeout(() => {
            console.warn('MSW初始化超时，将直接发送请求');
            resolve();
          }, 3000); // 3秒超时
          
          // 开始检查
          checkMswReady();
          
          // 清除超时
          return () => clearTimeout(timeoutId);
        });
      }
      
      console.log(`准备API请求: ${url}, MSW状态: ${(window as any).__MSW_READY__}`);
    }

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
        // 令牌过期，尝试刷新
        const newToken = await tokenService.refreshAccessToken();
        
        // 如果刷新成功，使用新令牌重试请求
        if (newToken) {
          // 更新请求头中的令牌
          const newHeaders = {
            ...headers,
            'Authorization': `Bearer ${newToken}`
          };
          
          // 重试请求
          const retryResponse = await fetch(url, {
            ...options,
            headers: newHeaders
          });
          
          // 如果重试成功，返回结果
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            return data;
          }
        }
        
        // 如果刷新失败或重试失败，清除令牌
        await tokenService.clearTokens();
        
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
  console.log(`构建API路径: feature=${feature}, path=${path}`);

  // 确保feature没有前导或尾随斜杠
  const normalizedFeature = feature.replace(/^\/|\/$/g, '');
  
  // 确保path有前导斜杠但没有尾随斜杠
  const normalizedPath = path 
    ? (path.startsWith('/') ? path : `/${path}`)
    : '';
  
  // 处理API_BASE_URL，确保它没有尾随斜杠
  const baseUrl = API_BASE_URL.endsWith('/') 
    ? API_BASE_URL.slice(0, -1) 
    : API_BASE_URL;
  
  // 检查是否在开发环境且MSW已启用 - 使用固定路径格式方便MSW拦截
  if (API_MOCKING === true && ENVIRONMENT === 'development') {
    // 格式: /api/[feature][path]
    const mswPath = `/api/${normalizedFeature}${normalizedPath}`;
    console.log(`MSW模式API路径: ${mswPath}`);
    return mswPath;
  }
  
  // 格式: [baseUrl]/[feature][path]
  const productionPath = `${baseUrl}/${normalizedFeature}${normalizedPath}`;
  console.log(`标准API路径: ${productionPath}`);
  return productionPath;
};

// 声明全局窗口接口扩展
declare global {
  interface Window {
    __AUTH_TOKEN__?: string;
    __MSW_READY__?: boolean;
    __MSW_DEBUG__?: any;
  }
} 