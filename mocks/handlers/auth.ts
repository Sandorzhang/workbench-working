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

export const authHandlers = [
  // 账号密码登录
  http.post('*/api/auth/login', async ({ request }) => {
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
    
    // 保存数据库状态
    saveDb();
    
    const { password: _, ...userWithoutPassword } = user;
    
    console.log(`登录成功，返回用户信息: ${userWithoutPassword.name}`);
    
    return HttpResponse.json({
      user: userWithoutPassword,
      token,
    });
  }),
  
  // 获取当前登录用户信息
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
      console.error('获取当前用户信息失败:', error);
      return new HttpResponse(
        JSON.stringify({
          message: '获取用户信息失败',
          code: '500',
          details: { reason: 'server_error' }
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
      
      return HttpResponse.json({
        user: userWithoutPassword,
        token,
        isNewUser: !user.password, // 如果没有密码，说明是新用户
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
  http.post('*/api/auth/logout', async ({ request }) => {
    await delay(300);
    
    // 从请求头获取令牌
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;
    
    if (!token) {
      return new HttpResponse(null, { status: 204 });
    }
    
    // 查找会话
    const session = db.session.findFirst({
      where: {
        token: {
          equals: token,
        },
      },
    });
    
    if (session) {
      // 删除会话
      db.session.delete({
        where: {
          id: {
            equals: session.id,
          },
        },
      });
      
      // 保存数据库状态
      saveDb();
      
      console.log('用户登出成功，删除会话:', session.id);
    }
    
    return new HttpResponse(null, { status: 204 });
  }),
]; 