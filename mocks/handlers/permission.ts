import { http, HttpResponse, delay } from 'msw';
import { db, saveDb } from '../db';

// 定义API响应类型
interface ResourceWithPermissions {
  id: string;
  name: string;
  description: string;
  path?: string;
  url?: string; 
  icon?: string;
  roles: string[];
  allowedRoles: {
    [key: string]: boolean;
  };
  userOverrides?: {
    userId: string;
    userName: string;
    allowed: boolean;
  }[];
}

// 定义API请求类型
interface UserPermissionRequest {
  userId: string;
  applicationId: string;
  granted: boolean;
}

interface RolePermissionRequest {
  role: string;
  applicationId: string;
  granted: boolean;
}

// 处理 GET /api/permissions/applications 请求 - 新增的接口
export const getApplicationsPermissionsHandler = http.get('/api/permissions/applications', async ({ request }) => {
  await delay(300);
  
  try {
    console.log('>>> [MSW拦截] 获取应用权限列表');
    const url = new URL(request.url);
    const roleFilter = url.searchParams.get('role') || '';
    
    // 获取所有应用
    const applications = db.application.getAll();
    console.log(`>>> [MSW拦截] 找到 ${applications.length} 个应用`);
    
    // 获取角色权限
    const rolePermissions = db.rolePermission.getAll();
    
    // 获取用户权限
    const userPermissions = db.permission.getAll();
    
    // 转换为带权限信息的资源列表
    const applicationsWithPermissions = applications.map(app => {
      // 初始化角色权限映射
      const allowedRoles: { [key: string]: boolean } = {};
      
      // 默认角色权限设置
      const defaultRoles: string[] = Array.isArray(app.roles) 
        ? (app.roles as any[]).map(r => String(r)) 
        : [];
      
      defaultRoles.forEach(role => {
        allowedRoles[role] = true;
      });
      
      // 应用角色权限覆盖
      rolePermissions
        .filter(rp => rp.applicationId === app.id)
        .forEach(rp => {
          allowedRoles[rp.role] = rp.granted;
        });
      
      // 用户权限覆盖
      const userOverrides = userPermissions
        .filter(up => up.applicationId === app.id)
        .map(up => {
          // 获取用户信息
          const user = db.user.findFirst({
            where: {
              id: {
                equals: up.userId
              }
            }
          });
          
          return {
            userId: up.userId,
            userName: user ? user.name : '未知用户',
            allowed: up.granted
          };
        });
      
      const resource: ResourceWithPermissions = {
        id: app.id,
        name: app.name,
        description: app.description,
        url: app.url,
        icon: app.icon,
        roles: defaultRoles,
        allowedRoles,
        userOverrides: userOverrides.length > 0 ? userOverrides : undefined
      };
      
      return resource;
    });
    
    // 根据角色过滤
    let result = applicationsWithPermissions;
    if (roleFilter && roleFilter.length > 0) {
      console.log(`>>> [MSW拦截] 应用角色过滤: ${roleFilter}`);
      result = result.filter(app => {
        // 检查这个角色是否能访问此应用
        return app.allowedRoles[roleFilter] === true;
      });
    }
    
    console.log(`>>> [MSW拦截] 返回 ${result.length} 个应用的权限信息`);
    return HttpResponse.json(result);
  } catch (error) {
    console.error('Error fetching application permissions:', error);
    return new HttpResponse(
      JSON.stringify({ error: '获取应用权限列表失败' }),
      { status: 500 }
    );
  }
});

