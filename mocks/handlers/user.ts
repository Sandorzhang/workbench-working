import { http, HttpResponse, delay } from 'msw';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: string;
  permissions?: string[];
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'locked';
}

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    fullName: '系统管理员',
    avatar: '/avatars/admin.png',
    role: 'admin',
    permissions: ['*'],
    phone: '13800000000',
    createdAt: '2023-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    status: 'active'
  },
  {
    id: '2',
    username: 'teacher',
    email: 'teacher@example.com',
    fullName: '张老师',
    avatar: '/avatars/teacher.png',
    role: 'teacher',
    permissions: ['classroom:read', 'classroom:write', 'student:read'],
    phone: '13900000000',
    createdAt: '2023-02-15T00:00:00Z',
    lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'active'
  },
  {
    id: '3',
    username: 'student',
    email: 'student@example.com',
    fullName: '李同学',
    avatar: '/avatars/student.png',
    role: 'student',
    permissions: ['course:read'],
    phone: '13700000000',
    createdAt: '2023-03-20T00:00:00Z',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    status: 'active'
  },
  {
    id: '4',
    username: 'principal',
    email: 'principal@example.com',
    fullName: '王校长',
    avatar: '/avatars/principal.png',
    role: 'principal',
    permissions: ['admin:read', 'teacher:read', 'teacher:write', 'student:read', 'student:write'],
    phone: '13600000000',
    createdAt: '2023-01-10T00:00:00Z',
    lastLogin: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'active'
  },
  {
    id: '5',
    username: 'inactiveuser',
    email: 'inactive@example.com',
    fullName: '停用用户',
    role: 'teacher',
    permissions: [],
    createdAt: '2023-04-01T00:00:00Z',
    status: 'inactive'
  }
];

export const userHandlers = [
  // Get all users
  http.get('*/api/users', async ({ request }) => {
    await delay(400);
    
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');
    
    console.log(`[MSW] 处理请求: GET /api/users, 过滤条件: role=${role}, status=${status}`);
    
    let filteredUsers = [...mockUsers];
    
    // Filter by role if provided
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    // Filter by status if provided
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: filteredUsers
    });
  }),
  
  // Get user by ID
  http.get('*/api/users/:id', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: GET /api/users/${id}`);
    
    const user = mockUsers.find(user => user.id === id);
    
    if (!user) {
      return HttpResponse.json({
        code: 404,
        message: 'User not found',
        success: false,
        data: null
      }, { status: 404 });
    }
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: user
    });
  }),
  
  // Create user
  http.post('*/api/users', async ({ request }) => {
    await delay(500);
    
    console.log('[MSW] 处理请求: POST /api/users');
    
    try {
      const body = await request.json() as Partial<User>;
      console.log('[MSW] 接收到的用户数据:', body);
      
      // Validate required fields
      if (!body.username || !body.fullName || !body.role) {
        return HttpResponse.json({
          code: 400,
          message: 'Missing required fields',
          success: false,
          data: null
        }, { status: 400 });
      }
      
      // Check if username already exists
      const existingUser = mockUsers.find(user => user.username === body.username);
      if (existingUser) {
        return HttpResponse.json({
          code: 409,
          message: 'Username already exists',
          success: false,
          data: null
        }, { status: 409 });
      }
      
      const newUser: User = {
        id: uuidv4(),
        username: body.username,
        email: body.email || `${body.username}@example.com`,
        fullName: body.fullName,
        avatar: body.avatar,
        role: body.role,
        permissions: body.permissions || [],
        phone: body.phone,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      // In a real handler, we would add this to the database
      // mockUsers.push(newUser);
      
      return HttpResponse.json({
        code: 0,
        message: 'User created successfully',
        success: true,
        data: newUser
      }, { status: 201 });
    } catch (error) {
      console.error('[MSW] Error creating user:', error);
      return HttpResponse.json({
        code: 500,
        message: 'Failed to create user',
        success: false,
        data: null
      }, { status: 500 });
    }
  }),
  
  // Update user
  http.put('*/api/users/:id', async ({ params, request }) => {
    await delay(400);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: PUT /api/users/${id}`);
    
    try {
      const body = await request.json() as Partial<User>;
      console.log('[MSW] 接收到的更新数据:', body);
      
      const userIndex = mockUsers.findIndex(user => user.id === id);
      
      if (userIndex === -1) {
        return HttpResponse.json({
          code: 404,
          message: 'User not found',
          success: false,
          data: null
        }, { status: 404 });
      }
      
      // In a real handler, we would update the database
      const updatedUser = {
        ...mockUsers[userIndex],
        ...body
      };
      
      return HttpResponse.json({
        code: 0,
        message: 'User updated successfully',
        success: true,
        data: updatedUser
      });
    } catch (error) {
      console.error('[MSW] Error updating user:', error);
      return HttpResponse.json({
        code: 500,
        message: 'Failed to update user',
        success: false,
        data: null
      }, { status: 500 });
    }
  }),
  
  // Delete user
  http.delete('*/api/users/:id', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: DELETE /api/users/${id}`);
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return HttpResponse.json({
        code: 404,
        message: 'User not found',
        success: false,
        data: null
      }, { status: 404 });
    }
    
    // In a real handler, we would remove from the database
    // mockUsers.splice(userIndex, 1);
    
    return HttpResponse.json({
      code: 0,
      message: 'User deleted successfully',
      success: true,
      data: null
    });
  }),
  
  // Update user status (activate/deactivate/lock)
  http.patch('*/api/users/:id/status', async ({ params, request }) => {
    await delay(300);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: PATCH /api/users/${id}/status`);
    
    try {
      const body = await request.json() as { status: 'active' | 'inactive' | 'locked' };
      console.log('[MSW] 接收到的状态更新:', body);
      
      if (!body.status || !['active', 'inactive', 'locked'].includes(body.status)) {
        return HttpResponse.json({
          code: 400,
          message: 'Invalid status value',
          success: false,
          data: null
        }, { status: 400 });
      }
      
      const userIndex = mockUsers.findIndex(user => user.id === id);
      
      if (userIndex === -1) {
        return HttpResponse.json({
          code: 404,
          message: 'User not found',
          success: false,
          data: null
        }, { status: 404 });
      }
      
      // In a real handler, we would update the database
      const updatedUser = {
        ...mockUsers[userIndex],
        status: body.status
      };
      
      return HttpResponse.json({
        code: 0,
        message: `User status updated to ${body.status}`,
        success: true,
        data: updatedUser
      });
    } catch (error) {
      console.error('[MSW] Error updating user status:', error);
      return HttpResponse.json({
        code: 500,
        message: 'Failed to update user status',
        success: false,
        data: null
      }, { status: 500 });
    }
  })
]; 