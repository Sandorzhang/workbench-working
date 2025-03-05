import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

// 定义应用类型
interface Application {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  roles: string[];
}

// 获取应用列表处理程序
export const getApplicationsHandler = http.get('/api/applications', async ({ request }) => {
  await delay(300);
  
  try {
    console.log('Fetching applications...');
    
    // 获取当前用户信息
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return new HttpResponse(
        JSON.stringify({ error: '未授权访问' }),
        { status: 401 }
      );
    }
    
    // 从会话中获取用户ID
    const session = db.session.findFirst({
      where: {
        token: {
          equals: token
        }
      }
    });
    
    if (!session) {
      console.log('No session found for token');
      return new HttpResponse(
        JSON.stringify({ error: '会话无效' }),
        { status: 401 }
      );
    }
    
    const userId = session.userId;
    
    // 获取用户信息
    const user = db.user.findFirst({
      where: {
        id: {
          equals: userId
        }
      }
    });
    
    if (!user) {
      console.log('User not found');
      return new HttpResponse(
        JSON.stringify({ error: '用户不存在' }),
        { status: 404 }
      );
    }
    
    console.log(`User found: ${user.name}, role: ${user.role}`);
    
    // 获取所有应用
    const allApplications = db.application.getAll();
    console.log(`Total applications: ${allApplications.length}`);
    
    // 获取用户特定权限
    const userPermissions = db.permission.findMany({
      where: {
        userId: {
          equals: userId
        }
      }
    });
    
    console.log(`User specific permissions: ${userPermissions.length}`);
    
    // 获取角色权限
    const rolePermissions = db.rolePermission.findMany({
      where: {
        role: {
          equals: user.role
        }
      }
    });
    
    console.log(`Role permissions: ${rolePermissions.length}`);
    
    // 合并用户可访问的应用ID
    const accessibleAppIds = new Set();
    
    // 添加角色权限中的应用
    rolePermissions.forEach(permission => {
      if (permission.applicationId) {
        accessibleAppIds.add(permission.applicationId);
      }
    });
    
    // 添加用户特定权限中的应用
    userPermissions.forEach(permission => {
      if (permission.applicationId) {
        if (permission.granted) {
          accessibleAppIds.add(permission.applicationId);
        } else {
          accessibleAppIds.delete(permission.applicationId);
        }
      }
    });
    
    console.log(`Accessible application IDs: ${Array.from(accessibleAppIds).join(', ')}`);
    
    // 过滤用户可访问的应用
    let accessibleApplications = allApplications.filter(app => 
      accessibleAppIds.has(app.id)
    );
    
    console.log(`Filtered applications: ${accessibleApplications.length}`);
    
    // 按照排序字段排序
    accessibleApplications = accessibleApplications.sort((a, b) => {
      // 首先按照 order 字段排序
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      
      // 如果 order 相同，则按照 name 字段排序
      return a.name.localeCompare(b.name);
    });
    
    return HttpResponse.json(accessibleApplications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return new HttpResponse(
      JSON.stringify({ error: '获取应用列表失败' }),
      { status: 500 }
    );
  }
});

// 获取单个应用处理程序
export const getApplicationHandler = http.get('/api/applications/:id', async ({ params }) => {
  await delay(300);
  
  try {
    const { id } = params;
    
    const application = db.application.findFirst({
      where: {
        id: {
          equals: id as string
        }
      }
    });
    
    if (!application) {
      return new HttpResponse(
        JSON.stringify({ error: '应用不存在' }),
        { status: 404 }
      );
    }
    
    return HttpResponse.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return new HttpResponse(
      JSON.stringify({ error: '获取应用信息失败' }),
      { status: 500 }
    );
  }
});

// 创建应用处理程序
export const createApplicationHandler = http.post('/api/applications', async ({ request }) => {
  await delay(500);
  
  try {
    const applicationData = await request.json();
    
    // 检查必要字段
    if (!applicationData.name || !applicationData.description || !applicationData.icon) {
      return new HttpResponse(
        JSON.stringify({ error: '缺少必要字段' }),
        { status: 400 }
      );
    }
    
    // 创建新应用
    const newApplication = db.application.create({
      id: String(Date.now()),
      name: applicationData.name,
      description: applicationData.description,
      icon: applicationData.icon,
      url: applicationData.url || '#',
      order: applicationData.order || 0,
      createdAt: new Date().toISOString(),
    });
    
    return HttpResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return new HttpResponse(
      JSON.stringify({ error: '创建应用失败' }),
      { status: 500 }
    );
  }
});

// 更新应用处理程序
export const updateApplicationHandler = http.put('/api/applications/:id', async ({ params, request }) => {
  await delay(500);
  
  try {
    const { id } = params;
    const applicationData = await request.json();
    
    // 检查应用是否存在
    const existingApplication = db.application.findFirst({
      where: {
        id: {
          equals: id as string
        }
      }
    });
    
    if (!existingApplication) {
      return new HttpResponse(
        JSON.stringify({ error: '应用不存在' }),
        { status: 404 }
      );
    }
    
    // 更新应用
    const updatedApplication = db.application.update({
      where: {
        id: {
          equals: id as string
        }
      },
      data: applicationData
    });
    
    return HttpResponse.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application:', error);
    return new HttpResponse(
      JSON.stringify({ error: '更新应用失败' }),
      { status: 500 }
    );
  }
});

// 删除应用处理程序
export const deleteApplicationHandler = http.delete('/api/applications/:id', async ({ params }) => {
  await delay(400);
  
  try {
    const { id } = params;
    
    // 检查应用是否存在
    const existingApplication = db.application.findFirst({
      where: {
        id: {
          equals: id as string
        }
      }
    });
    
    if (!existingApplication) {
      return new HttpResponse(
        JSON.stringify({ error: '应用不存在' }),
        { status: 404 }
      );
    }
    
    // 删除应用
    db.application.delete({
      where: {
        id: {
          equals: id as string
        }
      }
    });
    
    // 同时删除相关的权限
    db.permission.deleteMany({
      where: {
        applicationId: {
          equals: id as string
        }
      }
    });
    
    db.rolePermission.deleteMany({
      where: {
        applicationId: {
          equals: id as string
        }
      }
    });
    
    return new HttpResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting application:', error);
    return new HttpResponse(
      JSON.stringify({ error: '删除应用失败' }),
      { status: 500 }
    );
  }
});

export const applicationHandlers = [
  getApplicationsHandler,
  getApplicationHandler,
  createApplicationHandler,
  updateApplicationHandler,
  deleteApplicationHandler,
]; 