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

// 获取用户权限列表
export const getUserPermissionsHandler = http.get('/api/permissions/user/:userId', async ({ params }) => {
  await delay(300);
  
  try {
    const { userId } = params;
    
    // 获取用户特定权限
    const userPermissions = db.permission.findMany({
      where: {
        userId: {
          equals: userId as string
        }
      }
    });
    
    return HttpResponse.json(userPermissions);
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
    const permissionData = await request.json();
    
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
    const permissionData = await request.json();
    
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
  getUserPermissionsHandler,
  getRolePermissionsHandler,
  updateUserPermissionHandler,
  updateRolePermissionHandler,
  deleteUserPermissionHandler,
  deleteRolePermissionHandler,
]; 