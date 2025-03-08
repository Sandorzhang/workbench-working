/**
 * Client-side API methods for auth
 */
import { buildApiPath, handleRequest, ApiResponse } from '@/shared/api/core';
import { 
  IUser, 
  LoginCredentials, 
  LoginResponse, 
  VerificationCodeRequest,
  CodeLoginCredentials,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  TokenValidationResponse
} from '../types';
// Uncomment and adapt as needed:
// import { Type1, Type2 } from '../types';

// Feature name - used to create all API paths consistently
const FEATURE = 'auth';

/**
 * 认证API客户端
 * 
 * 这个模块提供了与认证相关的API方法，包括登录、登出和用户信息获取等。
 * 在开发环境中，这些请求会被MSW拦截并返回模拟数据。
 */
export const authApi = {
  /**
   * 用户名密码登录
   * @param credentials 登录凭证
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
    // 转换为MSW期望的格式
    const payload = {
      identity: credentials.username,
      verify: credentials.password,
      type: 'ACCOUNT',
      rememberMe: credentials.rememberMe
    };
    
    return handleRequest(
      buildApiPath(FEATURE, '/login'),
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  /**
   * 发送手机验证码
   * @param data 手机号请求
   */
  sendVerificationCode: async (data: VerificationCodeRequest): Promise<ApiResponse<{ success: boolean }>> => {
    return handleRequest(
      buildApiPath(FEATURE, '/send-code'),
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * 验证码登录
   * @param credentials 验证码登录凭证
   */
  loginWithCode: async (credentials: CodeLoginCredentials): Promise<ApiResponse<LoginResponse>> => {
    // 转换为MSW期望的格式
    const payload = {
      identity: credentials.phone,
      verify: credentials.code,
      type: 'PHONE',
      rememberMe: credentials.rememberMe
    };
    
    return handleRequest(
      buildApiPath(FEATURE, '/login-with-code'),
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  /**
   * 获取当前登录用户信息
   */
  getCurrentUser: async (): Promise<ApiResponse<IUser>> => {
    return handleRequest(buildApiPath(FEATURE, '/me'));
  },

  /**
   * 退出登录
   */
  logout: async (): Promise<ApiResponse<{ success: boolean }>> => {
    return handleRequest(
      buildApiPath(FEATURE, '/logout'),
      { method: 'POST' }
    );
  },

  /**
   * 刷新令牌
   * @param refreshToken 刷新令牌
   */
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    return handleRequest(
      buildApiPath(FEATURE, '/refresh-token'),
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      }
    );
  },

  /**
   * 更新用户资料
   * @param data 要更新的资料
   */
  updateProfile: async (data: ProfileUpdateRequest): Promise<ApiResponse<IUser>> => {
    return handleRequest(
      buildApiPath(FEATURE, '/profile'),
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * 修改密码
   * @param data 密码修改请求
   */
  changePassword: async (data: PasswordChangeRequest): Promise<ApiResponse<{ success: boolean }>> => {
    return handleRequest(
      buildApiPath(FEATURE, '/change-password'),
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * 验证令牌是否有效
   * @param token 访问令牌
   */
  validateToken: async (token: string): Promise<ApiResponse<TokenValidationResponse>> => {
    return handleRequest(
      buildApiPath(FEATURE, '/validate-token'),
      {
        method: 'POST',
        body: JSON.stringify({ token })
      }
    );
  }
};