// 获取用户权限列表
export const getUserPermissionsHandler = http.get('/api/permissions/user/:userId', async ({ params }) => {
  await delay(300);
  
  try {
    const { userId } = params;
    console.log(`>>> [MSW拦截] 获取用户权限: userId=${userId}`);
    
    // 获取用户信息
    const user = db.user.findFirst({
      where: {
        id: {
          equals: userId as string
        }
      }
    });
    
    if (!user) {
      console.log(`>>> [MSW拦截] 获取用户权限失败: 找不到用户 ${userId}`);
      return new HttpResponse(
        JSON.stringify({ error: '用户不存在' }),
        { status: 404 }
      );
    }
    
    // 获取所有应用
    const applications = db.application.getAll();
    
    // 获取用户特定权限
    const userPermissions = db.permission.findMany({
      where: {
        userId: {
          equals: userId as string
        }
      }
    });
    
    // 获取用户角色的权限
    const rolePermissions = db.rolePermission.findMany({
      where: {
        role: {
          equals: user.role
        }
      }
    });
    
    // 处理应用数据
    const applicationsWithPermissions = applications.map(app => {
      // 检查角色权限
      const rolePermission = rolePermissions.find(rp => rp.applicationId === app.id);
      let allowed = false;
      let hasCustomPermission = false;
      
      // 检查此应用是否默认允许用户角色访问
      if (Array.isArray(app.roles) && app.roles.includes(user.role)) {
        allowed = true;
      }
      
      // 应用角色特定权限
      if (rolePermission) {
        allowed = rolePermission.granted;
      }
      
      // 应用用户特定权限（覆盖角色权限）
      const userPermission = userPermissions.find(up => up.applicationId === app.id);
      if (userPermission) {
        allowed = userPermission.granted;
        hasCustomPermission = true;
      }
      
      return {
        id: app.id,
        name: app.name,
        description: app.description,
        url: app.url,
        icon: app.icon,
        allowed,
        hasCustomPermission
      };
    });
    
    const result = {
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      applications: applicationsWithPermissions
    };
    
    console.log(`>>> [MSW拦截] 返回用户权限，应用数量: ${applicationsWithPermissions.length}`);
    return HttpResponse.json(result);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return new HttpResponse(
      JSON.stringify({ error: '获取用户权限失败' }),
      { status: 500 }
    );
  }
});

// 获取角色权限列表
export const getRolePermissionsHandler = http.get('/api/permissions/role/:role', async ({ params }) => {
  await delay(300);
  
  try {
    const { role } = params;
    
    // 获取角色权限
    const rolePermissions = db.rolePermission.findMany({
      where: {
        role: {
          equals: role as string
        }
      }
    });
    
    return HttpResponse.json(rolePermissions);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return new HttpResponse(
      JSON.stringify({ error: '获取角色权限失败' }),
      { status: 500 }
    );
  }
});

// 创建或更新用户权限
export const updateUserPermissionHandler = http.post('/api/permissions/user', async ({ request }) => {
  await delay(500);
  
  try {
    const permissionData = await request.json() as UserPermissionRequest;
    
    // 检查必要字段
    if (!permissionData.userId || !permissionData.applicationId) {
      return new HttpResponse(
        JSON.stringify({ error: '缺少必要字段' }),
        { status: 400 }
      );
    }
    
    // 检查是否已存在该权限
    const existingPermission = db.permission.findFirst({
      where: {
        userId: {
          equals: permissionData.userId
        },
        applicationId: {
          equals: permissionData.applicationId
        }
      }
    });
    
    let result;
    
    if (existingPermission) {
      // 更新现有权限
      result = db.permission.update({
        where: {
          id: {
            equals: existingPermission.id
          }
        },
        data: {
          granted: permissionData.granted
        }
      });
    } else {
      // 创建新权限
      result = db.permission.create({
        id: String(Date.now()),
        userId: permissionData.userId,
        applicationId: permissionData.applicationId,
        granted: permissionData.granted !== false, // 默认为true
        createdAt: new Date().toISOString(),
      });
    }
    
    return HttpResponse.json(result);
  } catch (error) {
    console.error('Error updating user permission:', error);
    return new HttpResponse(
      JSON.stringify({ error: '更新用户权限失败' }),
      { status: 500 }
    );
  }
});

