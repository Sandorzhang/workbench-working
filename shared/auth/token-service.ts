/**
 * 令牌服务
 * 管理访问令牌和刷新令牌的安全存储和获取
 */

import { authApi } from '@/features/auth/api/client';

// 定义内存中的访问令牌
let inMemoryToken: string | null = null;

// 定义令牌过期时间（默认30分钟）
let tokenExpiresAt: number | null = null;

// 定义自动刷新定时器
let refreshTimer: NodeJS.Timeout | null = null;

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
 * 解析JWT令牌以获取过期时间
 * @param token JWT令牌
 * @returns 令牌过期的时间戳（毫秒），如果无法解析则返回null
 */
const getTokenExpiration = (token: string): number | null => {
  try {
    // 拆分令牌并获取payload
    const payload = token.split('.')[1];
    if (!payload) return null;
    
    // 解码payload
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    // 获取过期时间
    if (decoded.exp) {
      // JWT中的exp是秒级时间戳，转换为毫秒
      return decoded.exp * 1000;
    }
    
    return null;
  } catch (error) {
    console.error('解析令牌过期时间失败:', error);
    return null;
  }
};

/**
 * 计算距离过期还有多少毫秒
 * @param expiresAt 过期时间戳
 * @returns 剩余毫秒数，如果已过期则返回0
 */
const calculateTimeToExpiry = (expiresAt: number): number => {
  const now = Date.now();
  return Math.max(0, expiresAt - now);
};

/**
 * 设置自动刷新定时器
 * 在令牌过期前5分钟自动刷新
 */
