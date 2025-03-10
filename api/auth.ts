import request from "./request";

// 用户认证相关

// 账号密码登录
export const login = (username: string, password: string) =>
  request.post(`/auth/login`, {
    username,
    password,
    loginType: "password",
  });

// 验证码登录
export const loginWithCode = (phone: string, code: string) =>
  request.post(`/auth/login-with-code`, {
    phone,
    code,
    loginType: "code",
  });

// 发送短信验证码
export const sendVerificationCode = (phone: string) =>
  request.post(`/auth/send-code`, { phone });

// 退出登录
export const logout = () => request.post(`/auth/logout`);

// 获取当前用户信息
export const getCurrentUser = () => request.get(`/auth/user`);
