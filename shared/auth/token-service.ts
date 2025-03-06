/**
 * 令牌服务
 * 管理访问令牌和刷新令牌的安全存储和获取
 */

import { authApi } from '@/features/auth/api/client';

// 定义内存中的访问令牌
let inMemoryToken: string | null = null;

// 检查是否在浏览器环境
const isBrowser = typeof window !== 'undefined';

/**
 * 令牌服务对象
 */
const tokenService = {
  /**
   * 设置令牌
   * - 访问令牌存储在内存中
   * - 刷新令牌存储在 HTTP-only Cookie 中
   * @param accessToken 访问令牌
   * @param refreshToken 刷新令牌
   */
  setTokens: (accessToken: string, refreshToken: string) => {
    // 保存访问令牌到内存中
    inMemoryToken = accessToken;
    
    // 保存刷新令牌到 HTTP-only Cookie (通过后端 API)
    if (refreshToken) {
      // 调用后端 API 设置 HTTP-only Cookie
      fetch('/api/auth/set-refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: refreshToken }),
        credentials: 'include' // 确保发送和接收 Cookie
      }).catch(err => {
        console.error('保存刷新令牌到 Cookie 失败:', err);
      });
    }
    
    // 备份 - 为了兼容现有代码，仍然保存到 localStorage
    // 后续可以移除这部分代码
    if (isBrowser) {
      try {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      } catch (error) {
        console.error('备份令牌到 localStorage 失败:', error);
      }
    }
    
    // 设置全局变量
    if (isBrowser && window) {
      (window as any).__AUTH_TOKEN__ = accessToken;
    }
  },
  
  /**
   * 获取访问令牌
   * 优先从内存中获取，如果不存在则尝试从 localStorage 获取（兼容旧实现）
   * @returns 访问令牌
   */
  getAccessToken: (): string | null => {
    // 首先尝试从内存中获取
    if (inMemoryToken) {
      return inMemoryToken;
    }
    
    // 如果内存中没有，尝试从 localStorage 获取（兼容旧实现）
    if (isBrowser) {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // 同步到内存中
          inMemoryToken = token;
          return token;
        }
      } catch (error) {
        console.error('从 localStorage 获取访问令牌失败:', error);
      }
    }
    
    // 从全局变量中获取（兼容旧实现）
    if (isBrowser && window && (window as any).__AUTH_TOKEN__) {
      const token = (window as any).__AUTH_TOKEN__;
      // 同步到内存中
      inMemoryToken = token;
      return token;
    }
    
    return null;
  },
  
  /**
   * 清除所有令牌
   */
  clearTokens: async () => {
    // 清除内存中的令牌
    inMemoryToken = null;
    
    // 清除 HTTP-only Cookie 中的刷新令牌
    await fetch('/api/auth/clear-refresh-token', {
      method: 'POST',
      credentials: 'include'
    }).catch(err => {
      console.error('清除 Cookie 中的刷新令牌失败:', err);
    });
    
    // 清除兼容层中的令牌
    if (isBrowser) {
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } catch (error) {
        console.error('清除 localStorage 中的令牌失败:', error);
      }
      
      // 清除全局变量
      if (window) {
        (window as any).__AUTH_TOKEN__ = undefined;
      }
    }
  },
  
  /**
   * 刷新访问令牌
   * 使用 HTTP-only Cookie 中的刷新令牌获取新的访问令牌
   * @returns 新的访问令牌，如果失败则返回 null
   */
  refreshAccessToken: async (): Promise<string | null> => {
    try {
      // 调用刷新令牌 API
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include' // 确保发送 Cookie
      });
      
      if (!response.ok) {
        throw new Error('刷新令牌请求失败');
      }
      
      const data = await response.json();
      
      if (data && data.accessToken) {
        // 更新内存中的访问令牌
        inMemoryToken = data.accessToken;
        
        // 更新兼容层
        if (isBrowser) {
          try {
            localStorage.setItem('accessToken', data.accessToken);
          } catch (error) {
            console.error('更新 localStorage 中的访问令牌失败:', error);
          }
          
          // 更新全局变量
          if (window) {
            (window as any).__AUTH_TOKEN__ = data.accessToken;
          }
        }
        
        return data.accessToken;
      }
      
      return null;
    } catch (error) {
      console.error('刷新访问令牌失败:', error);
      return null;
    }
  }
};

export default tokenService;