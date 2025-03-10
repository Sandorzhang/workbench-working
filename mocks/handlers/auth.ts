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
  http.post('*/auth/login', async ({ request }) => {
    try {
      await delay(500);
      
      // 记录请求详细信息，帮助调试
      const requestUrl = request.url;
      console.log(`收到登录请求 - URL: ${requestUrl}`);
      
      // 解析请求体
      const body = await request.json() as LoginRequest;
      const { username, password } = body;
      
      console.log(`尝试账号登录: ${username}, 提供的密码(已加密): ${password?.substring(0, 10)}...`);
      
      // 检查必要字段
      if (!username || !password) {
        console.log('登录请求缺少用户名或密码');
        return new HttpResponse(
          JSON.stringify({
            message: '用户名和密码不能为空',
            code: '400',
            details: { reason: 'missing_credentials' }
          }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // 对于admin用户，直接创建会话并允许登录，完全跳过密码验证
      if (username === 'admin') {
        console.log('管理员账号登录 - 跳过密码验证');
        
        // 查找admin用户或创建一个新的admin用户
        let adminUser = db.user.findFirst({
          where: {
            username: {
              equals: 'admin',
            },
          },
        });
        
        if (!adminUser) {
          console.log('创建默认管理员用户');
          
          // 查找ID为1的用户是否已存在
          const existingUserWithId1 = db.user.findFirst({
            where: {
              id: {
                equals: '1',
              },
            },
          });
          
          // 使用不会冲突的ID
          const adminId = existingUserWithId1 ? `admin_${Date.now()}` : '1';
          
          console.log(`为管理员用户使用ID: ${adminId}`);
          
          adminUser = db.user.create({
            id: adminId,
            name: '管理员',
            email: 'admin@example.com',
            avatar: '/avatars/admin.png',
            username: 'admin',
            password: 'admin-password',  // 设置一个默认密码
            role: 'admin',
            createdAt: new Date().toISOString(),
          });
        }
        
        // 创建会话
        const token = generateToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24小时有效期
        
        console.log(`管理员登录成功，创建会话，token: ${token.substr(0, 8)}...`);
        
        // 使用唯一ID创建会话
        const sessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        try {
          // 尝试删除旧会话
          const existingSessions = db.session.findMany({
            where: {
              userId: {
                equals: adminUser.id,
              },
            },
          });
          
          if (existingSessions.length > 0) {
            console.log(`找到 ${existingSessions.length} 个现有会话，正在清理...`);
            existingSessions.forEach(session => {
              try {
                db.session.delete({
                  where: {
                    id: {
                      equals: session.id,
                    },
                  },
                });
              } catch (err) {
                console.log(`清理会话 ${session.id} 时出错，继续处理`);
              }
            });
          }
          
          // 创建新会话
          db.session.create({
            id: sessionId,
            userId: adminUser.id,
            token,
            expiresAt: expiresAt.toISOString(),
          });
          
          console.log(`创建了新会话: ${sessionId} 用于用户 ${adminUser.id}`);
        } catch (err) {
          console.error('创建会话时出错:', err);
          // 即使会话创建失败，也继续处理登录
        }
        
        // 保存数据库状态
        saveDb();
        
        const { password: _, ...userWithoutPassword } = adminUser;
        
        console.log(`管理员登录成功，返回用户信息: ${userWithoutPassword.name}`);
        
        return new HttpResponse(
          JSON.stringify({
            data: {
              user: userWithoutPassword,
              token,
            }
          }),
          { 
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // 常规用户的登录流程 - 查找用户
      console.log('常规用户登录流程');
      
      // 查找用户 - 首先按用户名查询
      let user = db.user.findFirst({
        where: {
          username: {
            equals: username,
          },
        },
      });
      
      // 如果未找到用户，尝试使用手机号作为用户名
      if (!user && /^1[3-9]\d{9}$/.test(username)) {
        console.log(`尝试使用手机号 ${username} 查找用户`);
        user = db.user.findFirst({
          where: {
            phone: {
              equals: username,
            },
          },
        });
      }
      
      // 检查用户是否存在
      if (!user) {
        console.log(`用户 ${username} 不存在`);
        return new HttpResponse(
          JSON.stringify({
            message: '用户名或密码错误',
            code: '401',
            details: { reason: 'invalid_credentials' }
          }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // 确保用户有name字段，如果没有给一个默认值
      if (!user.name) {
        console.log(`警告: 用户 ${username} 没有name字段，设置默认名称`);
        if (user.role === 'superadmin') {
          user.name = '超级管理员';
        } else if (user.role === 'admin') {
          user.name = '管理员';
        } else if (user.role === 'teacher') {
          user.name = '教师用户';
        } else {
          user.name = '普通用户';
        }
      }
      
      console.log(`找到用户 ${user.name}, 登录成功`);
      
      // 在mock环境下，对于非admin用户也自动允许登录，不检查密码
      // 创建会话
      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24小时有效期
      
      console.log(`创建会话，token: ${token.substr(0, 8)}...`);
      
      // 使用唯一ID创建会话
      const sessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      try {
        // 尝试删除该用户的旧会话
        const existingSessions = db.session.findMany({
          where: {
            userId: {
              equals: user.id,
            },
          },
        });
        
        if (existingSessions.length > 0) {
          console.log(`找到 ${existingSessions.length} 个现有会话，正在清理...`);
          existingSessions.forEach(session => {
            try {
              db.session.delete({
                where: {
                  id: {
                    equals: session.id,
                  },
                },
              });
            } catch (err) {
              console.log(`清理会话 ${session.id} 时出错，继续处理`);
            }
          });
        }
        
        // 创建新会话
        db.session.create({
          id: sessionId,
          userId: user.id,
          token,
          expiresAt: expiresAt.toISOString(),
        });
        
        console.log(`创建了新会话: ${sessionId} 用于用户 ${user.id}`);
      } catch (err) {
        console.error('创建会话时出错:', err);
        // 即使会话创建失败，也继续处理登录
      }
      
      // 保存数据库状态
      saveDb();
      
      const { password: _, ...userWithoutPassword } = user;
      
      console.log(`登录成功，返回用户信息: ${userWithoutPassword.name}`);
      
      return new HttpResponse(
        JSON.stringify({
          data: {
            user: userWithoutPassword,
            token,
          }
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (err) {
      console.error('处理登录请求时出错:', err);
      return new HttpResponse(
        JSON.stringify({
          message: '服务器错误，请稍后重试',
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
  
  // 获取当前登录用户信息
  http.get('*/auth/user', async ({ request }) => {
    try {
      await delay(300);
      
      console.log('收到 /auth/user 请求', request.url);
    
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
          // 确保默认用户有必要的字段
          if (!defaultUser.name) {
            console.log('警告: 默认用户缺少name字段，添加默认值');
            defaultUser.name = '管理员';
            
            // 尝试更新数据库中的用户信息
            try {
              db.user.update({
                where: {
                  id: {
                    equals: defaultUser.id
                  }
                },
                data: {
                  name: defaultUser.name
                }
              });
            } catch (error) {
              console.error('更新默认用户信息失败:', error);
            }
          }
          
          const { password: _, ...userWithoutPassword } = defaultUser;
          console.log('返回默认用户信息:', userWithoutPassword.name);
          return new HttpResponse(
            JSON.stringify({
              data: userWithoutPassword
            }),
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
      
      // 检查session是否过期
      const expiryDate = new Date(session.expiresAt);
      if (expiryDate < new Date()) {
        console.log('会话已过期:', session.id);
        return new HttpResponse(
          JSON.stringify({
            message: '会话已过期，请重新登录',
            code: '401',
            details: { reason: 'expired_session' }
          }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // 根据session找用户
      const user = db.user.findFirst({
        where: {
          id: {
            equals: session.userId,
          },
        },
      });
      
      if (!user) {
        console.log('用户不存在，会话关联的userId:', session.userId);
        return new HttpResponse(
          JSON.stringify({
            message: '用户不存在',
            code: '404',
            details: { reason: 'user_not_found' }
          }),
          { 
            status: 404,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // 确保用户有name字段
      if (!user.name) {
        console.log(`警告: 用户 ${user.id} 没有name字段，设置默认名称`);
        if (user.role === 'superadmin') {
          user.name = '超级管理员';
        } else if (user.role === 'admin') {
          user.name = '管理员';
        } else if (user.role === 'teacher') {
          user.name = '教师用户';
        } else {
          user.name = '普通用户';
        }
        
        // 更新用户信息
        try {
          db.user.update({
            where: {
              id: {
                equals: user.id
              }
            },
            data: {
              name: user.name
            }
          });
          console.log(`已更新用户 ${user.id} 的name字段为 ${user.name}`);
        } catch (error) {
          console.error(`更新用户 ${user.id} 的name字段失败:`, error);
        }
      }
      
      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;
      console.log('返回用户信息:', userWithoutPassword.name);
      
      return new HttpResponse(
        JSON.stringify({
          data: userWithoutPassword
        }),
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
  http.post('*/auth/send-code', async ({ request }) => {
    await delay(500);
    
    try {
      const { phone } = await request.json() as PhoneRequest;
      
      console.log(`收到发送验证码请求: 手机号 ${phone}`);
      
      // 验证手机号格式（简单示例）
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        console.log(`手机号格式不正确: ${phone}`);
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
        createdAt: new Date().toISOString(),
        expireIn: 300, // 5分钟过期
        testMode: TEST_MODE
      });
      
      console.log(`为手机号 ${phone} 生成验证码: ${code}`);
      
      return HttpResponse.json({
        message: '验证码发送成功',
        success: true,
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
  http.post('*/auth/login-with-code', async ({ request }) => {
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
      
      // 测试模式下可以使用固定验证码123456
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
      } else {
        // 测试模式下，检查是否使用测试验证码
        if (code !== TEST_VERIFICATION_CODE) {
          console.log(`测试模式下验证码不匹配: 期望 ${TEST_VERIFICATION_CODE}, 收到 ${code}`);
          if (!storedData || storedData.code !== code) {
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
        } else {
          console.log('测试模式下使用了测试验证码，跳过验证');
        }
      }
      
      // 查找用户 
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
      } else {
        // 确保现有用户有name字段
        if (!user.name) {
          console.log(`警告: 用户 ${phone} 没有name字段，设置默认名称`);
          if (user.role === 'superadmin') {
            user.name = '超级管理员';
          } else if (user.role === 'admin') {
            user.name = '管理员';
          } else if (user.role === 'teacher') {
            user.name = '教师用户';
          } else {
            user.name = '普通用户';
          }
          
          // 更新用户信息
          db.user.update({
            where: {
              id: {
                equals: user.id
              }
            },
            data: {
              name: user.name
            }
          });
        }
      }
      
      // 创建会话
      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24小时有效期
      
      // 使用唯一ID创建会话
      const sessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      try {
        // 尝试删除该用户的旧会话
        const existingSessions = db.session.findMany({
          where: {
            userId: {
              equals: user.id,
            },
          },
        });
        
        if (existingSessions.length > 0) {
          console.log(`找到 ${existingSessions.length} 个现有会话，正在清理...`);
          existingSessions.forEach(session => {
            try {
              db.session.delete({
                where: {
                  id: {
                    equals: session.id,
                  },
                },
              });
            } catch (err) {
              console.log(`清理会话 ${session.id} 时出错，继续处理`);
            }
          });
        }
        
        // 创建新会话
        db.session.create({
          id: sessionId,
          userId: user.id,
          token,
          expiresAt: expiresAt.toISOString(),
        });
        
        console.log(`创建了新的验证码登录会话: ${sessionId} 用于用户 ${user.id}`);
      } catch (err) {
        console.error('创建验证码登录会话时出错:', err);
        // 即使会话创建失败，也继续处理登录
      }
      
      // 保存数据库状态
      saveDb();
      
      const { password: _, ...userWithoutPassword } = user;
      
      console.log(`验证码登录成功，返回用户信息: ${userWithoutPassword.name}`);
      
      return HttpResponse.json({
        data: {
          user: userWithoutPassword,
          token,
          isNewUser: !user.password, // 如果没有密码，说明是新用户
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
  http.post('*/auth/logout', async ({ request }) => {
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