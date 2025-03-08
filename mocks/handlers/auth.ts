import { http, HttpResponse, delay } from 'msw';
import { db, saveDb } from '../db';
import { logRequest, logResponse, logHandlerError } from '../debug-logger';

// 生成随机令牌
const generateToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// 测试模式配置
const TEST_MODE = process.env.NODE_ENV === 'development';
const TEST_VERIFICATION_CODE = '123456';

// 验证码存储 (模拟)
const verificationCodes = new Map();

// 登录尝试记录
interface LoginAttempt {
  count: number;        // 尝试次数
  lastAttempt: number;  // 最后尝试时间戳
  blocked: boolean;     // 是否被阻止
  blockExpires?: number; // 阻止到期时间
}

// 存储IP地址的登录尝试 - 在实际环境中应使用Redis等持久化存储
const loginAttempts = new Map<string, LoginAttempt>();

// 登录尝试限制配置
const MAX_LOGIN_ATTEMPTS = 5;        // 最大尝试次数
const BLOCK_DURATION = 15 * 60 * 1000; // 阻止时长(15分钟)
const ATTEMPT_RESET = 60 * 60 * 1000;  // 尝试重置时间(1小时)

// 检查和更新登录尝试
const checkLoginAttempt = (ipAddress: string): { allowed: boolean; message?: string } => {
  // 测试模式跳过检查
  if (TEST_MODE && ipAddress === 'test-ip') {
    return { allowed: true };
  }
  
  // 获取IP的尝试记录，如不存在则初始化
  const now = Date.now();
  const attempt = loginAttempts.get(ipAddress) || { count: 0, lastAttempt: 0, blocked: false };
  
  // 检查是否被阻止
  if (attempt.blocked) {
    // 检查阻止是否过期
    if (attempt.blockExpires && now > attempt.blockExpires) {
      // 阻止已过期，重置尝试记录
      loginAttempts.set(ipAddress, { count: 1, lastAttempt: now, blocked: false });
      return { allowed: true };
    }
    
    // 仍处于阻止期
    const remainingMinutes = Math.ceil(((attempt.blockExpires || 0) - now) / (60 * 1000));
    return { 
      allowed: false, 
      message: `登录尝试次数过多，请等待 ${remainingMinutes} 分钟后再试`
    };
  }
  
  // 检查是否应重置尝试计数 (超过1小时)
  if (now - attempt.lastAttempt > ATTEMPT_RESET) {
    loginAttempts.set(ipAddress, { count: 1, lastAttempt: now, blocked: false });
    return { allowed: true };
  }
  
  // 更新尝试次数
  attempt.count += 1;
  attempt.lastAttempt = now;
  
  // 检查是否超过最大尝试次数
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.blocked = true;
    attempt.blockExpires = now + BLOCK_DURATION;
    loginAttempts.set(ipAddress, attempt);
    
    return { 
      allowed: false, 
      message: `登录尝试次数过多，请等待 15 分钟后再试`
    };
  }
  
  // 更新尝试记录
  loginAttempts.set(ipAddress, attempt);
  
  // 允许尝试，但返回剩余尝试次数
  const remainingAttempts = MAX_LOGIN_ATTEMPTS - attempt.count;
  console.log(`IP ${ipAddress} 登录尝试 ${attempt.count}/${MAX_LOGIN_ATTEMPTS}, 剩余 ${remainingAttempts} 次尝试`);
  
  return { allowed: true };
};

// 定义请求类型
interface LoginRequest {
  identity: string;
  verify: string;
  type: string;
}

interface PhoneRequest {
  phone: string;
}

