/**
 * 环境配置模块
 * 提供统一的方式来获取环境配置，无论是在服务器端还是客户端
 */

// 检测是否为开发环境的辅助函数
const isDevelopment = (): boolean => {
  // 判断Node环境是否为development
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV === 'development';
  }
  
  // 检查URL是否包含localhost或本地IP
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname.startsWith('192.168.') || 
           hostname.startsWith('10.') || 
           hostname.includes('.local');
  }
  
  // 默认假设为开发环境
  return true;
};

// 获取当前环境类型
export const getEnvironment = (): 'development' | 'test' | 'production' => {
  if (typeof process !== 'undefined' && process.env) {
    // 首先检查显式设置的环境
    if (process.env.NEXT_PUBLIC_ENV) {
      const env = process.env.NEXT_PUBLIC_ENV;
      if (env === 'development' || env === 'test' || env === 'production') {
        return env;
      }
    }
    
    // 然后检查NODE_ENV
    if (process.env.NODE_ENV) {
      const nodeEnv = process.env.NODE_ENV;
      if (nodeEnv === 'development' || nodeEnv === 'test' || nodeEnv === 'production') {
        return nodeEnv;
      }
    }
  }
  
  // 检测环境
  if (isDevelopment()) {
    return 'development';
  }
  
  // 默认为开发环境
  return 'development';
};

// 是否启用API模拟
export const isMswEnabled = (): boolean => {
  // 首先检查是否有明确的环境变量设置
  if (typeof process !== 'undefined' && process.env) {
    // 显式启用
    if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
      return true;
    }
    
    // 显式禁用
    if (process.env.NEXT_PUBLIC_API_MOCKING === 'disabled') {
      return false;
    }
  }
  
  // 默认在开发环境中启用MSW
  return getEnvironment() === 'development';
};

// 获取API基础URL
export const getApiBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return '/api';
};

// 导出当前环境配置
export const envConfig = {
  environment: getEnvironment(),
  apiMocking: isMswEnabled(),
  apiBaseUrl: getApiBaseUrl()
};

// 调试信息
console.log('[环境配置] 当前配置:', envConfig, 
  isDevelopment() ? '(检测到开发环境)' : '(检测到生产环境)');

export default envConfig; 