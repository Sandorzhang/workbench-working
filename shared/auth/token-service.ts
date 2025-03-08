/**
 * 令牌服务
 * 管理访问令牌和刷新令牌的安全存储和获取
 */

import { authApi } from '@/features/auth/api/client';

// 定义内存中的访问令牌
let inMemoryToken: string | null = null;

// 检查是否在浏览器环境
const isBrowser = typeof window !== 'undefined';

// 调试日志开关
const DEBUG = true;

// 调试日志函数
const debugLog = (...args: any[]) => {
  if (DEBUG) {
    console.group('🔑 [令牌服务]');
    console.log(...args);
    console.groupEnd();
  }
};

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
  setTokens: (accessToken: string, refreshToken: string): void => {
    debugLog(`设置令牌 - 访问令牌长度: ${accessToken?.length || 0}, 刷新令牌长度: ${refreshToken?.length || 0}`);
    
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
    if (isBrowser) {
      try {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        debugLog('令牌已保存到 localStorage');
      } catch (error) {
        console.error('备份令牌到 localStorage 失败:', error);
      }
    }
    
    // 设置全局变量 (用于兼容性)
    if (isBrowser && window) {
      (window as any).__AUTH_TOKEN__ = accessToken;
      debugLog('令牌已设置到全局变量 __AUTH_TOKEN__');
    }
    
    // 验证令牌是否正确保存
    setTimeout(() => {
      if (isBrowser) {
        const storedToken = localStorage.getItem('accessToken');
        const globalToken = (window as any).__AUTH_TOKEN__;
        
        debugLog('令牌保存验证:', {
          '内存中': !!inMemoryToken && inMemoryToken.length > 0,
          'localStorage中': !!storedToken && storedToken.length > 0,
          '全局变量中': !!globalToken && globalToken.length > 0,
          '三者匹配': inMemoryToken === storedToken && storedToken === globalToken
        });
        
        if (!storedToken || !globalToken || inMemoryToken !== storedToken || storedToken !== globalToken) {
          console.warn('令牌保存不一致，尝试重新同步');
          
          // 重新同步
          if (inMemoryToken) {
            localStorage.setItem('accessToken', inMemoryToken);
            (window as any).__AUTH_TOKEN__ = inMemoryToken;
          } else if (storedToken) {
            inMemoryToken = storedToken;
            (window as any).__AUTH_TOKEN__ = storedToken;
          } else if (globalToken) {
            inMemoryToken = globalToken;
            localStorage.setItem('accessToken', globalToken);
          }
        }
      }
    }, 100);
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
  clearTokens: async (): Promise<void> => {
    // 清除内存中的令牌
    inMemoryToken = null;
    
    // 清除 HTTP-only Cookie 中的刷新令牌
    try {
      await fetch('/api/auth/clear-refresh-token', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('清除 Cookie 中的刷新令牌失败:', err);
    }
    
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
      // 尝试使用API刷新令牌
      const response = await authApi.refreshToken(localStorage.getItem('refreshToken') || '');
      
      if (!response.success) {
        throw new Error('刷新令牌失败');
      }
      
      const data = response.data;
      
      if (data && data.accessToken) {
        // 更新内存中的访问令牌
        inMemoryToken = data.accessToken;
        
        // 更新兼容层
        if (isBrowser) {
          try {
            localStorage.setItem('accessToken', data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken);
            }
          } catch (error) {
            console.error('更新 localStorage 中的令牌失败:', error);
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
      
      // 尝试使用后端API刷新（通过HTTP-only Cookie实现）
      try {
        const response = await fetch('/api/auth/refresh-token', {
          method: 'POST',
          credentials: 'include'
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
      } catch (backendError) {
        console.error('通过后端API刷新令牌失败:', backendError);
      }
      
      return null;
    }
  },
  
  /**
   * 验证令牌有效性
   * @param token 要验证的令牌
   * @returns 令牌是否有效
   */
  validateToken: async (token: string): Promise<boolean> => {
    if (!token) {
      return false;
    }
    
    try {
      const response = await authApi.validateToken(token);
      
      return response.success && response.data?.valid === true;
    } catch (error) {
      console.error('验证令牌有效性失败:', error);
      return false;
    }
  }
};

export default tokenService;