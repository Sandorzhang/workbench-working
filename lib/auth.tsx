"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { api } from './api';
import { LoginResponse, User as ApiUser } from './api-types';
import tokenService from '@/shared/auth/token-service';

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
        // 使用令牌服务获取访问令牌
        const accessToken = tokenService.getAccessToken();
        
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
        
        // 尝试从localStorage获取用户信息 (为了兼容性)
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
        
        // 尝试从API获取用户信息
        console.log('尝试从API获取用户信息');
        
        // 尝试获取用户信息
        const userResponse: any = await api.auth.me();
        
        if (userResponse.code !== 0) {
          throw new Error(userResponse.msg || '获取用户信息失败');
        }
        
        const userData = userResponse.data;
        
        // 在构建用户对象之前添加日志
        console.log('登录响应数据结构:', {
          'data.role': userData.role,
          'data.user.role': userData.user?.role,
          'topLevelPermissions': userData.permissions?.length || 0,
          'roleFromUserObject': typeof userData.user?.role,
          'roleFromTopLevel': typeof userData.role
        });
        
        // 提取角色ID和名称的函数
        const extractRoleInfo = (data: any) => {
          // 尝试从 data.role 获取 (优先)
          if (data.role) {
            if (typeof data.role === 'object' && data.role !== null) {
              return {
                id: data.role.id,
                name: data.role.name
              };
            } else if (typeof data.role === 'string') {
              return {
                id: data.role,
                name: undefined
              };
            }
          }
          
          // 尝试从 data.user.role 获取
          if (data.user && data.user.role) {
            if (typeof data.user.role === 'object' && data.user.role !== null) {
              return {
                id: data.user.role.id,
                name: data.user.role.name
              };
            } else if (typeof data.user.role === 'string') {
              return {
                id: data.user.role,
                name: undefined
              };
            }
          }
          
          // 最后尝试从 roleList 获取第一个角色
          if (data.roleList && Array.isArray(data.roleList) && data.roleList.length > 0) {
            const firstRole = data.roleList[0];
            if (firstRole && typeof firstRole === 'object') {
              return {
                id: firstRole.id,
                name: firstRole.name
              };
            }
          }
          
          // 如果都没有找到，返回默认值
          return {
            id: 'user',
            name: '普通用户'
          };
        };

        // 提取角色信息
        const roleInfo = extractRoleInfo(userData);
        console.log('提取的角色信息:', roleInfo);
        
        // 构建用户信息
        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email || null,
          avatar: userData.avatar || null,
          role: roleInfo.id,
          roleName: roleInfo.name,
          school: userData.school?.name,
          schoolId: userData.schoolId || userData.school?.id,
          schoolName: userData.schoolName || userData.school?.name,
          permissions: userData.permissions || [],
        };
        
        // 添加角色信息日志
        console.log('登录用户对象设置完成，角色信息:', {
          role: user.role,
          roleName: user.roleName,
          permissions: user.permissions?.length || 0
        });
        
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

        // 记录登录成功信息
        console.log(`用户 [${user.name}] 登录成功，角色 [${user.role}]`);
        toast.success('登录成功');
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
      
      // 设置token - 确保字符串值，防止null或undefined
      const accessTokenValue = data.accessToken || '';
      const refreshTokenValue = data.refreshToken || '';
      
      // 使用令牌服务设置令牌
      tokenService.setTokens(accessTokenValue, refreshTokenValue);
      
      // 提取角色ID和名称的函数
      const extractRoleInfo = (data: any) => {
        // 尝试从 data.role 获取 (优先)
        if (data.role) {
          if (typeof data.role === 'object' && data.role !== null) {
            return {
              id: data.role.id,
              name: data.role.name
            };
          } else if (typeof data.role === 'string') {
            return {
              id: data.role,
              name: undefined
            };
          }
        }
        
        // 尝试从 data.user.role 获取
        if (data.user && data.user.role) {
          if (typeof data.user.role === 'object' && data.user.role !== null) {
            return {
              id: data.user.role.id,
              name: data.user.role.name
            };
          } else if (typeof data.user.role === 'string') {
            return {
              id: data.user.role,
              name: undefined
            };
          }
        }
        
        // 最后尝试从 roleList 获取第一个角色
        if (data.roleList && Array.isArray(data.roleList) && data.roleList.length > 0) {
          const firstRole = data.roleList[0];
          if (firstRole && typeof firstRole === 'object') {
            return {
              id: firstRole.id,
              name: firstRole.name
            };
          }
        }
        
        // 如果都没有找到，返回默认值
        return {
          id: 'user',
          name: '普通用户'
        };
      };

      // 提取角色信息
      const roleInfo = extractRoleInfo(data);
      console.log('提取的角色信息:', roleInfo);
      
      // 构建用户信息
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
        role: roleInfo.id,
        roleName: roleInfo.name,
        school: data.school?.name,
        schoolId: data.user.schoolId || data.school?.id,
        schoolName: data.user.schoolName || data.school?.name,
        permissions: data.permissions,
      };
      
      // 保存用户信息到localStorage，作为备份
      try {
        localStorage.setItem('user', JSON.stringify(user));
        console.log('用户信息已保存到localStorage');
      } catch (userStorageError) {
        console.error('保存用户信息到localStorage失败:', userStorageError);
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
      
      // 记录登录成功信息
      console.log(`用户 [${user.name}] 登录成功，角色 [${user.role}]`);
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
      
      // 提取角色ID和名称的函数
      const extractRoleInfo = (data: any) => {
        // 尝试从 data.role 获取 (优先)
        if (data.role) {
          if (typeof data.role === 'object' && data.role !== null) {
            return {
              id: data.role.id,
              name: data.role.name
            };
          } else if (typeof data.role === 'string') {
            return {
              id: data.role,
              name: undefined
            };
          }
        }
        
        // 尝试从 data.user.role 获取
        if (data.user && data.user.role) {
          if (typeof data.user.role === 'object' && data.user.role !== null) {
            return {
              id: data.user.role.id,
              name: data.user.role.name
            };
          } else if (typeof data.user.role === 'string') {
            return {
              id: data.user.role,
              name: undefined
            };
          }
        }
        
        // 最后尝试从 roleList 获取第一个角色
        if (data.roleList && Array.isArray(data.roleList) && data.roleList.length > 0) {
          const firstRole = data.roleList[0];
          if (firstRole && typeof firstRole === 'object') {
            return {
              id: firstRole.id,
              name: firstRole.name
            };
          }
        }
        
        // 如果都没有找到，返回默认值
        return {
          id: 'user',
          name: '普通用户'
        };
      };

      // 提取角色信息
      const roleInfo = extractRoleInfo(data);
      console.log('验证码登录 - 提取的角色信息:', roleInfo);
      
      // 构建用户信息
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
        role: roleInfo.id,
        roleName: roleInfo.name,
        school: data.school?.name,
        schoolId: data.user.schoolId || data.school?.id,
        schoolName: data.user.schoolName || data.school?.name,
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
      
      // 记录登录成功信息
      console.log(`用户 [${user.name}] 登录成功，角色 [${user.role}]`);
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
      
      // 获取当前令牌用于API调用
      const currentToken = tokenService.getAccessToken();
      
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
      
      // 清除令牌
      await tokenService.clearTokens();
      console.log('已清除所有令牌');
      
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