interface CodeLoginRequest {
  phone: string;
  code: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface ValidateTokenRequest {
  token: string;
}

interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileUpdateRequest {
  email?: string;
  fullName?: string;
  avatar?: string;
  [key: string]: any;
}

// 适配URL模式
const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

export const authHandlers = [
  // 账号密码登录 - 使用多个路径模式以确保正确匹配
  http.post('*/api/auth/login', async ({ request }) => {
    const handlerName = 'auth.login (通配路径)';
    const requestInfo = logRequest(request, handlerName);
    
    try {
      await delay(500);
      
      // 记录请求详细信息，帮助调试
      const requestUrl = request.url;
      console.log(`收到登录请求 - URL: ${requestUrl}`);
      
      // 获取IP地址 (在MSW中模拟)
      const ipAddress = request.headers.get('x-forwarded-for') || 
                         request.headers.get('x-real-ip') || 
                         'unknown-ip';
      
      // 检查登录尝试限制
      const attemptCheck = checkLoginAttempt(ipAddress);
      if (!attemptCheck.allowed) {
        console.log(`登录尝试受限: IP ${ipAddress} - ${attemptCheck.message}`);
        
        const response = HttpResponse.json({
          code: 429,
          message: attemptCheck.message || '登录尝试次数过多，请稍后再试',
          success: false,
          data: null
        }, { status: 429 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      }
      
      // 解析请求体
      const body = await request.json() as LoginRequest;
      const { identity, verify, type } = body;
      
      console.log(`尝试账号登录: ${identity}, 类型: ${type}`);
      
      // 检查必要字段
      if (!identity || !verify) {
        console.log('登录失败: 缺少必要字段');
        const response = HttpResponse.json({
          code: 400,
          message: '用户名和密码不能为空',
          success: false,
          data: null
        }, { status: 400 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      }

      // 添加开发环境中的默认账号
      // 这确保即使在无法连接实际后端时也能进行测试
      const devAccounts = [
        { username: 'admin', password: 'admin', role: 'admin', name: '系统管理员' },
        { username: 'teacher', password: 'teacher', role: 'teacher', name: '张老师' },
        { username: 'student', password: 'student', role: 'student', name: '李同学' },
        { username: 'superadmin', password: 'superadmin', role: 'superadmin', name: '超级管理员' }
      ];

      // 检查是否是开发账号
      const devAccount = devAccounts.find(account => 
        identity === account.username && verify === account.password
      );

      if (devAccount) {
        console.log(`开发账号 ${devAccount.username} 登录成功`);
        
        const accessToken = generateToken();
        const refreshToken = generateToken();
        
        // 在db中创建session记录
        db.session.create({
          id: generateToken(),
          userId: devAccount.username === 'admin' ? '1' : 
                  devAccount.username === 'teacher' ? '2' : 
                  devAccount.username === 'student' ? '3' : '4',
          token: accessToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
        });
        
        console.log(`已创建${devAccount.name}session记录, accessToken:`, accessToken);
        
        // 返回登录成功响应
        const response = HttpResponse.json({
          code: 0,
          message: '登录成功',
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: {
              id: devAccount.username === 'admin' ? '1' : 
                  devAccount.username === 'teacher' ? '2' : 
                  devAccount.username === 'student' ? '3' : '4',
              username: devAccount.username,
              email: `${devAccount.username}@example.com`,
              name: devAccount.name,
              fullName: devAccount.name,
              avatar: `/avatars/${devAccount.username}.png`,
              role: devAccount.role,
              permissions: devAccount.role === 'admin' || devAccount.role === 'superadmin' ? ['*'] : 
                         devAccount.role === 'teacher' ? ['classroom:read', 'classroom:write', 'student:read'] :
                         ['course:read']
            }
          }
        }, { status: 200 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      }
      
      // 其他账号 - 动态测试
      if (identity === 'admin' && verify === 'admin') {
        console.log('管理员登录成功');
        
        const accessToken = generateToken();
        const refreshToken = generateToken();
        
        // 在db中创建session记录
        db.session.create({
          id: generateToken(),
          userId: '1',
          token: accessToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
        });
        
        console.log('已创建管理员session记录, accessToken:', accessToken);
        
        // 返回登录成功响应
        const response = HttpResponse.json({
          code: 0,
          message: '登录成功',
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: {
              id: '1',
              username: 'admin',
              email: 'admin@example.com',
              name: '系统管理员',
              fullName: '系统管理员',
              avatar: '/avatars/admin.png',
              role: 'admin',
              permissions: ['*']
            }
          }
        }, { status: 200 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      } 
      // 教师账号
      else if (identity === 'teacher' && verify === 'teacher') {
        console.log('教师登录成功');
        
        const accessToken = generateToken();
        const refreshToken = generateToken();
        
        // 在db中创建session记录
        db.session.create({
          id: generateToken(),
          userId: '2',
          token: accessToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
        });
        
        console.log('已创建教师session记录');
        
        return HttpResponse.json({
          code: 0,
          message: '登录成功',
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: {
              id: '2',
              username: 'teacher',
              email: 'teacher@example.com',
              name: '张老师',
              fullName: '张老师',
              avatar: '/avatars/teacher.png',
              role: 'teacher',
              permissions: ['classroom:read', 'classroom:write', 'student:read']
            }
          }
        }, { status: 200 });
      }
      // 学生账号
      else if (identity === 'student' && verify === 'student') {
        console.log('学生登录成功');
        
        const accessToken = generateToken();
        const refreshToken = generateToken();
        
        // 在db中创建session记录
        db.session.create({
          id: generateToken(),
          userId: '3',
          token: accessToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
        });
        
        console.log('已创建学生session记录');
        
        return HttpResponse.json({
          code: 0,
          message: '登录成功',
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: {
              id: '3',
              username: 'student',
              email: 'student@example.com',
              name: '李同学',
              fullName: '李同学',
              avatar: '/avatars/student.png',
              role: 'student',
              permissions: ['course:read']
            }
          }
        }, { status: 200 });
      } 
      // 其他账号 - 动态测试
      else {
        // 尝试找到匹配的用户
        let user = db.user.findFirst({
          where: { username: { equals: identity } }
        });
        
        // 如果没找到，尝试用邮箱查找
        if (!user) {
          user = db.user.findFirst({
            where: { email: { equals: identity } }
          });
        }
        
        // 如果没找到，尝试用电话查找
        if (!user) {
          user = db.user.findFirst({
            where: { phone: { equals: identity } }
          });
        }

        // 如果找到用户并且密码正确
        if (user && user.password === verify) {
          console.log(`用户 ${user.username || identity} 登录成功`);
          
          const accessToken = generateToken();
          const refreshToken = generateToken();
          
          // 在db中创建session记录
          db.session.create({
            id: generateToken(),
            userId: user.id,
            token: accessToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
          });
          
          console.log(`已创建用户 ${user.username || identity} 的session记录`);
          
          // 确保用户有名称，如果name未设置但username存在，则使用username
          const userName = user.name || user.username || identity;
          
          return HttpResponse.json({
            code: 0,
            message: '登录成功',
            success: true,
            data: {
              accessToken,
              refreshToken,
              user: {
                id: user.id,
                username: user.username || identity,
                email: user.email || `${identity}@example.com`,
                name: userName,
                fullName: userName,
                avatar: user.avatar || '/avatars/default.png',
                role: user.role || 'user',
                permissions: ['basic:read']
              }
            }
          }, { status: 200 });
        }
        
        // 用户不存在
        if (!user) {
          console.log(`用户不存在: ${identity}`);
          return HttpResponse.json({
            code: 401,
            message: '用户名或密码错误',
            success: false,
            data: null
          }, { status: 401 });
        }
        
        // 密码不正确 (模拟环境下简化为固定密码验证)
        if (verify !== 'password' && verify !== '123456') {
          console.log(`密码不正确: ${identity}`);
          return HttpResponse.json({
            code: 401,
            message: '用户名或密码错误',
            success: false,
            data: null
          }, { status: 401 });
        }
        
        console.log(`用户 ${identity} 登录成功`);
        
        const accessToken = generateToken();
        const refreshToken = generateToken();
        
        // 构建用户信息
        const userInfo = {
          id: user.id || '123',
          username: user.username || identity,
          email: user.email || `${identity}@example.com`,
          name: user.name || identity,
          avatar: user.avatar || `/avatars/default.png`,
          role: user.role || 'user'
        };
        
        return HttpResponse.json({
          code: 0,
          message: '登录成功',
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: userInfo
          }
        }, { status: 200 });
      }
    } catch (error) {
      console.error('登录处理程序出错:', error);
      logHandlerError(error, request, handlerName);
      
      const response = HttpResponse.json({
        code: 500,
        message: '服务器内部错误',
        success: false,
        data: null
      }, { status: 500 });
      
      logResponse(response, requestInfo, handlerName);
      return response;
    }
  }),
  
  // 添加准确的绝对路径匹配
  http.post('http://localhost:3000/api/auth/login', async ({ request }) => {
    const handlerName = 'auth.login (绝对路径-localhost)';
    const requestInfo = logRequest(request, handlerName);
    
    try {
      await delay(500);
      
      // 记录请求详细信息，帮助调试
      const requestUrl = request.url;
      console.log(`收到登录请求 - URL: ${requestUrl}`);
      
      // 获取IP地址 (在MSW中模拟)
      const ipAddress = request.headers.get('x-forwarded-for') || 
                         request.headers.get('x-real-ip') || 
                         'unknown-ip';
      
      // 检查登录尝试限制
      const attemptCheck = checkLoginAttempt(ipAddress);
      if (!attemptCheck.allowed) {
        console.log(`登录尝试受限: IP ${ipAddress} - ${attemptCheck.message}`);
        
        const response = HttpResponse.json({
          code: 429,
          message: attemptCheck.message || '登录尝试次数过多，请稍后再试',
          success: false,
          data: null
        }, { status: 429 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      }
      
      // 解析请求体
      const body = await request.json() as LoginRequest;
      const { identity, verify, type } = body;
      
      console.log(`尝试账号登录: ${identity}, 类型: ${type}`);
      
      // 检查必要字段
      if (!identity || !verify) {
        console.log('登录失败: 缺少必要字段');
        const response = HttpResponse.json({
          code: 400,
          message: '用户名和密码不能为空',
          success: false,
          data: null
        }, { status: 400 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      }
      
      // 其他账号 - 动态测试
      if (identity === 'admin' && verify === 'admin') {
        console.log('管理员登录成功');
        
        const accessToken = generateToken();
        const refreshToken = generateToken();
        
        // 在db中创建session记录
        db.session.create({
          id: generateToken(),
          userId: '1',
          token: accessToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
        });
        
        console.log('已创建管理员session记录, accessToken:', accessToken);
        
        // 返回登录成功响应
        const response = HttpResponse.json({
          code: 0,
          message: '登录成功',
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: {
              id: '1',
              username: 'admin',
              email: 'admin@example.com',
              name: '系统管理员',
              fullName: '系统管理员',
              avatar: '/avatars/admin.png',
              role: 'admin',
              permissions: ['*']
            }
          }
        }, { status: 200 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      } 
      // 教师账号
      else if (identity === 'teacher' && verify === 'teacher') {
        console.log('教师登录成功');
        
        const accessToken = generateToken();
        const refreshToken = generateToken();
        
        // 在db中创建session记录
        db.session.create({
          id: generateToken(),
          userId: '2',
          token: accessToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
        });
        
        console.log('已创建教师session记录');
        
        return HttpResponse.json({
          code: 0,
          message: '登录成功',
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: {
              id: '2',
              username: 'teacher',
              email: 'teacher@example.com',
              name: '张老师',
              fullName: '张老师',
              avatar: '/avatars/teacher.png',
              role: 'teacher',
              permissions: ['classroom:read', 'classroom:write', 'student:read']
            }
          }
        }, { status: 200 });
      }
      // 学生账号
      else if (identity === 'student' && verify === 'student') {
        console.log('学生登录成功');
        
        const accessToken = generateToken();
        const refreshToken = generateToken();
        
        // 在db中创建session记录
        db.session.create({
          id: generateToken(),
          userId: '3',
          token: accessToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
        });
        
        console.log('已创建学生session记录');
        
        return HttpResponse.json({
          code: 0,
          message: '登录成功',
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: {
              id: '3',
              username: 'student',
              email: 'student@example.com',
              name: '李同学',
              fullName: '李同学',
              avatar: '/avatars/student.png',
              role: 'student',
              permissions: ['course:read']
            }
          }
        }, { status: 200 });
      } 
      // 其他账号 - 动态测试
      else {
        // 尝试找到匹配的用户
        let user = db.user.findFirst({
          where: { username: { equals: identity } }
        });
        
        // 如果没找到，尝试用邮箱查找
        if (!user) {
          user = db.user.findFirst({
            where: { email: { equals: identity } }
          });
        }
        
        // 如果没找到，尝试用电话查找
        if (!user) {
          user = db.user.findFirst({
            where: { phone: { equals: identity } }
          });
        }

        // 如果找到用户并且密码正确
        if (user && user.password === verify) {
          console.log(`用户 ${user.username || identity} 登录成功`);
          
          const accessToken = generateToken();
          const refreshToken = generateToken();
          
          // 在db中创建session记录
          db.session.create({
            id: generateToken(),
            userId: user.id,
            token: accessToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
          });
          
          console.log(`已创建用户 ${user.username || identity} 的session记录`);
          
          // 确保用户有名称，如果name未设置但username存在，则使用username
          const userName = user.name || user.username || identity;
          
          return HttpResponse.json({
            code: 0,
            message: '登录成功',
            success: true,
            data: {
              accessToken,
              refreshToken,
              user: {
                id: user.id,
                username: user.username || identity,
                email: user.email || `${identity}@example.com`,
                name: userName,
                fullName: userName,
                avatar: user.avatar || '/avatars/default.png',
                role: user.role || 'user',
                permissions: ['basic:read']
              }
            }
          }, { status: 200 });
        }
        
        // 用户不存在
        if (!user) {
          console.log(`用户不存在: ${identity}`);
          return HttpResponse.json({
            code: 401,
            message: '用户名或密码错误',
            success: false,
            data: null
          }, { status: 401 });
        }
        
        // 密码不正确 (模拟环境下简化为固定密码验证)
        if (verify !== 'password' && verify !== '123456') {
          console.log(`密码不正确: ${identity}`);
          return HttpResponse.json({
            code: 401,
            message: '用户名或密码错误',
            success: false,
            data: null
          }, { status: 401 });
        }
        
        console.log(`用户 ${identity} 登录成功`);
        
        const accessToken = generateToken();
        const refreshToken = generateToken();
        
        // 构建用户信息
        const userInfo = {
          id: user.id || '123',
          username: user.username || identity,
          email: user.email || `${identity}@example.com`,
          name: user.name || identity,
          avatar: user.avatar || `/avatars/default.png`,
          role: user.role || 'user'
        };
        
        return HttpResponse.json({
          code: 0,
          message: '登录成功',
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: userInfo
          }
        }, { status: 200 });
      }
    } catch (error) {
      console.error('登录处理程序出错:', error);
      logHandlerError(error, request, handlerName);
      
      const response = HttpResponse.json({
        code: 500,
        message: '服务器内部错误',
        success: false,
        data: null
      }, { status: 500 });
      
      logResponse(response, requestInfo, handlerName);
      return response;
    }
  }),
  
  // 获取当前用户信息
  http.get('/api/auth/me', async ({ request }) => {
    await delay(300);
    
    // 检查授权头
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('获取用户信息失败: 未提供有效的认证信息');
      return HttpResponse.json({
        code: 401,
        message: '未授权',
        success: false,
        data: null
      }, { status: 401 });
    }
    
    // 模拟检查token
    // 在实际应用中，我们会验证token的有效性，但在这里我们只检查其存在性
    
    // 为演示目的，根据token末尾字符返回不同用户
    const token = authHeader.replace('Bearer ', '');
    
    // 根据token最后一个字符模拟不同用户
    const lastChar = token.charAt(token.length - 1);
    
    // 超级管理员
    if (lastChar === 'a' || lastChar === '0' || lastChar === '5') {
      return HttpResponse.json({
        code: 0,
        message: '成功',
        success: true,
        data: {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          fullName: '系统管理员',
          avatar: '/avatars/admin.png',
          role: 'admin',
          permissions: ['*']
        }
      });
    } 
    // 教师用户
    else if (lastChar === 'b' || lastChar === '1' || lastChar === '6') {
      return HttpResponse.json({
        code: 0,
        message: '成功',
        success: true,
        data: {
          id: '2',
          username: 'teacher',
          email: 'teacher@example.com',
          fullName: '张老师',
          avatar: '/avatars/teacher.png',
          role: 'teacher',
          permissions: ['classroom:read', 'classroom:write', 'student:read']
        }
      });
    } 
    // 学生用户
    else {
      return HttpResponse.json({
        code: 0,
        message: '成功',
        success: true,
        data: {
          id: '3',
          username: 'student',
          email: 'student@example.com',
          fullName: '李同学',
          avatar: '/avatars/student.png',
          role: 'student',
          permissions: ['course:read']
        }
      });
    }
  }),
  
  // 发送验证码
  http.post('*/api/auth/send-code', async ({ request }) => {
    const handlerName = 'auth.sendCode (通配路径)';
    const requestInfo = logRequest(request, handlerName);
    
    try {
      await delay(500);
      
      // 解析请求体
      const body = await request.json() as PhoneRequest;
      const { phone } = body;
      
      if (!phone) {
        console.log('发送验证码失败: 缺少手机号');
        const response = HttpResponse.json({
          code: 400,
          message: '手机号不能为空',
          success: false,
          data: null
        }, { status: 400 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      }
      
      console.log(`发送验证码到: ${phone}`);
      
      // 生成验证码 - 在测试模式下使用TEST_VERIFICATION_CODE
      const verificationCode = TEST_MODE ? TEST_VERIFICATION_CODE : Math.floor(100000 + Math.random() * 900000).toString();
      
      // 保存验证码，实际应用中应该设置过期时间
      verificationCodes.set(phone, verificationCode);
      
      console.log(`验证码已发送: ${phone} -> ${verificationCode}`);
      
      // 返回成功响应
      const response = HttpResponse.json({
        code: 0,
        message: '验证码已发送',
        success: true,
        data: { 
          success: true,
          // TEST_MODE下返回验证码，方便测试
          code: TEST_MODE ? verificationCode : undefined
        }
      }, { status: 200 });
      
      logResponse(response, requestInfo, handlerName);
      return response;
    } catch (error) {
      console.error('发送验证码处理程序出错:', error);
      logHandlerError(error, request, handlerName);
      
      const response = HttpResponse.json({
        code: 500,
        message: '服务器内部错误',
        success: false,
        data: null
      }, { status: 500 });
      
      logResponse(response, requestInfo, handlerName);
      return response;
    }
  }),
  
  // 验证码登录
  http.post('*/api/auth/login-with-code', async ({ request }) => {
    const handlerName = 'auth.loginWithCode (通配路径)';
    const requestInfo = logRequest(request, handlerName);
    
    try {
      await delay(500);
      
      // 解析请求体
      const body = await request.json() as CodeLoginRequest;
      const { phone, code } = body;
      
      console.log(`尝试验证码登录: ${phone}, 验证码: ${code}`);
      
      // 检查必要字段
      if (!phone || !code) {
        console.log('登录失败: 缺少必要字段');
        const response = HttpResponse.json({
          code: 400,
          message: '手机号和验证码不能为空',
          success: false,
          data: null
        }, { status: 400 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      }
      
      // 获取保存的验证码
      const savedCode = verificationCodes.get(phone);
      
      // 测试模式 - 特定验证码始终成功
      if (TEST_MODE && code === TEST_VERIFICATION_CODE) {
        console.log(`测试模式: 验证码 ${code} 被接受`);
        
        // 生成访问令牌和刷新令牌
        const accessToken = generateToken();
        const refreshToken = generateToken();
        
        // 查找或创建用户
        let user = db.user.findFirst({
          where: { phone: { equals: phone } }
        });
        
        if (!user) {
          // 创建新用户
          const userId = generateToken();
          user = db.user.create({
            id: userId,
            phone,
            username: `user_${phone.substring(phone.length - 4)}`,
            name: `用户${phone.substring(phone.length - 4)}`,
            role: 'user',
            createdAt: new Date().toISOString()
          });
          
          console.log(`为手机号 ${phone} 创建新用户: ${user.username}`);
        }
        
        // 创建会话
        db.session.create({
          id: generateToken(),
          userId: user.id,
          token: accessToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
        });
        
        // 返回成功响应
        const response = HttpResponse.json({
          code: 0,
          message: '登录成功',
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: {
              id: user.id,
              username: user.username,
              name: user.name || user.username,
              fullName: user.name || user.username,
              email: user.email || `${user.username}@example.com`,
              phone: user.phone,
              avatar: user.avatar || '/avatars/default.png',
              role: user.role || 'user',
              permissions: ['basic:read']
            }
          }
        }, { status: 200 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      }
      
      // 验证码存在且匹配
      if (savedCode && savedCode === code) {
        console.log(`验证码验证成功: ${phone}`);
        
        // 验证成功后删除验证码，防止重复使用
        verificationCodes.delete(phone);
        
        // 生成访问令牌和刷新令牌
        const accessToken = generateToken();
        const refreshToken = generateToken();
        
        // 查找用户
        let user = db.user.findFirst({
          where: { phone: { equals: phone } }
        });
        
        if (!user) {
          // 创建新用户
          const userId = generateToken();
          user = db.user.create({
            id: userId,
            phone,
            username: `user_${phone.substring(phone.length - 4)}`,
            name: `用户${phone.substring(phone.length - 4)}`,
            role: 'user',
            createdAt: new Date().toISOString()
          });
          
          console.log(`为手机号 ${phone} 创建新用户: ${user.username}`);
        }
        
        // 创建会话
        db.session.create({
          id: generateToken(),
          userId: user.id,
          token: accessToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
        });
        
        // 返回成功响应
        const response = HttpResponse.json({
          code: 0,
          message: '登录成功',
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: {
              id: user.id,
              username: user.username,
              name: user.name || user.username,
              fullName: user.name || user.username,
              email: user.email || `${user.username}@example.com`,
              phone: user.phone,
              avatar: user.avatar || '/avatars/default.png',
              role: user.role || 'user',
              permissions: ['basic:read']
            }
          }
        }, { status: 200 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      }
      
      // 验证码不匹配
      console.log(`验证码验证失败: ${phone}, 期望: ${savedCode}, 实际: ${code}`);
      const response = HttpResponse.json({
        code: 401,
        message: '验证码错误',
        success: false,
        data: null
      }, { status: 401 });
      
      logResponse(response, requestInfo, handlerName);
      return response;
    } catch (error) {
      console.error('验证码登录处理程序出错:', error);
      logHandlerError(error, request, handlerName);
      
      const response = HttpResponse.json({
        code: 500,
        message: '服务器内部错误',
        success: false,
        data: null
      }, { status: 500 });
      
      logResponse(response, requestInfo, handlerName);
      return response;
    }
  }),
  
  // 退出登录
  http.post('/api/auth/logout', async ({ request }) => {
    await delay(200);
    
    // 检查授权头
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('登出失败: 未提供有效的认证信息');
      return HttpResponse.json({
        code: 401,
        message: '未授权',
        success: false,
        data: null
      }, { status: 401 });
    }
    
    // 在实际应用中，我们会从服务器的黑名单或存储中删除token
    
    return HttpResponse.json({
      code: 0,
      message: '登出成功',
      success: true,
      data: null
    });
  }),
  
  // 新增: 刷新令牌
  http.post('*/api/auth/refresh-token', async ({ request }) => {
    const handlerName = 'auth.refreshToken';
    const requestInfo = logRequest(request, handlerName);
    
    try {
      await delay(300);
      const body = await request.json() as RefreshTokenRequest;
      const { refreshToken } = body;
      
      if (!refreshToken) {
        const response = HttpResponse.json({
          code: 400,
          message: '刷新令牌不能为空',
          success: false,
          data: null
        }, { status: 400 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      }
      
      // 在实际应用中，会验证刷新令牌是否有效
      // 这里简单返回新的令牌
      const accessToken = generateToken();
      const newRefreshToken = generateToken();
      
      const response = HttpResponse.json({
        code: 0,
        message: '令牌刷新成功',
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken
        }
      });
      
      logResponse(response, requestInfo, handlerName);
      return response;
    } catch (error) {
      logHandlerError(error, request, handlerName);
      return HttpResponse.json({
        code: 500,
        message: '服务器错误',
        success: false,
        data: null
      }, { status: 500 });
    }
  }),
  
  // 新增: 验证令牌
  http.post('*/api/auth/validate-token', async ({ request }) => {
    const handlerName = 'auth.validateToken';
    const requestInfo = logRequest(request, handlerName);
    
    try {
      await delay(200);
      const body = await request.json() as ValidateTokenRequest;
      const { token } = body;
      
      if (!token) {
        const response = HttpResponse.json({
          code: 400,
          message: '令牌不能为空',
          success: false,
          data: {
            valid: false,
            expired: false,
            message: '令牌不能为空'
          }
        }, { status: 400 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      }
      
      // 在实际应用中，会真正验证令牌
      // 这里模拟有效的令牌
      const isValid = token.length > 10;
      
      const response = HttpResponse.json({
        code: 0,
        message: isValid ? '令牌有效' : '令牌无效',
        success: true,
        data: {
          valid: isValid,
          expired: false,
          message: isValid ? '令牌有效' : '令牌无效'
        }
      });
      
      logResponse(response, requestInfo, handlerName);
      return response;
    } catch (error) {
      logHandlerError(error, request, handlerName);
      return HttpResponse.json({
        code: 500,
        message: '服务器错误',
        success: false,
        data: {
          valid: false,
          expired: false,
          message: '服务器错误'
        }
      }, { status: 500 });
    }
  }),
  
  // 新增: 修改密码
  http.post('*/api/auth/change-password', async ({ request }) => {
    const handlerName = 'auth.changePassword';
    const requestInfo = logRequest(request, handlerName);
    
    try {
      await delay(500);
      const body = await request.json() as PasswordChangeRequest;
      const { oldPassword, newPassword, confirmPassword } = body;
      
      if (!oldPassword || !newPassword || !confirmPassword) {
        const response = HttpResponse.json({
          code: 400,
          message: '所有密码字段都不能为空',
          success: false,
          data: null
        }, { status: 400 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      }
      
      if (newPassword !== confirmPassword) {
        const response = HttpResponse.json({
          code: 400,
          message: '新密码和确认密码不匹配',
          success: false,
          data: null
        }, { status: 400 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      }
      
      // 在实际应用中，会验证旧密码并更新新密码
      // 这里简单返回成功
      const response = HttpResponse.json({
        code: 0,
        message: '密码修改成功',
        success: true,
        data: {
          success: true
        }
      });
      
      logResponse(response, requestInfo, handlerName);
      return response;
    } catch (error) {
      logHandlerError(error, request, handlerName);
      return HttpResponse.json({
        code: 500,
        message: '服务器错误',
        success: false,
        data: null
      }, { status: 500 });
    }
  }),
  
  // 新增: 更新用户资料
  http.put('*/api/auth/profile', async ({ request }) => {
    const handlerName = 'auth.updateProfile';
    const requestInfo = logRequest(request, handlerName);
    
    try {
      await delay(500);
      const body = await request.json() as ProfileUpdateRequest;
      
      // 获取当前用户的授权令牌 (从请求头中)
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const response = HttpResponse.json({
          code: 401,
          message: '未授权',
          success: false,
          data: null
        }, { status: 401 });
        
        logResponse(response, requestInfo, handlerName);
        return response;
      }
      
      // 模拟更新用户资料
      // 在实际应用中，会将数据保存到数据库
      const updatedUser = {
        id: '1',
        username: 'admin',
        email: body.email || 'admin@example.com',
        fullName: body.fullName || '系统管理员',
        avatar: body.avatar || '/avatars/admin.png',
        role: 'admin',
        permissions: ['*']
      };
      
      const response = HttpResponse.json({
        code: 0,
        message: '资料更新成功',
        success: true,
        data: updatedUser
      });
      
      logResponse(response, requestInfo, handlerName);
      return response;
    } catch (error) {
      logHandlerError(error, request, handlerName);
      return HttpResponse.json({
        code: 500,
        message: '服务器错误',
        success: false,
        data: null
      }, { status: 500 });
    }
  })
]; 