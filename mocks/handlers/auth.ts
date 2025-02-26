import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

// 生成随机令牌
const generateToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

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

export const authHandlers = [
  // 账号密码登录
  http.post('*/api/auth/login', async ({ request }) => {
    await delay(500);
    const { username, password } = await request.json() as LoginRequest;
    
    const user = db.user.findFirst({
      where: {
        username: {
          equals: username,
        },
      },
    });
    
    if (!user || user.password !== password) {
      return new HttpResponse(
        JSON.stringify({ error: '用户名或密码错误' }),
        { status: 401 }
      );
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
    
    const { password: _, ...userWithoutPassword } = user;
    
    return HttpResponse.json({
      user: userWithoutPassword,
      token,
    });
  }),
  
  // 发送短信验证码
  http.post('*/api/auth/send-code', async ({ request }) => {
    await delay(500);
    const { phone } = await request.json() as PhoneRequest;
    
    // 检查手机号是否存在
    const user = db.user.findFirst({
      where: {
        phone: {
          equals: phone,
        },
      },
    });
    
    if (!user) {
      return new HttpResponse(
        JSON.stringify({ error: '手机号未注册' }),
        { status: 404 }
      );
    }
    
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 存储验证码 (实际应用中会发送到用户手机)
    verificationCodes.set(phone, {
      code,
      createdAt: new Date().toISOString(),
    });
    
    return HttpResponse.json({
      message: '验证码已发送',
    });
  }),
  
  // 验证码登录
  http.post('*/api/auth/login-with-code', async ({ request }) => {
    await delay(500);
    const { phone, code } = await request.json() as CodeLoginRequest;
    
    const storedCode = verificationCodes.get(phone);
    
    // 检查验证码是否存在且有效
    if (!storedCode || storedCode.code !== code) {
      return new HttpResponse(
        JSON.stringify({ error: '验证码错误或已过期' }),
        { status: 401 }
      );
    }
    
    // 找到用户
    const user = db.user.findFirst({
      where: {
        phone: {
          equals: phone,
        },
      },
    });
    
    if (!user) {
      return new HttpResponse(
        JSON.stringify({ error: '用户不存在' }),
        { status: 404 }
      );
    }
    
    // 验证成功后删除验证码
    verificationCodes.delete(phone);
    
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
    
    const { password: _, ...userWithoutPassword } = user;
    
    return HttpResponse.json({
      user: userWithoutPassword,
      token,
    });
  }),
  
  // 获取当前用户信息
  http.get('*/api/auth/me', async ({ request }) => {
    await delay(300);
    
    // 从请求头中获取令牌
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // 查找会话
    const session = db.session.findFirst({
      where: {
        token: {
          equals: token,
        },
      },
    });
    
    if (!session) {
      return new HttpResponse(null, { status: 401 });
    }
    
    // 验证会话是否过期
    if (new Date(session.expiresAt) < new Date()) {
      return new HttpResponse(
        JSON.stringify({ error: '会话已过期' }),
        { status: 401 }
      );
    }
    
    // 查找用户
    const user = db.user.findFirst({
      where: {
        id: {
          equals: session.userId,
        },
      },
    });
    
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    return HttpResponse.json(userWithoutPassword);
  }),
  
  // 注销
  http.post('*/api/auth/logout', async ({ request }) => {
    await delay(300);
    
    // 从请求头中获取令牌
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // 删除会话
    try {
      db.session.delete({
        where: {
          token: {
            equals: token,
          },
        },
      });
    } catch (error) {
      // 会话不存在，忽略错误
    }
    
    return HttpResponse.json({
      success: true,
      message: '已成功注销',
    });
  }),
  
  // 获取用户可访问的应用
  http.get('*/api/applications', async ({ request }) => {
    await delay(300);
    
    // 从请求头中获取令牌
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(null, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // 查找会话
    const session = db.session.findFirst({
      where: {
        token: {
          equals: token,
        },
      },
    });
    
    if (!session) {
      return new HttpResponse(null, { status: 401 });
    }
    
    // 查找用户
    const user = db.user.findFirst({
      where: {
        id: {
          equals: session.userId,
        },
      },
    });
    
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // 获取所有应用
    const allApplications = db.application.getAll();
    
    // 根据用户角色过滤应用
    const userApplications = allApplications.filter(app => 
      app.roles.includes(user.role)
    );
    
    return HttpResponse.json(userApplications);
  }),
]; 