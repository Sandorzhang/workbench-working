"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { api } from './api';
import { LoginResponse, User as ApiUser } from './api-types';

declare global {
  interface Window {
    __AUTH_TOKEN__?: string;
    __MSW_READY__?: boolean;
  }
}

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
      console.log('开始检查认证状态...');
      
      try {
        // 尝试从localStorage获取token
        let accessToken = localStorage.getItem('accessToken');
        
        // 如果localStorage中没有token，尝试从内存中获取
        if (!accessToken && typeof window !== 'undefined' && window.__AUTH_TOKEN__) {
          accessToken = window.__AUTH_TOKEN__;
          console.log('使用内存中的token');
        }
        
        // 如果没有token，用户未登录
        if (!accessToken) {
          console.log('未找到token，用户未登录');
          setState({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: null,
            permissions: [],
          });
          return;
        }
        
        console.log('找到token，尝试获取用户信息');
        
        // 尝试从localStorage获取用户信息
        try {
          const userJson = localStorage.getItem('user');
          if (userJson) {
            const userData = JSON.parse(userJson);
            console.log('从localStorage获取到用户信息:', userData.name);
            
            // 更新认证状态
            setState({
              isAuthenticated: true,
              user: userData,
              accessToken,
              refreshToken: localStorage.getItem('refreshToken') || null,
              isLoading: false,
              error: null,
              permissions: userData.permissions || [],
            });
            return;
          }
        } catch (parseError) {
          console.error('解析localStorage中的用户信息失败:', parseError);
          // 继续尝试API获取
        }
        
        // 如果localStorage中没有用户信息，尝试从API获取
        console.log('尝试从API获取用户信息');
        
        // 设置内存中的token，确保API请求能使用
        if (typeof window !== 'undefined') {
          window.__AUTH_TOKEN__ = accessToken;
        }
        
        // 尝试获取用户信息
        const userResponse: any = await api.auth.getCurrentUser();
        
        if (userResponse.code !== 0) {
          throw new Error(userResponse.msg || '获取用户信息失败');
        }
        
        const userData = userResponse.data;
        
        // 构建用户信息
        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email || null,
          avatar: userData.avatar || null,
          role: userData.role?.id,
          roleName: userData.role?.name,
          school: userData.school || undefined,
          schoolId: userData.schoolId || undefined,
          schoolName: userData.schoolName || undefined,
          permissions: userData.permissions || [],
        };
        
        // 保存用户信息到localStorage
        try {
          localStorage.setItem('user', JSON.stringify(user));
        } catch (err) {
          console.error('保存用户信息到localStorage失败:', err);
        }
        
        // 更新认证状态
        setState({
          isAuthenticated: true,
          user,
          accessToken,
          refreshToken: localStorage.getItem('refreshToken') || null,
          isLoading: false,
          error: null,
          permissions: userData.permissions || [],
        });
      } catch (error) {
        console.error('认证检查失败:', error);
        
        // 如果是404错误，可能是API路径问题，尝试使用localStorage中的用户信息
        if (error instanceof Error && error.message.includes('404')) {
          try {
            const userJson = localStorage.getItem('user');
            const accessToken = localStorage.getItem('accessToken');
            
            if (userJson && accessToken) {
              const userData = JSON.parse(userJson);
              console.log('API获取失败，使用localStorage中的用户信息:', userData.name);
              
              // 更新认证状态
              setState({
                isAuthenticated: true,
                user: userData,
                accessToken,
                refreshToken: localStorage.getItem('refreshToken') || null,
                isLoading: false,
                error: null,
                permissions: userData.permissions || [],
              });
              return;
            }
          } catch (parseError) {
            console.error('解析localStorage中的用户信息失败:', parseError);
          }
        }
        
        // 清除token
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // 设置错误信息
        let errorMessage = '认证失败';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        // 更新状态为未认证
        setState({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false,
          error: errorMessage,
          permissions: [],
        });
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
      console.log('用户信息:', data.user);
      console.log('权限列表:', data.permissions);
      
      // 先删除原有token
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // 设置token - 确保字符串值，防止null或undefined
      const accessTokenValue = data.accessToken || '';
      const refreshTokenValue = data.refreshToken || '';
      
      try {
        console.log('准备保存token到localStorage:', 
          `accessToken (${accessTokenValue.length}字符): ${accessTokenValue.substring(0, 10)}...`, 
          `refreshToken (${refreshTokenValue.length}字符): ${refreshTokenValue.substring(0, 10)}...`
        );
        
        localStorage.setItem('accessToken', accessTokenValue);
        localStorage.setItem('refreshToken', refreshTokenValue);
        
        // 立即验证token是否正确设置
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        
        console.log('验证localStorage中的token:',
          `accessToken: ${storedAccessToken ? (storedAccessToken === accessTokenValue ? '正确设置' : '值不匹配') : '未设置'}`,
          `refreshToken: ${storedRefreshToken ? (storedRefreshToken === refreshTokenValue ? '正确设置' : '值不匹配') : '未设置'}`
        );
        
        if (!storedAccessToken || storedAccessToken !== accessTokenValue) {
          console.warn('Token设置可能失败，将尝试再次设置');
          // 再次尝试设置
          localStorage.setItem('accessToken', accessTokenValue);
        }
      } catch (storageError) {
        console.error('保存token到localStorage失败:', storageError);
        // 继续执行以更新状态
      }
      
      // 构建用户信息
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email || null,
        avatar: data.user.avatar || null,
        role: data.user.role?.id,
        roleName: data.user.role?.name,
        school: data.user.school || undefined,
        schoolId: data.user.schoolId || undefined,
        schoolName: data.user.schoolName || undefined,
        permissions: data.permissions || [],
      };
      
      // 保存用户信息到localStorage，作为备份
      try {
        localStorage.setItem('user', JSON.stringify(user));
        console.log('用户信息已保存到localStorage');
      } catch (userStorageError) {
        console.error('保存用户信息到localStorage失败:', userStorageError);
      }
      
      // 设置内存中的token，作为备份
      if (typeof window !== 'undefined') {
        window.__AUTH_TOKEN__ = accessTokenValue;
        console.log('Token已保存到内存中');
      }
      
      console.log('准备设置认证状态为已登录');
      
      // 更新认证状态
      setState({
        isAuthenticated: true,
        user,
        accessToken: accessTokenValue,
        refreshToken: refreshTokenValue,
        isLoading: false,
        error: null,
        permissions: data.permissions || [],
      });
      
      toast.success('登录成功');
      
      // 直接重定向到工作台，使用window.location以确保完全重新加载页面
      setTimeout(async () => {
        // 最后验证一次token设置
        const finalAccessToken = localStorage.getItem('accessToken');
        
        if (!finalAccessToken || finalAccessToken.trim() === '') {
          console.error('最终验证失败: token设置失败，尝试非localStorage方式');
          
          // 尝试直接设置到内存对象
          try {
            window.__AUTH_TOKEN__ = data.accessToken;
            console.log('已设置内存token:', window.__AUTH_TOKEN__.substring(0, 10) + '...');
          } catch (err) {
            console.error('内存token设置失败:', err);
          }
        } else {
          console.log('最终验证成功: token已正确设置，准备跳转');
        }
        
        // 不管令牌是否设置成功，都重定向到工作台
        window.location.href = '/workbench';
      }, 1500);
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