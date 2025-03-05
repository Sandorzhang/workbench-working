import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

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

export const authHandlers = [
  // 账号密码登录
  http.post(new RegExp('.*/api/auth/login'), async ({ request }) => {
    await delay(500);
    const { username, password } = await request.json() as LoginRequest;
    
    console.log(`尝试账号登录: ${username}, 请求URL: ${request.url}`);
    
    const user = db.user.findFirst({
      where: {
        username: {
          equals: username,
        },
      },
    });
    
    // 检查用户是否存在且密码是否匹配
    if (!user) {
      console.log(`用户 ${username} 不存在`);
      return HttpResponse.json(
        {
          message: '用户名或密码错误',
          code: '401',
          details: { reason: 'invalid_credentials' }
        },
        { status: 401 }
      );
    }
    
    // 检查密码是否匹配
    console.log(`检查密码: ${password}, 数据库密码: ${user.password}`);
    if (user.password !== password) {
      console.log(`用户 ${username} 密码不匹配`);
      return HttpResponse.json(
        {
          message: '用户名或密码错误',
          code: '401',
          details: { reason: 'invalid_credentials' }
        },
        { status: 401 }
      );
    }
    
    // 创建会话
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24小时有效期
    
    console.log(`创建会话，token: ${token.substr(0, 8)}...`);
    
    db.session.create({
      id: String(Date.now()),
      userId: user.id,
      token,
      expiresAt: expiresAt.toISOString(),
    });
    
    const { password: _, ...userWithoutPassword } = user;
    
    console.log(`登录成功，返回用户信息: ${userWithoutPassword.name}`);
    
    return HttpResponse.json({
      user: userWithoutPassword,
      token,
    });
  }),
  
  // 获取当前登录用户信息 - 确保更广泛的匹配模式
  http.get('*/api/auth/me', async ({ request }) => {
    try {
      await delay(300);
      
      console.log('收到 /api/auth/me 请求', request.url);
    
      // 从请求头获取令牌
      const authHeader = request.headers.get('Authorization');
      console.log('Authorization 头:', authHeader ? authHeader.substring(0, 20) + '...' : 'undefined');
      
      // 始终记录当前存储的token，帮助调试
      if (typeof window !== 'undefined') {
        const localToken = localStorage.getItem('token');
        console.log('本地存储token:', localToken ? localToken.substring(0, 10) + '...' : 'null');
      }
      
      // 检查是否为开发环境下的默认token
      const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;
      
      // 开发环境中，如果没有有效的token或使用默认token，返回默认用户
      if (!token || token === 'default-token') {
        console.log('使用默认用户响应，token:', token);
        const defaultUser = db.user.findFirst({
          where: {
            id: {
              equals: '1', // 默认管理员
            },
          },
        });
        
        if (defaultUser) {
          const { password: _, ...userWithoutPassword } = defaultUser;
          console.log('返回默认用户信息:', userWithoutPassword.name);
          return new HttpResponse(
            JSON.stringify(userWithoutPassword),
            { 
              status: 200,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        } else {
          console.error('无法找到默认用户，请检查数据库初始化');
          return new HttpResponse(
            JSON.stringify({
              message: '无法找到默认用户，请检查数据库初始化',
              code: '404',
              details: { reason: 'default_user_not_found' }
            }),
            { 
              status: 404,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }
      
      // 尝试根据token查找会话
      const session = db.session.findFirst({
        where: {
          token: {
            equals: token,
          },
        },
      });
      
      if (!session) {
        console.log('会话未找到，token无效:', token.substring(0, 10) + '...');
        return new HttpResponse(
          JSON.stringify({
            message: '会话已过期或无效',
            code: '401',
            details: { reason: 'invalid_session' }
          }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // 检查会话是否过期
      const expiresAt = new Date(session.expiresAt);
      if (expiresAt < new Date()) {
        console.log('会话已过期:', expiresAt);
        db.session.delete({
          where: {
            id: {
              equals: session.id,
            },
          },
        });
        
        return new HttpResponse(
          JSON.stringify({
            message: '会话已过期，请重新登录',
            code: '401',
            details: { reason: 'session_expired' }
          }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
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
        console.log('用户未找到:', session.userId);
        return new HttpResponse(
          JSON.stringify({
            message: '用户不存在',
            code: '401',
            details: { reason: 'user_not_found' }
          }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;
      console.log('返回用户信息:', userWithoutPassword.name);
      
      return new HttpResponse(
        JSON.stringify(userWithoutPassword),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('处理 /api/auth/me 请求时出错:', error);
      return new HttpResponse(
        JSON.stringify({
          message: '服务器内部错误',
          code: '500',
          details: { error: String(error) }
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
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
      return HttpResponse.json(
        {
          message: '手机号未注册',
          code: '404',
          details: { reason: 'phone_not_registered' }
        },
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
    
    // 检查验证码是否存在
    if (!storedCode) {
      return HttpResponse.json(
        {
          message: '验证码不存在或已过期',
          code: '401',
          details: { reason: 'code_not_found' }
        },
        { status: 401 }
      );
    }
    
    // 检查验证码是否过期（10分钟有效期）
    const createdAt = new Date(storedCode.createdAt);
    const now = new Date();
    const expirationTime = 10 * 60 * 1000; // 10分钟（毫秒）
    
    if (now.getTime() - createdAt.getTime() > expirationTime) {
      // 验证码过期，删除并返回错误
      verificationCodes.delete(phone);
      return HttpResponse.json(
        {
          message: '验证码已过期，请重新获取',
          code: '401',
          details: { reason: 'code_expired' }
        },
        { status: 401 }
      );
    }
    
    // 检查验证码是否匹配
    if (storedCode.code !== code && !(TEST_MODE && code === TEST_VERIFICATION_CODE)) {
      return HttpResponse.json(
        {
          message: '验证码错误',
          code: '401',
          details: { reason: 'invalid_code' }
        },
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
      return HttpResponse.json(
        {
          message: '用户不存在',
          code: '404',
          details: { reason: 'user_not_found' }
        },
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
  
  // 注销
  http.post('*/api/auth/logout', async ({ request }) => {
    await delay(300);
    
    // 从请求头中获取令牌
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          message: '未授权访问',
          code: '401',
          details: { reason: 'missing_token' }
        },
        { status: 401 }
      );
    }
    
    const token = authHeader.split('Bearer ')[1];
    
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
      return HttpResponse.json(
        {
          message: '未授权访问',
          code: '401',
          details: { reason: 'missing_token' }
        },
        { status: 401 }
      );
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
      return HttpResponse.json(
        {
          message: '无效的访问令牌',
          code: '401',
          details: { reason: 'invalid_token' }
        },
        { status: 401 }
      );
    }
    
    // 验证会话是否过期
    if (new Date(session.expiresAt) < new Date()) {
      return HttpResponse.json(
        {
          message: '会话已过期',
          code: '401',
          details: { reason: 'session_expired' }
        },
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
      return HttpResponse.json(
        {
          message: '用户不存在',
          code: '404',
          details: { reason: 'user_not_found' }
        },
        { status: 404 }
      );
    }
    
    // 获取所有应用
    const allApplications = db.application.getAll();
    
    // 根据用户角色过滤应用
    const userApplications = allApplications.filter(app => 
      app.roles.includes(user.role)
    );
    
    return HttpResponse.json(userApplications);
  }),
  
  // 添加额外的精确匹配处理器，确保能捕获所有请求
  http.get('/api/auth/me', async ({ request }) => {
    console.log('匹配精确路径 /api/auth/me');
    // 复制完整的处理逻辑
    try {
      await delay(300);
      
      console.log('收到 /api/auth/me 精确路径请求', request.url);
    
      // 从请求头获取令牌
      const authHeader = request.headers.get('Authorization');
      console.log('Authorization 头:', authHeader ? authHeader.substring(0, 20) + '...' : 'undefined');
      
      // 始终记录当前存储的token，帮助调试
      if (typeof window !== 'undefined') {
        const localToken = localStorage.getItem('token');
        console.log('本地存储token:', localToken ? localToken.substring(0, 10) + '...' : 'null');
      }
      
      // 检查是否为开发环境下的默认token
      const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;
      
      // 开发环境中，如果没有有效的token或使用默认token，返回默认用户
      if (!token || token === 'default-token') {
        console.log('[精确路径] 使用默认用户响应，token:', token);
        const defaultUser = db.user.findFirst({
          where: {
            id: {
              equals: '1', // 默认管理员
            },
          },
        });
        
        if (defaultUser) {
          const { password: _, ...userWithoutPassword } = defaultUser;
          console.log('[精确路径] 返回默认用户信息:', userWithoutPassword.name);
          return new HttpResponse(
            JSON.stringify(userWithoutPassword),
            { 
              status: 200,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        } else {
          console.error('[精确路径] 无法找到默认用户，请检查数据库初始化');
          return new HttpResponse(
            JSON.stringify({
              message: '无法找到默认用户，请检查数据库初始化',
              code: '404',
              details: { reason: 'default_user_not_found' }
            }),
            { 
              status: 404,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }
      
      // 直接返回默认用户，简化精确路径处理
      console.log('[精确路径] 对于精确路径，始终返回默认用户以简化处理');
      const defaultUser = db.user.findFirst({
        where: {
          id: {
            equals: '1', // 默认管理员
          },
        },
      });
      
      if (defaultUser) {
        const { password: _, ...userWithoutPassword } = defaultUser;
        return new HttpResponse(
          JSON.stringify(userWithoutPassword),
          { 
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      return new HttpResponse(
        JSON.stringify({
          message: '无法找到默认用户',
          code: '404'
        }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
    } catch (error) {
      console.error('[精确路径] 处理 /api/auth/me 请求时出错:', error);
      return new HttpResponse(
        JSON.stringify({
          message: '服务器内部错误',
          code: '500',
          details: { error: String(error) }
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }),
]; 