"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// 用户类型
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

// 认证上下文状态
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// 认证上下文方法
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  loginWithCode: (phone: string, code: string) => Promise<void>;
  sendVerificationCode: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者属性
interface AuthProviderProps {
  children: ReactNode;
}

// 认证提供者组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  // 初始化检查用户已登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('认证失败');
        }
        
        const user = await response.json();
        
        setState({
          isAuthenticated: true,
          user,
          token,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        localStorage.removeItem('token');
        setState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: 'Session expired',
        });
      }
    };
    
    checkAuth();
  }, []);

  // 用户名密码登录
  const login = async (username: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '登录失败');
      }
      
      const data = await response.json();
      
      localStorage.setItem('token', data.token);
      
      setState({
        isAuthenticated: true,
        user: data.user,
        token: data.token,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || '登录时发生错误' 
      }));
    }
  };

  // 发送验证码
  const sendVerificationCode = async (phone: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '发送验证码失败');
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || '发送验证码时发生错误' 
      }));
    }
  };

  // 验证码登录
  const loginWithCode = async (phone: string, code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/login-with-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '验证码登录失败');
      }
      
      const data = await response.json();
      
      localStorage.setItem('token', data.token);
      
      setState({
        isAuthenticated: true,
        user: data.user,
        token: data.token,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || '登录时发生错误' 
      }));
    }
  };

  // 登出
  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (state.token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.token}`,
          },
        });
      }
    } catch (error) {
      // 即使注销 API 调用失败，我们仍要清除本地状态
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    }
  };

  const value = {
    ...state,
    login,
    loginWithCode,
    sendVerificationCode,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义钩子用于在组件中使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  
  return context;
};

// 用于保护需要认证的路由
export const withAuth = (Component: React.ComponentType<any>) => {
  const AuthenticatedComponent = (props: any) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    // 如果还在加载，显示加载状态
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    // 如果未认证，重定向到登录页
    if (!isAuthenticated) {
      // 如果在客户端环境
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
        return null;
      }
      
      // 服务器端渲染时返回一个占位符
      return <div>Redirecting...</div>;
    }
    
    // 已认证，渲染原始组件
    return <Component {...props} />;
  };
  
  return AuthenticatedComponent;
}; 