// 创建或更新角色权限
export const updateRolePermissionHandler = http.post('/api/permissions/role', async ({ request }) => {
  await delay(500);
  
  try {
    const permissionData = await request.json() as RolePermissionRequest;
    
    // 检查必要字段
    if (!permissionData.role || !permissionData.applicationId) {
      return new HttpResponse(
        JSON.stringify({ error: '缺少必要字段' }),
        { status: 400 }
      );
    }
    
    // 检查是否已存在该权限
    const existingPermission = db.rolePermission.findFirst({
      where: {
        role: {
          equals: permissionData.role
        },
        applicationId: {
          equals: permissionData.applicationId
        }
      }
    });
    
    let result;
    
    if (existingPermission) {
      // 更新现有权限
      result = db.rolePermission.update({
        where: {
          id: {
            equals: existingPermission.id
          }
        },
        data: {
          granted: permissionData.granted
        }
      });
    } else {
      // 创建新权限
      result = db.rolePermission.create({
        id: String(Date.now()),
        role: permissionData.role,
        applicationId: permissionData.applicationId,
        granted: permissionData.granted !== false, // 默认为true
        createdAt: new Date().toISOString(),
      });
    }
    
    return HttpResponse.json(result);
  } catch (error) {
    console.error('Error updating role permission:', error);
    return new HttpResponse(
      JSON.stringify({ error: '更新角色权限失败' }),
      { status: 500 }
    );
  }
});

// 删除用户权限
export const deleteUserPermissionHandler = http.delete('/api/permissions/user/:id', async ({ params }) => {
  await delay(400);
  
  try {
    const { id } = params;
    
    // 检查权限是否存在
    const existingPermission = db.permission.findFirst({
      where: {
        id: {
          equals: id as string
        }
      }
    });
    
    if (!existingPermission) {
      return new HttpResponse(
        JSON.stringify({ error: '权限不存在' }),
        { status: 404 }
      );
    }
    
    // 删除权限
    db.permission.delete({
      where: {
        id: {
          equals: id as string
        }
      }
    });
    
    return new HttpResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user permission:', error);
    return new HttpResponse(
      JSON.stringify({ error: '删除用户权限失败' }),
      { status: 500 }
    );
  }
});

// 更新用户权限 (PUT请求)
export const updateUserPermissionPutHandler = http.put('/api/permissions/user', async ({ request }) => {
  await delay(500);
  
  try {
    const data = await request.json() as {
      userId: string;
      resourceType: string;
      resourceId: string;
      allowed: boolean;
    };
    
    // 验证必要字段
    if (!data.userId || !data.resourceType || !data.resourceId) {
      return new HttpResponse(
        JSON.stringify({ error: '缺少必要字段' }),
        { status: 400 }
      );
    }
    
    if (data.resourceType !== 'application') {
      return new HttpResponse(
        JSON.stringify({ error: '不支持的资源类型' }),
        { status: 400 }
      );
    }
    
    console.log(`>>> [MSW拦截] 更新用户权限: userId=${data.userId}, resourceId=${data.resourceId}, allowed=${data.allowed}`);
    
    // 查找是否已存在权限
    const existingPermission = db.permission.findFirst({
      where: {
        userId: {
          equals: data.userId
        },
        applicationId: {
          equals: data.resourceId
        }
      }
    });
    
    let result;
    
    if (existingPermission) {
      // 更新现有权限
      result = db.permission.update({
        where: {
          id: {
            equals: existingPermission.id
          }
        },
        data: {
          granted: data.allowed
        }
      });
    } else {
      // 创建新权限
      result = db.permission.create({
        id: String(Date.now()),
        userId: data.userId,
        applicationId: data.resourceId,
        granted: data.allowed,
        createdAt: new Date().toISOString(),
      });
    }
    
    // 保存数据
    saveDb();
    
    console.log('>>> [MSW拦截] 用户权限更新成功');
    return HttpResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error updating user permission:', error);
    return new HttpResponse(
      JSON.stringify({ error: '更新用户权限失败' }),
      { status: 500 }
    );
  }
});

