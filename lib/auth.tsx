"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { authApi } from '@/features/auth/api/client';
import { IUser, LoginCredentials, LoginResponse, CodeLoginCredentials } from '@/features/auth/types';
import tokenService from '@/shared/auth/token-service';

// 定义角色常量
const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

// 定义角色对应的起始页面
const ROLE_ROUTES = {
  [ROLES.SUPERADMIN]: '/superadmin/dashboard',
  [ROLES.ADMIN]: '/school/dashboard',
  [ROLES.TEACHER]: '/school/classroom',
  [ROLES.STUDENT]: '/school/learning'
};

// 定义角色分组
const SCHOOL_ROLES = [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT];

// 定义界面类型
const UI_TYPE = {
  SUPERADMIN: 'superadmin', // 超管端
  SCHOOL: 'school'          // 校端
};

declare global {
  interface Window {
    __AUTH_TOKEN__?: string;
    __MSW_READY__?: boolean;
  }
}

/**
 * 用户类型
 */
interface User {
  id: string;
  name: string;
  email?: string | null;
  avatar?: string | null;
  role?: string;
  roleName?: string;
  school?: string;
  schoolId?: string;
  schoolName?: string;
  permissions?: string[];
}

/**
 * 认证上下文状态
 */
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  permissions: string[];
}

/**
 * 认证上下文方法
 */
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  loginWithCode: (phone: string, code: string) => Promise<void>;
  sendVerificationCode: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证提供者属性
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 提取角色信息的辅助函数
 * @param data API返回的用户数据
 * @returns 角色ID和名称，如果未找到则返回null
 */
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
  
  // 如果都没有找到，返回null表示未找到角色
  return null;
};

/**
 * 获取界面类型
 * @param roleId 角色ID
 * @returns 界面类型 (superadmin 或 school)
 */
const getUiType = (roleId: string): string => {
  if (roleId === ROLES.SUPERADMIN) {
    return UI_TYPE.SUPERADMIN;
  }
  if (SCHOOL_ROLES.includes(roleId)) {
    return UI_TYPE.SCHOOL;
  }
  // 默认返回校端
  return UI_TYPE.SCHOOL;
};

/**
 * 获取角色对应的默认路由
 * @param roleId 角色ID
 * @returns 默认路由路径
 */
const getDefaultRoute = (roleId: string): string => {
  return ROLE_ROUTES[roleId] || '/login';
};

