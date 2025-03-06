"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { api } from './api';
import { LoginResponse, User as ApiUser } from './api-types';

// 用户类型
interface User {
  id: string;
  name: string;
  email?: string | null;
  avatar?: string | null;
  role?: string;
  roleName?: string;
  school?: string; // 用户所属学校
  schoolId?: string;
  schoolName?: string;
  permissions?: string[];
}

// 认证上下文状态
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  permissions: string[];
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
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    error: null,
    permissions: [],
  });

  // 初始化检查用户已登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!accessToken) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      try {
        console.log('正在验证用户会话，token:', accessToken.substring(0, 5) + '...');
        
        // 使用API工具获取用户信息
        const userData = await api.auth.getCurrentUser() as any;
        
        if (userData && userData.data && userData.data.user) {
          const user: User = {
            id: userData.data.user.id,
            name: userData.data.user.name,
            email: userData.data.user.email,
            avatar: userData.data.user.avatar,
            role: userData.data.user.role?.id,
            roleName: userData.data.user.role?.name,
            schoolId: userData.data.user.schoolId,
            schoolName: userData.data.user.schoolName,
          };
          
          setState({
            isAuthenticated: true,
            user: user,
            accessToken: accessToken,
            refreshToken: refreshToken,
            isLoading: false,
            error: null,
            permissions: userData.data.permissions || [],
          });
        } else {
          throw new Error('用户信息获取失败');
        }
        
        console.log('用户会话验证成功:', userData.data?.user?.name);
      } catch (error: any) {
        console.error('会话验证失败:', error);
        
        // 清除无效token
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
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
          accessToken: null,
          refreshToken: null,
          isLoading: false,
          error: errorMessage,
          permissions: [],
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
      const response = await api.auth.login(username, password) as LoginResponse;
      
      if (response.code !== 0) {
        throw new Error(response.msg || '登录失败');
      }
      
      const data = response.data;
      
      console.log('登录成功，获取到token和用户数据');
      
      // 保存token
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // 构建用户信息
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
        role: data.user.role?.id,
        roleName: data.user.role?.name,
        schoolId: data.user.schoolId,
        schoolName: data.user.schoolName,
        permissions: data.permissions,
      };
      
      // 立即更新状态
      setState({
        isAuthenticated: true,
        user: user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isLoading: false,
        error: null,
        permissions: data.permissions || [],
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
      const response = await api.auth.loginWithCode(phone, code) as LoginResponse;
      
      if (response.code !== 0) {
        throw new Error(response.msg || '验证码登录失败');
      }
      
      const data = response.data;
      
      console.log('验证码登录成功，获取到token和用户数据');
      
      // 保存token
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // 构建用户信息
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
        role: data.user.role?.id,
        roleName: data.user.role?.name,
        schoolId: data.user.schoolId,
        schoolName: data.user.schoolName,
        permissions: data.permissions,
      };
      
      // 立即更新状态
      setState({
        isAuthenticated: true,
        user: user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isLoading: false,
        error: null,
        permissions: data.permissions || [],
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
      const response = await api.auth.sendVerificationCode(phone) as any;
      
      if (response && response.code !== 0) {
        throw new Error(response.msg || '验证码发送失败');
      }
      
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
      const currentToken = localStorage.getItem('accessToken');
      
      // 清除本地token
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: null,
        permissions: [],
      });
      
      toast.success('已安全退出登录');
    } catch (error: any) {
      console.error('注销过程中发生错误:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error.message || '注销失败' 
      }));
      toast.error('注销过程中发生错误，请刷新页面重试');
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