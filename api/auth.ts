export const api = {
    // 用户认证
    auth: {
      // 账号密码登录
      login: async (username: string, password: string) => {
        console.log(`尝试登录，用户名: ${username}`);
        
        try {
          return await handleRequest(`/auth/login`, {
            method: 'POST',
            data: { 
              username, 
              password,
              // 添加登录类型标识，方便后端识别
              loginType: 'password'
            }
          });
        } catch (error) {
          console.error('登录失败:', error);
          // 重新抛出错误以便被上层处理
          throw error;
        }
      },
      
      // 验证码登录
      loginWithCode: (phone: string, code: string) => 
        handleRequest(`/auth/login-with-code`, {
          method: 'POST',
          data: { 
            phone, 
            code,
            loginType: 'code'
          }
        }),
      
      // 发送短信验证码
      sendVerificationCode: (phone: string) => 
        handleRequest(`/auth/send-code`, {
          method: 'POST',
          data: { phone }
        }),
      
      // 退出登录
      logout: () => 
        handleRequest(`/auth/logout`, {
          method: 'POST'
        }),
      
      // 获取当前用户信息
      getCurrentUser: () => 
        handleRequest(`/auth/user`)
    },