// 更新角色权限 (PUT请求)
export const updateRolePermissionPutHandler = http.put('/api/permissions/role', async ({ request }) => {
  await delay(500);
  
  try {
    const data = await request.json() as {
      role: string;
      resourceType: string;
      resourceId: string;
      allowed: boolean;
    };
    
    // 验证必要字段
    if (!data.role || !data.resourceType || !data.resourceId) {
      return new HttpResponse(
        JSON.stringify({ error: '缺少必要字段' }),
        { status: 400 }
      );
    }
    
    if (data.resourceType !== 'application') {
      return new HttpResponse(
        JSON.stringify({ error: '不支持的资源类型' }),
        { status: 400 }
      );
    }
    
    console.log(`>>> [MSW拦截] 更新角色权限: role=${data.role}, resourceId=${data.resourceId}, allowed=${data.allowed}`);
    
    // 查找是否已存在权限
    const existingPermission = db.rolePermission.findFirst({
      where: {
        role: {
          equals: data.role
        },
        applicationId: {
          equals: data.resourceId
        }
      }
    });
    
    let result;
    
    if (existingPermission) {
      // 更新现有权限
      result = db.rolePermission.update({
        where: {
          id: {
            equals: existingPermission.id
          }
        },
        data: {
          granted: data.allowed
        }
      });
    } else {
      // 创建新权限
      result = db.rolePermission.create({
        id: String(Date.now()),
        role: data.role,
        applicationId: data.resourceId,
        granted: data.allowed,
        createdAt: new Date().toISOString(),
      });
    }
    
    // 保存数据
    saveDb();
    
    console.log('>>> [MSW拦截] 角色权限更新成功');
    return HttpResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error updating role permission:', error);
    return new HttpResponse(
      JSON.stringify({ error: '更新角色权限失败' }),
      { status: 500 }
    );
  }
});

// 删除用户自定义权限（恢复到角色默认）
export const resetUserPermissionHandler = http.delete('/api/permissions/user', async ({ request }) => {
  await delay(400);
  
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const resourceType = url.searchParams.get('resourceType');
    const resourceId = url.searchParams.get('resourceId');
    
    if (!userId || !resourceType || !resourceId) {
      return new HttpResponse(
        JSON.stringify({ error: '缺少必要参数' }),
        { status: 400 }
      );
    }
    
    if (resourceType !== 'application') {
      return new HttpResponse(
        JSON.stringify({ error: '不支持的资源类型' }),
        { status: 400 }
      );
    }
    
    console.log(`>>> [MSW拦截] 重置用户权限: userId=${userId}, resourceId=${resourceId}`);
    
    // 查找是否存在权限
    const existingPermission = db.permission.findFirst({
      where: {
        userId: {
          equals: userId
        },
        applicationId: {
          equals: resourceId
        }
      }
    });
    
    if (existingPermission) {
      // 删除权限记录
      db.permission.delete({
        where: {
          id: {
            equals: existingPermission.id
          }
        }
      });
      
      // 保存数据
      saveDb();
      
      console.log('>>> [MSW拦截] 用户权限重置成功');
      return HttpResponse.json({ success: true });
    } else {
      console.log('>>> [MSW拦截] 未找到对应的用户权限记录');
      return HttpResponse.json({ success: true, message: '无权限记录可删除' });
    }
  } catch (error) {
    console.error('Error resetting user permission:', error);
    return new HttpResponse(
      JSON.stringify({ error: '重置用户权限失败' }),
      { status: 500 }
    );
  }
});

// 删除角色权限
export const deleteRolePermissionHandler = http.delete('/api/permissions/role/:id', async ({ params }) => {
  await delay(400);
  
  try {
    const { id } = params;
    
    // 检查权限是否存在
    const existingPermission = db.rolePermission.findFirst({
      where: {
        id: {
          equals: id as string
        }
      }
    });
    
    if (!existingPermission) {
      return new HttpResponse(
        JSON.stringify({ error: '权限不存在' }),
        { status: 404 }
      );
    }
    
    // 删除权限
    db.rolePermission.delete({
      where: {
        id: {
          equals: id as string
        }
      }
    });
    
    return new HttpResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting role permission:', error);
    return new HttpResponse(
      JSON.stringify({ error: '删除角色权限失败' }),
      { status: 500 }
    );
  }
});

export const permissionHandlers = [
  getApplicationsPermissionsHandler,
  getUserPermissionsHandler,
  getRolePermissionsHandler,
  updateUserPermissionHandler,
  updateRolePermissionHandler,
  deleteUserPermissionHandler,
  deleteRolePermissionHandler,
  updateUserPermissionPutHandler,
  updateRolePermissionPutHandler,
  resetUserPermissionHandler,
]; 