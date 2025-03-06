import { http, HttpResponse, delay } from 'msw';
import { db, saveDb } from '../db';

// 生成随机令牌
const generateToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// 测试模式配置
const TEST_MODE = process.env.NODE_ENV === 'development';
const TEST_VERIFICATION_CODE = '123456';

// 验证码存储 (模拟)
const verificationCodes = new Map();

// 定义请求类型
interface LoginRequest {
  username: string;
  password: string;
}

interface PhoneRequest {
  phone: string;
}

interface CodeLoginRequest {
  phone: string;
  code: string;
}

// 适配URL模式
const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

export const authHandlers = [
  // 账号密码登录 - 使用明确路径以确保正确匹配
  http.post('/api/auth/login', async ({ request }) => {
    try {
      await delay(500);
      
      // 记录请求详细信息，帮助调试
      const requestUrl = request.url;
      console.log(`收到登录请求 - URL: ${requestUrl}`);
      
      // 解析请求体
      const body = await request.json() as LoginRequest;
      const { username, password } = body;
      
      console.log(`尝试账号登录: ${username}`);
      
      // 检查必要字段
      if (!username || !password) {
        console.log('登录失败: 缺少必要字段');
        return HttpResponse.json({
          code: 400,
          message: '用户名和密码不能为空',
          success: false,
          data: null
        }, { status: 400 });
      }
      
      // 模拟登录逻辑
      if (username === 'admin' && password === 'admin') {
        console.log('管理员登录成功');
        
        const accessToken = generateToken();
        const refreshToken = generateToken();
        
        // 返回登录成功响应
        return HttpResponse.json({
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
              fullName: '系统管理员',
              avatar: '/avatars/admin.png',
              role: 'admin',
              permissions: ['*']
            }
          }
        }, { status: 200 });
      } 
      // 教师账号
      else if (username === 'teacher' && password === 'teacher') {
        console.log('教师登录成功');
        
        const accessToken = generateToken();
        const refreshToken = generateToken();
        
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
              fullName: '张老师',
              avatar: '/avatars/teacher.png',
              role: 'teacher',
              permissions: ['classroom:read', 'classroom:write', 'student:read']
            }
          }
        }, { status: 200 });
      }
      // 学生账号
      else if (username === 'student' && password === 'student') {
        console.log('学生登录成功');
        
        const accessToken = generateToken();
        const refreshToken = generateToken();
        
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
              fullName: '李同学',
              avatar: '/avatars/student.png',
              role: 'student',
              permissions: ['course:read']
            }
          }
        }, { status: 200 });
      } 
      // 登录失败
      else {
        console.log('登录失败: 用户名或密码错误');
        return HttpResponse.json({
          code: 401,
          message: '用户名或密码错误',
          success: false,
          data: null
        }, { status: 401 });
      }
    } catch (error) {
      console.error('登录处理发生错误:', error);
      return HttpResponse.json({
        code: 500,
        message: '服务器内部错误',
        success: false,
        data: null
      }, { status: 500 });
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
    await delay(500);
    
    try {
      const { phone } = await request.json() as PhoneRequest;
      
      // 验证手机号格式（简单示例）
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        return HttpResponse.json(
          {
            message: '手机号格式不正确',
            code: '400',
            details: { reason: 'invalid_phone' }
          },
          { status: 400 }
        );
      }
      
      // 生成随机验证码 或 使用测试验证码
      const code = TEST_MODE ? TEST_VERIFICATION_CODE : Math.floor(100000 + Math.random() * 900000).toString();
      
      // 存储验证码（实际应用中应该有过期时间）
      verificationCodes.set(phone, {
        code,
        createdAt: new Date().toISOString()
      });
      
      console.log(`为手机号 ${phone} 生成验证码: ${code}`);
      
      // 模拟发送过程
      return HttpResponse.json({
        message: '验证码已发送',
        expireIn: 300, // 5分钟过期
        testMode: TEST_MODE,
        // 仅在测试模式下返回验证码
        ...(TEST_MODE && { testCode: code })
      });
    } catch (error) {
      console.error('发送验证码失败:', error);
      return HttpResponse.json(
        {
          message: '发送验证码失败',
          code: '500',
          details: { reason: 'server_error' }
        },
        { status: 500 }
      );
    }
  }),
  
  // 验证码登录
  http.post('*/api/auth/login-with-code', async ({ request }) => {
    await delay(500);
    
    try {
      const { phone, code } = await request.json() as CodeLoginRequest;
      
      console.log(`尝试验证码登录: 手机号 ${phone}, 验证码 ${code}`);
      
      // 验证手机号格式
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        console.log('手机号格式不正确');
        return HttpResponse.json(
          {
            message: '手机号格式不正确',
            code: '400',
            details: { reason: 'invalid_phone' }
          },
          { status: 400 }
        );
      }
      
      // 获取存储的验证码
      const storedData = verificationCodes.get(phone);
      
      // 测试模式下跳过验证码检查
      if (!TEST_MODE) {
        if (!storedData) {
          console.log('验证码不存在');
          return HttpResponse.json(
            {
              message: '验证码不存在或已过期',
              code: '400',
              details: { reason: 'code_expired' }
            },
            { status: 400 }
          );
        }
        
        // 验证码不匹配
        if (storedData.code !== code) {
          console.log('验证码不正确');
          return HttpResponse.json(
            {
              message: '验证码不正确',
              code: '400',
              details: { reason: 'invalid_code' }
            },
            { status: 400 }
          );
        }
        
        // 验证码过期检查 (5分钟)
        const codeTime = new Date(storedData.createdAt).getTime();
        const currentTime = new Date().getTime();
        if (currentTime - codeTime > 5 * 60 * 1000) {
          console.log('验证码已过期');
          return HttpResponse.json(
            {
              message: '验证码已过期',
              code: '400',
              details: { reason: 'code_expired' }
            },
            { status: 400 }
          );
        }
      } else {
        // 测试模式下，验证测试验证码
        if (code !== TEST_VERIFICATION_CODE) {
          console.log('测试验证码不正确');
          return HttpResponse.json(
            {
              message: '验证码不正确',
              code: '400',
              details: { reason: 'invalid_code' }
            },
            { status: 400 }
          );
        }
      }
      
      // 验证通过后，清除验证码
      verificationCodes.delete(phone);
      
      // 查找与手机号关联的用户
      let user = db.user.findFirst({
        where: {
          phone: {
            equals: phone,
          },
        },
      });
      
      // 如果用户不存在，创建新用户（自动注册）
      if (!user) {
        console.log(`用户不存在，创建新用户，手机号: ${phone}`);
        
        // 自动生成用户信息
        const userId = `user_${Date.now()}`;
        const userName = `用户${phone.substring(7)}`;
        
        user = db.user.create({
          id: userId,
          name: userName,
          email: `${phone}@example.com`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
          phone: phone,
          username: phone,
          password: '', // 验证码登录的用户没有密码
          role: 'user', // 默认角色
          createdAt: new Date().toISOString(),
        });
        
        console.log('自动创建用户成功:', user);
      }
      
      // 创建会话
      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24小时有效期
      
      db.session.create({
        id: String(Date.now()),
        userId: user.id,
        token,
        expiresAt: expiresAt.toISOString(),
      });
      
      // 保存数据库状态
      saveDb();
      
      const { password: _, ...userWithoutPassword } = user;
      
      console.log(`验证码登录成功，返回用户信息: ${userWithoutPassword.name}`);
      
      // 生成访问令牌和刷新令牌
      const accessToken = generateToken();
      const refreshToken = generateToken();
      
      // 返回标准格式的登录响应
      return HttpResponse.json({
        code: 0,
        msg: "成功",
        data: {
          accessToken,
          refreshToken,
          user: userWithoutPassword,
          school: {
            id: "school-default",
            name: "示范学校",
            logo: "/images/school-logo.png",
            period: "九年一贯制"
          },
          terminal: "web",
          terminalList: ["web", "mobile"],
          permissions: ["read", "write"],
          role: {
            id: user.role || "user",
            name: user.role === "admin" ? "管理员" : "普通用户",
            weight: null,
            description: null,
            userId: null,
            isBuiltIn: true,
            terminal: "web"
          },
          roleList: [{
            id: user.role || "user",
            name: user.role === "admin" ? "管理员" : "普通用户",
            weight: null,
            description: null,
            userId: null,
            isBuiltIn: true,
            terminal: "web"
          }],
          schoolList: null
        }
      });
    } catch (error) {
      console.error('验证码登录失败:', error);
      return HttpResponse.json(
        {
          message: '验证码登录失败',
          code: '500',
          details: { reason: 'server_error' }
        },
        { status: 500 }
      );
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
]; 