/**
 * 认证提供者组件
 */
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

  /**
   * 检查用户认证状态
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = tokenService.getAccessToken();
        
        if (!accessToken) {
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
        
        // 尝试从localStorage获取用户信息 (兼容性)
        try {
          const userJson = localStorage.getItem('user');
          if (userJson) {
            const storedUserData = JSON.parse(userJson);
            
            setState({
              isAuthenticated: true,
              user: storedUserData,
              accessToken,
              refreshToken: localStorage.getItem('refreshToken') || null,
              isLoading: false,
              error: null,
              permissions: storedUserData.permissions || [],
            });
            return;
          }
        } catch (parseError) {
          console.error('解析localStorage中的用户信息失败:', parseError);
        }
        
        // 尝试从API获取用户信息
        const userResponse = await authApi.getCurrentUser();
        
        if (!userResponse.success) {
          throw new Error(userResponse.message || '获取用户信息失败');
        }
        
        const apiUserData = userResponse.data;
        
        // 提取角色信息
        const roleInfo = extractRoleInfo(apiUserData);
        
        // 检查是否找到角色
        if (roleInfo === null) {
          toast.error('用户角色未找到，请联系管理员');
          throw new Error('用户角色未找到');
        }
        
        // 构建用户信息 - 从API响应映射到User接口
        const user: User = {
          id: apiUserData.id,
          name: apiUserData.username || apiUserData.fullName || '', // 使用username或fullName
          email: apiUserData.email || null,
          avatar: apiUserData.avatar || null,
          role: roleInfo.id,
          roleName: roleInfo.name,
          // 从currentSchool映射学校信息
          school: apiUserData.currentSchool?.name,
          schoolId: apiUserData.currentSchool?.id,
          schoolName: apiUserData.currentSchool?.name,
          permissions: apiUserData.permissions || [],
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
          permissions: apiUserData.permissions || [],
        });

        toast.success('登录成功');
      } catch (error) {
        console.error('认证检查失败:', error);
        
        // 清除认证状态
        handleAuthError();
      }
    };

    checkAuth();
  }, []);

  /**
   * 处理认证错误
   */
  const handleAuthError = () => {
    // 清除令牌
    tokenService.clearTokens();
    
    // 重置认证状态
    setState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: '认证失败，请重新登录',
      permissions: [],
    });
  };

  /**
   * 处理用户登录响应
   * @param data 登录响应数据
   * @returns 用户信息
   */
  const processLoginResponse = (data: any): User => {
    // 设置token
    const accessTokenValue = data.accessToken || '';
    const refreshTokenValue = data.refreshToken || '';
    
    tokenService.setTokens(accessTokenValue, refreshTokenValue);
    
    // 提取角色信息
    const roleInfo = extractRoleInfo(data);
    
    // 检查是否找到角色
    if (roleInfo === null) {
      toast.error('用户角色未找到，请联系管理员');
      throw new Error('用户角色未找到');
    }
    
    // IUser和User之间的字段映射
    // 后端可能返回IUser，我们需要将其映射到本地User接口
    const userInfo = data.user;
    
    // 构建用户信息 - 使用本地User接口定义
    const user: User = {
      id: userInfo.id,
      // 优先使用name，后备使用username
      name: userInfo.name || userInfo.username || '',
      email: userInfo.email,
      avatar: userInfo.avatar,
      role: roleInfo.id,
      roleName: roleInfo.name,
      
      // 学校相关信息 - 从多个可能的来源获取
      school: data.school?.name,
      schoolId: userInfo.currentSchool?.id || data.school?.id,
      schoolName: userInfo.currentSchool?.name || data.school?.name,
      
      // 权限信息
      permissions: data.permissions || userInfo.permissions || [],
    };
    
    // 保存用户信息到localStorage
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (userStorageError) {
      console.error('保存用户信息到localStorage失败:', userStorageError);
    }
    
    return user;
  };

  /**
   * 用户名密码登录
   * @param username 用户名
   * @param password 密码
   */
  const handleLogin = async (username: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const credentials: LoginCredentials = {
        username,
        password,
        rememberMe: true
      };
      
      const response = await authApi.login(credentials);
      
      if (!response.success) {
        throw new Error(response.message || '登录失败');
      }
      
      const data = response.data;
      
      try {
        // 处理登录响应（可能会抛出角色未找到错误）
        const user = processLoginResponse(data);
        
        // 获取用户界面类型
        const uiType = getUiType(user.role!);
        
        // 更新认证状态
        setState({
          isAuthenticated: true,
          user,
          accessToken: data.accessToken || '',
          refreshToken: data.refreshToken || '',
          isLoading: false,
          error: null,
          permissions: data.permissions || [],
        });
        
        toast.success('登录成功');
        
        // 可以根据角色重定向到相应的界面
        setTimeout(() => {
          window.location.href = getDefaultRoute(user.role!);
        }, 1000);
      } catch (roleError: any) {
        // 专门处理角色未找到的错误
        console.error('处理登录响应失败:', roleError);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: roleError.message || '登录处理失败'
        }));
        // toast已经在processLoginResponse中显示
      }
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

  /**
   * 发送验证码
   * @param phone 手机号
   */
  const handleSendVerificationCode = async (phone: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authApi.sendVerificationCode({ phone });
      
      if (!response.success) {
        throw new Error(response.message || '发送验证码失败');
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
      toast.success('验证码已发送，请查收');
    } catch (error: any) {
      console.error('发送验证码失败:', error);
      const errorMessage = error.message || '发送验证码失败';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      toast.error(errorMessage);
    }
  };

  /**
   * 验证码登录
   * @param phone 手机号
   * @param code 验证码
   */
  const handleLoginWithCode = async (phone: string, code: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const credentials: CodeLoginCredentials = {
        phone,
        code,
        rememberMe: true
      };
      
      const response = await authApi.loginWithCode(credentials);
      
      if (!response.success) {
        throw new Error(response.message || '验证码登录失败');
      }
      
      const data = response.data;
      
      try {
        // 处理登录响应（可能会抛出角色未找到错误）
        const user = processLoginResponse(data);
        
        // 获取用户界面类型
        const uiType = getUiType(user.role!);
        
        // 更新认证状态
        setState({
          isAuthenticated: true,
          user,
          accessToken: data.accessToken || '',
          refreshToken: data.refreshToken || '',
          isLoading: false,
          error: null,
          permissions: data.permissions || [],
        });
        
        toast.success('登录成功');
        
        // 可以根据角色重定向到相应的界面
        setTimeout(() => {
          window.location.href = getDefaultRoute(user.role!);
        }, 1000);
      } catch (roleError: any) {
        // 专门处理角色未找到的错误
        console.error('处理登录响应失败:', roleError);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: roleError.message || '登录处理失败'
        }));
        // toast已经在processLoginResponse中显示
      }
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

  /**
   * 退出登录
   */
  const handleLogout = async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // 调用登出API
      await authApi.logout();
      
      // 清除令牌
      tokenService.clearTokens();
      
      // 清除localStorage中的用户信息
      try {
        localStorage.removeItem('user');
      } catch (error) {
        console.error('清除localStorage中的用户信息失败:', error);
      }
      
      // 重置认证状态
      setState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: null,
        permissions: [],
      });
      
      toast.success('已退出登录');
    } catch (error) {
      console.error('登出失败:', error);
      
      // 即使API调用失败，也清除本地认证状态
      tokenService.clearTokens();
      
      try {
        localStorage.removeItem('user');
      } catch (storageError) {
        console.error('清除localStorage中的用户信息失败:', storageError);
      }
      
      setState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: null,
        permissions: [],
      });
      
      toast.success('已退出登录');
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        ...state,
        login: handleLogin,
        loginWithCode: handleLoginWithCode,
        sendVerificationCode: handleSendVerificationCode,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 使用认证上下文的Hook
 * @returns 认证上下文
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * 认证高阶组件
 * @param Component 需要认证保护的组件
 * @returns 带有认证保护的组件
 */
