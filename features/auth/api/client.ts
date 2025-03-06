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
  ProfileUpdateRequest
} from '../types';
// Uncomment and adapt as needed:
// import { Type1, Type2 } from '../types';

// Feature name - used to create all API paths consistently
const FEATURE = 'auth';

/**
 * 认证API客户端
 */
export const authApi = {
  /**
   * 用户名密码登录
   * @param credentials 登录凭证（用户名和密码）
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
    return handleRequest(
      buildApiPath(FEATURE, '/login'),
      {
        method: 'POST',
        body: JSON.stringify(credentials)
      }
    );
  },

  /**
   * 发送手机验证码
   * @param data 手机号
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
   * @param credentials 手机号和验证码
   */
  loginWithCode: async (credentials: CodeLoginCredentials): Promise<ApiResponse<LoginResponse>> => {
    return handleRequest(
      buildApiPath(FEATURE, '/login-with-code'),
      {
        method: 'POST',
        body: JSON.stringify(credentials)
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
   * 登出
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
   * @param data 包含旧密码和新密码的数据
   */
  changePassword: async (data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<{ success: boolean }>> => {
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
  validateToken: async (token: string): Promise<ApiResponse<{ valid: boolean }>> => {
    return handleRequest(
      buildApiPath(FEATURE, '/validate-token'),
      {
        method: 'POST',
        body: JSON.stringify({ token })
      }
    );
  }
};
