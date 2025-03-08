/**
 * Type definitions for auth feature
 */

/**
 * 用户接口
 */
export interface IUser {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  role: string;
  permissions?: string[];
  schools?: Array<{
    id: string;
    name: string;
  }>;
  currentSchool?: {
    id: string;
    name: string;
  };
}

/**
 * 登录凭证
 */
export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
  permissions?: string[];
  school?: {
    id: string;
    name: string;
  };
  roleList?: Array<{
    id: string;
    name: string;
  }>;
}

/**
 * 手机验证码请求
 */
export interface VerificationCodeRequest {
  phone: string;
}

/**
 * 验证码登录凭证
 */
export interface CodeLoginCredentials {
  phone: string;
  code: string;
  rememberMe?: boolean;
}

/**
 * 个人资料更新请求
 */
export interface ProfileUpdateRequest {
  fullName?: string;
  email?: string;
  avatar?: string;
  [key: string]: any;
}

/**
 * 密码修改请求
 */
export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 令牌验证响应
 */
export interface TokenValidationResponse {
  valid: boolean;
  expired?: boolean;
  message?: string;
}