export const withAuth = (Component: React.ComponentType<any>) => {
  const AuthenticatedComponent = (props: any) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    
    // 如果正在加载，显示加载提示
    if (isLoading) {
      return <div className="p-4 text-center">加载中...</div>;
    }
    
    // 如果未认证，重定向到登录页面
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }
    
    // 已认证，正常渲染组件
    return <Component {...props} />;
  };
  
  return AuthenticatedComponent;
};

/**
 * 需要超管角色的高阶组件
 * @param Component 需要超管角色的组件
 * @returns 带有角色保护的组件
 */
export const withSuperAdminRole = (Component: React.ComponentType<any>) => {
  const SuperAdminComponent = (props: any) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    
    // 如果正在加载，显示加载提示
    if (isLoading) {
      return <div className="p-4 text-center">加载中...</div>;
    }
    
    // 如果未认证，重定向到登录页面
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }
    
    // 如果不是超级管理员，重定向到无权限页面
    if (user?.role !== ROLES.SUPERADMIN) {
      if (typeof window !== 'undefined') {
        window.location.href = '/unauthorized';
      }
      return null;
    }
    
    // 已认证且是超级管理员，正常渲染组件
    return <Component {...props} />;
  };
  
  return SuperAdminComponent;
};

/**
 * 需要校端角色的高阶组件
 * @param Component 需要校端角色的组件
 * @returns 带有角色保护的组件
 */
export const withSchoolRole = (Component: React.ComponentType<any>) => {
  const SchoolRoleComponent = (props: any) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    
    // 如果正在加载，显示加载提示
    if (isLoading) {
      return <div className="p-4 text-center">加载中...</div>;
    }
    
    // 如果未认证，重定向到登录页面
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }
    
    // 如果不是校端角色，重定向到无权限页面
    if (!user?.role || !SCHOOL_ROLES.includes(user.role)) {
      if (typeof window !== 'undefined') {
        window.location.href = '/unauthorized';
      }
      return null;
    }
    
    // 已认证且是校端角色，正常渲染组件
    return <Component {...props} />;
  };
  
  return SchoolRoleComponent;
}; 