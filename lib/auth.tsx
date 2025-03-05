"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { api } from './api';
import { LoginResponse, User as ApiUser } from './api-types';

// 用户类型
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  school?: string; // 用户所属学校
  schoolType?: string; // 学校类型
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
        console.log('正在验证用户会话，token:', token.substring(0, 5) + '...');
        
        // 使用API工具获取用户信息
        const userData = await api.auth.getCurrentUser() as User;
        
        setState({
          isAuthenticated: true,
          user: userData,
          token: token,
          isLoading: false,
          error: null,
        });
        
        console.log('用户会话验证成功:', userData.name);
      } catch (error: any) {
        console.error('会话验证失败:', error);
        
        // 清除无效token
        localStorage.removeItem('token');
        
        // 更健壮的错误消息提取
        let errorMessage = '会话验证失败';
        
        if (error) {
          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.code) {
            errorMessage = `认证错误 (${error.code})`;
          } else if (JSON.stringify(error) !== '{}') {
            // 如果错误对象不为空但没有消息，尝试将整个对象转为字符串
            errorMessage = `认证错误: ${JSON.stringify(error)}`;
          }
        }
        
        console.log('设置错误状态，错误消息:', errorMessage);
        
        setState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: errorMessage,
        });
        
        // 显示错误提示
        toast.error(errorMessage);
      }
    };
    
    checkAuth();
  }, []);

  // 用户名密码登录
  const login = async (username: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('开始账号密码登录请求...');
      
      // 使用API工具进行登录
      const data = await api.auth.login(username, password) as LoginResponse;
      
      console.log('登录成功，获取到token和用户数据');
      
      // 先保存token
      localStorage.setItem('token', data.token);
      
      // 立即更新状态，不使用setTimeout
      setState({
        isAuthenticated: true,
        user: data.user,
        token: data.token,
        isLoading: false,
        error: null,
      });
      
      toast.success('登录成功');
    } catch (error: any) {
      console.error('登录失败:', error);
      const errorMessage = error.message || '登录时发生错误';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  };

  // 短信验证码登录
  const loginWithCode = async (phone: string, code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('开始验证码登录请求...');
      
      // 使用API工具进行验证码登录
      const data = await api.auth.loginWithCode(phone, code) as LoginResponse;
      
      console.log('验证码登录成功，获取到token和用户数据');
      
      // 先保存token
      localStorage.setItem('token', data.token);
      
      // 立即更新状态，不使用setTimeout
      setState({
        isAuthenticated: true,
        user: data.user,
        token: data.token,
        isLoading: false,
        error: null,
      });
      
      toast.success('登录成功');
    } catch (error: any) {
      console.error('验证码登录失败:', error);
      const errorMessage = error.message || '验证码登录失败';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  };

  // 发送短信验证码
  const sendVerificationCode = async (phone: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('发送验证码到手机:', phone);
      
      // 使用API工具发送验证码
      await api.auth.sendVerificationCode(phone);
      
      setState(prev => ({ ...prev, isLoading: false }));
      console.log('验证码发送成功');
      toast.success('验证码已发送');
    } catch (error: any) {
      console.error('验证码发送失败:', error);
      const errorMessage = error.message || '验证码发送失败';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  };

  // 登出
  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('开始注销操作...');
      
      // 先记录当前token用于API调用
      const currentToken = localStorage.getItem('token');
      
      // 清除本地token
      localStorage.removeItem('token');
      console.log('已清除本地token');
      
      try {
        // 尝试调用API，但不等待结果
        if (currentToken) {
          console.log('调用API进行服务器端登出');
          await api.auth.logout();
          console.log('API登出调用成功');
        } else {
          console.log('没有token，跳过API登出调用');
        }
      } catch (logoutError: any) {
        // 如果API调用失败，记录错误但继续删除本地状态
        console.error('注销API调用失败，但会继续清除本地状态:', logoutError);
      }
      
      // 清除本地状态
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
      
      // 添加成功提示
      toast.success('已成功退出登录');
      console.log('登出流程完成，状态已重置');
    } catch (error: any) {
      console.error('注销过程中发生错误:', error);
      
      // 即使出错也清除本地token和状态
      localStorage.removeItem('token');
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: error.message || '注销过程中发生错误',
      });
      
      toast.error(error.message || '退出登录时发生错误');
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