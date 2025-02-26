import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

export const userHandlers = [
  // 获取用户列表
  http.get('*/api/users', async () => {
    await delay(500); // 模拟网络延迟
    const users = db.user.getAll();
    return HttpResponse.json(users);
  }),
  
  // 获取单个用户
  http.get('/api/users/:id', async ({ params }) => {
    await delay(300);
    const { id } = params;
    const user = db.user.findFirst({
      where: {
        id: {
          equals: id,
        },
      },
    });
    
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(user);
  }),
  
  // 创建用户
  http.post('/api/users', async ({ request }) => {
    const userData = await request.json();
    const newUser = db.user.create({
      id: String(Date.now()),
      ...userData,
      createdAt: new Date().toISOString(),
    });
    
    return HttpResponse.json(newUser, { status: 201 });
  }),
  
  // 更新用户
  http.put('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const userData = await request.json();
    
    try {
      const updatedUser = db.user.update({
        where: {
          id: {
            equals: id,
          },
        },
        data: userData,
      });
      
      return HttpResponse.json(updatedUser);
    } catch (error) {
      return new HttpResponse(null, { status: 404 });
    }
  }),
  
  // 删除用户
  http.delete('/api/users/:id', async ({ params }) => {
    const { id } = params;
    
    try {
      db.user.delete({
        where: {
          id: {
            equals: id,
          },
        },
      });
      
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return new HttpResponse(null, { status: 404 });
    }
  }),
]; 