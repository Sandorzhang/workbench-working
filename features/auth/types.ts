/**
 * Type definitions for auth
 */

/**
 * User interface
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
 * Login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login response
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

/**
 * Phone verification code request
 */
export interface VerificationCodeRequest {
  phone: string;
}

/**
 * Code login credentials
 */
export interface CodeLoginCredentials {
  phone: string;
  code: string;
  rememberMe?: boolean;
}

/**
 * Profile update request
 */
export interface ProfileUpdateRequest {
  fullName?: string;
  email?: string;
  avatar?: string;
  [key: string]: any;
}
