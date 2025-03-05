import { http, HttpResponse, delay } from 'msw';
import { db, saveDb } from '../db';

// 为用户添加额外的信息
interface EnhancedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  status: 'active' | 'inactive' | 'locked';
  schoolId?: string;
  schoolName?: string;
  lastLogin?: string;
  createdAt: string;
}

// 创建用户请求数据类型
interface CreateUserData {
  name: string;
  email: string;
  username?: string;
  password?: string;
  phone?: string;
  role: string;
  schoolId?: string;
  schoolType?: string;
}

// 更新用户请求数据类型
interface UpdateUserData {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  phone?: string;
  role?: string;
  schoolId?: string;
  avatar?: string;
}

// 更新用户状态请求数据类型
interface UpdateUserStatusData {
  status: 'active' | 'inactive' | 'locked';
}

export const superadminHandlers = [
  // 获取所有用户
  http.get('/api/superadmin/users', async ({ request }) => {
    await delay(300);
    
    // 获取基础用户数据
    const users = db.user.getAll();
    
    // 增强用户数据
    const enhancedUsers: EnhancedUser[] = users.map(user => {
      // 查找学校名称（如果存在）
      let schoolName = user.tenant || '';
      
      // 如果用户有schoolId，通过schoolId查找学校名称
      if (user.tenant) {
        const school = db.school.findFirst({
          where: {
            name: {
              equals: user.tenant
            }
          }
        });
        if (school) {
          schoolName = school.name;
        }
      }
      
      // 为用户添加额外字段
      return {
        id: user.id,
        name: user.name,
        username: user.username || user.email.split('@')[0], // 如果没有username，则使用邮箱前缀
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: 'active' as const, // 默认为active
        schoolId: user.tenant ? getSchoolIdFromName(user.tenant) : undefined,
        schoolName: schoolName,
        lastLogin: new Date(Date.now() - Math.random() * 10000000000).toISOString(), // 随机上次登录时间
        createdAt: user.createdAt
      };
    });
    
    return HttpResponse.json(enhancedUsers);
  }),
  
  // 创建用户
  http.post('/api/superadmin/users', async ({ request }) => {
    await delay(500);
    const data = await request.json() as CreateUserData;
    
    try {
      // 验证必填字段
      if (!data.name || !data.email || !data.role) {
        return HttpResponse.json(
          { message: '缺少必要字段' },
          { status: 400 }
        );
      }
      
      // 检查邮箱是否已存在
      const existingUser = db.user.findFirst({
        where: {
          email: {
            equals: data.email
          }
        }
      });
      
      if (existingUser) {
        return HttpResponse.json(
          { message: '邮箱已被使用' },
          { status: 409 }
        );
      }
      
      // 创建新用户
      const newUser = db.user.create({
        id: String(Date.now()),
        name: data.name,
        email: data.email,
        username: data.username || data.email.split('@')[0],
        password: data.password || 'password123', // 默认密码
        phone: data.phone || '',
        role: data.role,
        tenant: data.schoolId ? getSchoolNameFromId(data.schoolId) : '',
        tenantType: data.schoolType || '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
        createdAt: new Date().toISOString()
      });
      
      // 保存数据库状态
      saveDb();
      
      return HttpResponse.json(newUser, { status: 201 });
    } catch (error) {
      console.error('创建用户失败:', error);
      return HttpResponse.json(
        { message: '创建用户失败' },
        { status: 500 }
      );
    }
  }),
  
  // 更新用户
  http.put('/api/superadmin/users/:id', async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const data = await request.json() as UpdateUserData;
    
    try {
      // 查找用户
      const user = db.user.findFirst({
        where: {
          id: {
            equals: String(id)
          }
        }
      });
      
      if (!user) {
        return HttpResponse.json(
          { message: '用户不存在' },
          { status: 404 }
        );
      }
      
      // 如果更新邮箱，检查是否已存在
      if (data.email && data.email !== user.email) {
        const existingUser = db.user.findFirst({
          where: {
            email: {
              equals: data.email
            }
          }
        });
        
        if (existingUser && existingUser.id !== id) {
          return HttpResponse.json(
            { message: '邮箱已被使用' },
            { status: 409 }
          );
        }
      }
      
      // 更新用户数据
      const updatedUser = db.user.update({
        where: {
          id: {
            equals: String(id)
          }
        },
        data: {
          name: data.name !== undefined ? data.name : user.name,
          email: data.email !== undefined ? data.email : user.email,
          username: data.username !== undefined ? data.username : user.username,
          phone: data.phone !== undefined ? data.phone : user.phone,
          role: data.role !== undefined ? data.role : user.role,
          tenant: data.schoolId !== undefined ? getSchoolNameFromId(data.schoolId) : user.tenant,
          avatar: data.avatar !== undefined ? data.avatar : user.avatar,
          password: data.password !== undefined ? data.password : user.password,
        }
      });
      
      // 保存数据库状态
      saveDb();
      
      return HttpResponse.json(updatedUser);
    } catch (error) {
      console.error('更新用户失败:', error);
      return HttpResponse.json(
        { message: '更新用户失败' },
        { status: 500 }
      );
    }
  }),
  
  // 删除用户
  http.delete('/api/superadmin/users/:id', async ({ params }) => {
    await delay(300);
    const { id } = params;
    
    try {
      // 查找用户
      const user = db.user.findFirst({
        where: {
          id: {
            equals: String(id)
          }
        }
      });
      
      if (!user) {
        return HttpResponse.json(
          { message: '用户不存在' },
          { status: 404 }
        );
      }
      
      // 删除用户
      db.user.delete({
        where: {
          id: {
            equals: String(id)
          }
        }
      });
      
      // 保存数据库状态
      saveDb();
      
      return HttpResponse.json(
        { message: '用户删除成功' },
        { status: 200 }
      );
    } catch (error) {
      console.error('删除用户失败:', error);
      return HttpResponse.json(
        { message: '删除用户失败' },
        { status: 500 }
      );
    }
  }),
  
  // 修改用户状态（锁定/解锁/激活）
  http.patch('/api/superadmin/users/:id', async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const data = await request.json() as UpdateUserStatusData;
    
    try {
      // 查找用户
      const user = db.user.findFirst({
        where: {
          id: {
            equals: String(id)
          }
        }
      });
      
      if (!user) {
        return HttpResponse.json(
          { message: '用户不存在' },
          { status: 404 }
        );
      }
      
      // 更新用户状态
      // 注意：由于我们的db模型中没有status字段，这里只是模拟返回
      
      // 保存数据库状态
      saveDb();
      
      return HttpResponse.json(
        { message: '用户状态更新成功', status: data.status }
      );
    } catch (error) {
      console.error('更新用户状态失败:', error);
      return HttpResponse.json(
        { message: '更新用户状态失败' },
        { status: 500 }
      );
    }
  })
];

// 辅助函数：通过学校名称获取ID
function getSchoolIdFromName(name: string): string | undefined {
  const school = db.school.findFirst({
    where: {
      name: {
        equals: name
      }
    }
  });
  
  return school ? school.id : undefined;
}

// 辅助函数：通过ID获取学校名称
function getSchoolNameFromId(id: string): string {
  const school = db.school.findFirst({
    where: {
      id: {
        equals: id
      }
    }
  });
  
  return school ? school.name : '';
} 