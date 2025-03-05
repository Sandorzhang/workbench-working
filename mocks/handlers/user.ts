import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

export const userHandlers = [
  // 获取用户列表
  http.get('/api/users', async ({ request }) => {
    await delay(300);
    
    try {
      // 解析URL参数
      const url = new URL(request.url);
      const role = url.searchParams.get('role') || '';
      const tenant = url.searchParams.get('tenant') || '';
      
      // 获取所有用户
      let users = db.user.getAll();
      
      // 移除密码字段
      users = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      // 按角色过滤
      if (role) {
        users = users.filter(user => user.role === role);
      }
      
      // 按租户过滤
      if (tenant) {
        users = users.filter(user => user.tenant === tenant);
      }
      
      return HttpResponse.json(users);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取用户列表失败' }),
        { status: 500 }
      );
    }
  }),
  
  // 获取单个用户
  http.get('/api/users/:id', async ({ params }) => {
    await delay(300);
    
    try {
      const { id } = params;
      
      // 查找用户
      const user = db.user.findFirst({
        where: {
          id: {
            equals: id as string
          }
        }
      });
      
      if (!user) {
        return new HttpResponse(
          JSON.stringify({ error: '用户不存在' }),
          { status: 404 }
        );
      }
      
      // 移除密码字段
      const { password, ...userWithoutPassword } = user;
      
      return HttpResponse.json(userWithoutPassword);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取用户信息失败' }),
        { status: 500 }
      );
    }
  }),
  
  // 创建用户
  http.post('/api/users', async ({ request }) => {
    await delay(500);
    
    try {
      const userData = await request.json();
      
      // 检查必要字段
      if (!userData.name || !userData.username || !userData.password || !userData.role) {
        return new HttpResponse(
          JSON.stringify({ error: '缺少必要字段' }),
          { status: 400 }
        );
      }
      
      // 检查用户名是否已存在
      const existingUser = db.user.findFirst({
        where: {
          username: {
            equals: userData.username
          }
        }
      });
      
      if (existingUser) {
        return new HttpResponse(
          JSON.stringify({ error: '用户名已存在' }),
          { status: 409 }
        );
      }
      
      // 创建新用户
      const newUser = db.user.create({
        id: String(Date.now()),
        name: userData.name,
        username: userData.username,
        password: userData.password,
        email: userData.email || `${userData.username}@example.com`,
        avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
        role: userData.role,
        tenant: userData.tenant || null,
        tenantType: userData.tenantType || null,
        createdAt: new Date().toISOString(),
      });
      
      // 移除密码字段
      const { password, ...userWithoutPassword } = newUser;
      
      return HttpResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
      console.error('创建用户失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '创建用户失败' }),
        { status: 500 }
      );
    }
  }),
  
  // 更新用户
  http.put('/api/users/:id', async ({ params, request }) => {
    await delay(500);
    
    try {
      const { id } = params;
      const userData = await request.json();
      
      // 检查用户是否存在
      const existingUser = db.user.findFirst({
        where: {
          id: {
            equals: id as string
          }
        }
      });
      
      if (!existingUser) {
        return new HttpResponse(
          JSON.stringify({ error: '用户不存在' }),
          { status: 404 }
        );
      }
      
      // 如果要更新用户名，检查是否已存在
      if (userData.username && userData.username !== existingUser.username) {
        const usernameExists = db.user.findFirst({
          where: {
            username: {
              equals: userData.username
            }
          }
        });
        
        if (usernameExists) {
          return new HttpResponse(
            JSON.stringify({ error: '用户名已存在' }),
            { status: 409 }
          );
        }
      }
      
      // 更新用户
      const updatedUser = db.user.update({
        where: {
          id: {
            equals: id as string
          }
        },
        data: userData
      });
      
      // 移除密码字段
      const { password, ...userWithoutPassword } = updatedUser;
      
      return HttpResponse.json(userWithoutPassword);
    } catch (error) {
      console.error('更新用户失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '更新用户失败' }),
        { status: 500 }
      );
    }
  }),
  
  // 删除用户
  http.delete('/api/users/:id', async ({ params }) => {
    await delay(400);
    
    try {
      const { id } = params;
      
      // 检查用户是否存在
      const existingUser = db.user.findFirst({
        where: {
          id: {
            equals: id as string
          }
        }
      });
      
      if (!existingUser) {
        return new HttpResponse(
          JSON.stringify({ error: '用户不存在' }),
          { status: 404 }
        );
      }
      
      // 删除用户
      db.user.delete({
        where: {
          id: {
            equals: id as string
          }
        }
      });
      
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      console.error('删除用户失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '删除用户失败' }),
        { status: 500 }
      );
    }
  }),
]; 