const setupAutoRefresh = () => {
  // 清除现有定时器
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  
  // 如果没有过期时间，无法设置刷新
  if (!tokenExpiresAt) {
    return;
  }
  
  // 计算应该何时刷新（过期前5分钟或一半时间，取较小值）
  const timeToExpiry = calculateTimeToExpiry(tokenExpiresAt);
  
  // 令牌已过期或即将过期
  if (timeToExpiry <= 0) {
    return;
  }
  
  // 计算刷新时间（过期前5分钟）
  const FIVE_MINUTES = 5 * 60 * 1000;
  // 取过期前5分钟或剩余时间的一半，以较小值为准
  const refreshDelay = Math.min(timeToExpiry - FIVE_MINUTES, timeToExpiry / 2);
  
  // 令牌已接近过期，立即刷新
  if (refreshDelay <= 0) {
    debugLog('令牌接近过期，立即刷新');
    tokenService.refreshAccessToken()
      .catch(err => console.error('自动刷新令牌失败:', err));
    return;
  }
  
  // 设置定时器在适当时间刷新令牌
  debugLog(`设置自动刷新定时器，将在 ${Math.round(refreshDelay / 1000)} 秒后刷新令牌`);
  refreshTimer = setTimeout(async () => {
    debugLog('执行自动刷新令牌');
    try {
      await tokenService.refreshAccessToken();
    } catch (error) {
      console.error('自动刷新令牌失败:', error);
    }
  }, refreshDelay);
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
    
    // 保存访问令牌到内存中（主要存储位置）
    inMemoryToken = accessToken;
    
    // 解析令牌过期时间
    const expiration = getTokenExpiration(accessToken);
    if (expiration) {
      tokenExpiresAt = expiration;
      const timeToExpiry = calculateTimeToExpiry(expiration);
      debugLog(`令牌有效期: ${Math.round(timeToExpiry / 1000 / 60)} 分钟`);
      
      // 设置自动刷新
      setupAutoRefresh();
    }
    
    // 保存刷新令牌到 HTTP-only Cookie (通过后端 API)
    if (refreshToken) {
      // 在开发环境中，直接保存到localStorage
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'development') {
        if (isBrowser) {
          try {
            localStorage.setItem('refreshToken', refreshToken);
            debugLog('开发环境: 刷新令牌已保存到localStorage');
          } catch (error) {
            console.error('保存刷新令牌到localStorage失败:', error);
          }
        }
      } else {
        // 生产环境使用HTTP-only Cookie
        fetch('/api/auth/set-refresh-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: refreshToken }),
          credentials: 'include' // 确保发送和接收 Cookie
        }).catch(err => {
          console.error('保存刷新令牌到 Cookie 失败:', err);
        });
      }
    }
    
    // 备份 - 为了兼容现有代码，但不建议使用
    if (isBrowser) {
      try {
        // 弃用警告 - 仅在开发环境显示
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ 警告：在localStorage中存储令牌不安全，即将废弃此功能。请更新代码使用tokenService API。');
        }
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        debugLog('令牌已保存到 localStorage (不推荐)');
      } catch (error) {
        console.error('备份令牌到 localStorage 失败:', error);
      }
    }
    
    // 设置全局变量 (用于兼容性，但不推荐使用)
    if (isBrowser && window) {
      // 弃用警告 - 仅在开发环境显示
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ 警告：使用全局变量存储令牌不安全，即将废弃。请更新代码使用tokenService API。');
      }
      
      (window as any).__AUTH_TOKEN__ = accessToken;
      debugLog('令牌已设置到全局变量 __AUTH_TOKEN__ (不推荐)');
    }
    
    // 验证令牌是否正确保存
    setTimeout(() => {
      if (isBrowser) {
        const storedToken = localStorage.getItem('accessToken');
        const globalToken = (window as any).__AUTH_TOKEN__;
        
        // 只在开发环境中记录令牌一致性问题
        if (process.env.NODE_ENV === 'development') {
          debugLog('令牌保存验证:', {
            '内存中': !!inMemoryToken && inMemoryToken.length > 0,
            'localStorage中': !!storedToken && storedToken.length > 0,
            '全局变量中': !!globalToken && globalToken.length > 0
          });
        }
        
        // 如果内存中的令牌为空但其他位置有令牌，则同步到内存中
        if (!inMemoryToken) {
          if (storedToken) {
            inMemoryToken = storedToken;
            console.warn('从localStorage同步令牌到内存');
          } else if (globalToken) {
            inMemoryToken = globalToken;
            console.warn('从全局变量同步令牌到内存');
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
    // 首先尝试从内存中获取（推荐方式）
    if (inMemoryToken) {
      return inMemoryToken;
    }
    
    // 如果内存中没有，尝试从 localStorage 获取（兼容旧实现，不推荐）
    if (isBrowser) {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // 兼容性警告 - 仅在开发环境显示
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ 正在从localStorage获取令牌（不安全）。请更新代码使用令牌服务。');
          }
          
          // 同步到内存中
          inMemoryToken = token;
          
          // 解析令牌过期时间并设置自动刷新
          const expiration = getTokenExpiration(token);
          if (expiration) {
            tokenExpiresAt = expiration;
            setupAutoRefresh();
          }
          
          return token;
        }
      } catch (error) {
        console.error('从 localStorage 获取访问令牌失败:', error);
      }
    }
    
    // 从全局变量中获取（兼容旧实现，不推荐）
    if (isBrowser && window && (window as any).__AUTH_TOKEN__) {
      // 兼容性警告 - 仅在开发环境显示 
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ 正在从全局变量获取令牌（不安全）。请更新代码使用令牌服务。');
      }
      
      const token = (window as any).__AUTH_TOKEN__;
      // 同步到内存中
      inMemoryToken = token;
      
      // 解析令牌过期时间并设置自动刷新
      const expiration = getTokenExpiration(token);
      if (expiration) {
        tokenExpiresAt = expiration;
        setupAutoRefresh();
      }
      
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
    
    // 清除过期时间
    tokenExpiresAt = null;
    
    // 清除自动刷新定时器
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
    
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
    debugLog('正在刷新访问令牌...');
    
    try {
      // 优先使用API端点刷新令牌，该端点会读取HTTP-only Cookie中的刷新令牌
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
        
        // 解析新令牌的过期时间
        const expiration = getTokenExpiration(data.accessToken);
        if (expiration) {
          tokenExpiresAt = expiration;
          // 设置自动刷新
          setupAutoRefresh();
        }
        
        // 更新兼容层（不推荐，但为了保持向后兼容）
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
        
        debugLog('访问令牌刷新成功');
        return data.accessToken;
      }
      
      // 如果前面的方法失败，尝试使用直接API调用（旧方法）
      // 这是一个后备机制，未来可能会移除
      if (isBrowser) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.warn('⚠️ 正在使用localStorage中的刷新令牌（不安全）。请更新实现。');
          const response = await authApi.refreshToken(refreshToken);
          
          if (!response.success) {
            throw new Error('刷新令牌失败');
          }
          
          const data = response.data;
          
          if (data && data.accessToken) {
            // 更新内存中的访问令牌
            inMemoryToken = data.accessToken;
            
            // 解析新令牌的过期时间并设置自动刷新
            const expiration = getTokenExpiration(data.accessToken);
            if (expiration) {
              tokenExpiresAt = expiration;
              setupAutoRefresh();
            }
            
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
            
            debugLog('访问令牌刷新成功（通过后备机制）');
            return data.accessToken;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('刷新访问令牌失败:', error);
      return null;
    }
  },
  
  /**
   * 获取当前令牌有效期剩余时间
   * @returns 剩余毫秒数，如果没有令牌或已过期则返回0
   */
  getTokenTimeRemaining: (): number => {
    if (!tokenExpiresAt) {
      // 如果没有过期时间记录，尝试从令牌中获取
      const token = tokenService.getAccessToken();
      if (token) {
        const expiration = getTokenExpiration(token);
        if (expiration) {
          tokenExpiresAt = expiration;
        }
      }
    }
    
    return tokenExpiresAt ? calculateTimeToExpiry(tokenExpiresAt) : 0;
  },
  
  /**
   * 检查令牌是否即将过期（5分钟内）
   * @returns 如果令牌即将过期则返回true，否则返回false
   */
  isTokenExpiringSoon: (): boolean => {
    const timeRemaining = tokenService.getTokenTimeRemaining();
    const FIVE_MINUTES = 5 * 60 * 1000;
    return timeRemaining > 0 && timeRemaining < FIVE_MINUTES;
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