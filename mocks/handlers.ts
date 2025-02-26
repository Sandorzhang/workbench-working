import { http, HttpResponse, delay } from 'msw';

// 创建一个简单的用户数据数组作为模拟数据
const users = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    createdAt: new Date().toISOString(),
  },
];

export const handlers = [
  // 获取用户列表
  http.get('*/api/users', async () => {
    // 添加延迟模拟网络延迟
    await delay(500);
    // 返回JSON响应
    return HttpResponse.json(users);
  }),

  // 获取单个用户
  http.get('*/api/users/:id', async ({ params }) => {
    const { id } = params;
    const user = users.find(user => user.id === id);
    
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(user);
  }),
]; 