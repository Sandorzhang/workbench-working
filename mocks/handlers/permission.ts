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

export const permissionHandlers = [
  // 获取所有路由权限
  http.get('/api/permissions/routes', async ({ request }) => {
    console.log('📝 GET /api/permissions/routes - 请求路由权限列表');
    await delay(300);
    
    // 获取查询参数
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const roleFilter = url.searchParams.get('role');
    
    try {
      // 获取所有路由
      const routes = db.route.getAll();
      
      // 获取角色权限
      const rolePermissions = db.rolePermission.getAll().filter(rp => 
        rp.resourceType === 'route'
      );
      
      // 获取用户权限覆盖
      const userPermissions = userId 
        ? db.userPermission.findMany({
            where: {
              userId: { equals: userId },
              resourceType: { equals: 'route' }
            }
          })
        : db.userPermission.getAll().filter(up => 
            up.resourceType === 'route'
          );
      
      // 构建响应数据
      const routesWithPermissions: ResourceWithPermissions[] = routes.map(route => {
        // 获取所有角色的权限状态
        const allowedRoles: { [key: string]: boolean } = {
          'superadmin': (route.roles as string[]).includes('superadmin'),
          'admin': (route.roles as string[]).includes('admin'),
          'teacher': (route.roles as string[]).includes('teacher'),
          'student': (route.roles as string[]).includes('student'),
        };
        
        // 应用角色权限覆盖
        rolePermissions.forEach(rp => {
          if (rp.resourceId === route.id) {
            allowedRoles[rp.role] = rp.allowed;
          }
        });
        
        // 获取用户权限覆盖
        const userOverrides = userPermissions
          .filter(up => up.resourceId === route.id)
          .map(up => {
            // 获取用户信息
            const user = db.user.findFirst({
              where: { id: { equals: up.userId } }
            });
            
            return {
              userId: up.userId,
              userName: user ? user.name : 'Unknown User',
              allowed: up.allowed
            };
          });
        
        return {
          id: route.id,
          name: route.name,
          description: route.description,
          path: route.path,
          roles: route.roles as string[],
          allowedRoles,
          userOverrides: userOverrides.length > 0 ? userOverrides : undefined
        };
      });
      
      // 根据角色筛选
      const filteredRoutes = roleFilter 
        ? routesWithPermissions.filter(route => 
            route.allowedRoles[roleFilter] || 
            (route.userOverrides && route.userOverrides.some(uo => uo.allowed))
          )
        : routesWithPermissions;
      
      return HttpResponse.json(filteredRoutes);
    } catch (error) {
      console.error('获取路由权限失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取路由权限失败' }),
        { status: 500 }
      );
    }
  }),
  
  // 获取所有应用权限
  http.get('/api/permissions/applications', async ({ request }) => {
    console.log('📝 GET /api/permissions/applications - 请求应用权限列表');
    await delay(300);
    
    // 获取查询参数
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const roleFilter = url.searchParams.get('role');
    
    try {
      // 获取所有应用
      const applications = db.application.getAll();
      
      // 获取角色权限
      const rolePermissions = db.rolePermission.getAll().filter(rp => 
        rp.resourceType === 'application'
      );
      
      // 获取用户权限覆盖
      const userPermissions = userId 
        ? db.userPermission.findMany({
            where: {
              userId: { equals: userId },
              resourceType: { equals: 'application' }
            }
          })
        : db.userPermission.getAll().filter(up => 
            up.resourceType === 'application'
          );
      
      // 构建响应数据
      const appsWithPermissions: ResourceWithPermissions[] = applications.map(app => {
        // 获取所有角色的权限状态
        const allowedRoles: { [key: string]: boolean } = {
          'superadmin': (app.roles as string[]).includes('superadmin'),
          'admin': (app.roles as string[]).includes('admin'),
          'teacher': (app.roles as string[]).includes('teacher'),
          'student': (app.roles as string[]).includes('student'),
        };
        
        // 应用角色权限覆盖
        rolePermissions.forEach(rp => {
          if (rp.resourceId === app.id) {
            allowedRoles[rp.role] = rp.allowed;
          }
        });
        
        // 获取用户权限覆盖
        const userOverrides = userPermissions
          .filter(up => up.resourceId === app.id)
          .map(up => {
            // 获取用户信息
            const user = db.user.findFirst({
              where: { id: { equals: up.userId } }
            });
            
            return {
              userId: up.userId,
              userName: user ? user.name : 'Unknown User',
              allowed: up.allowed
            };
          });
        
        return {
          id: app.id,
          name: app.name,
          description: app.description,
          url: app.url,
          icon: app.icon,
          roles: app.roles as string[],
          allowedRoles,
          userOverrides: userOverrides.length > 0 ? userOverrides : undefined
        };
      });
      
      // 根据角色筛选
      const filteredApps = roleFilter 
        ? appsWithPermissions.filter(app => 
            app.allowedRoles[roleFilter] || 
            (app.userOverrides && app.userOverrides.some(uo => uo.allowed))
          )
        : appsWithPermissions;
      
      return HttpResponse.json(filteredApps);
    } catch (error) {
      console.error('获取应用权限失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取应用权限失败' }),
        { status: 500 }
      );
    }
  }),
  
  // 更新角色权限
  http.put('/api/permissions/role', async ({ request }) => {
    console.log('📝 PUT /api/permissions/role - 更新角色权限');
    await delay(300);
    
    try {
      const { role, resourceType, resourceId, allowed } = await request.json() as {
        role: string;
        resourceType: 'route' | 'application';
        resourceId: string;
        allowed: boolean;
      };
      
      // 验证必填参数
      if (!role || !resourceType || !resourceId || allowed === undefined) {
        return new HttpResponse(
          JSON.stringify({ error: '缺少必要参数' }),
          { status: 400 }
        );
      }
      
      // 检查资源是否存在
      const resourceExists = resourceType === 'route'
        ? db.route.findFirst({ where: { id: { equals: resourceId } } })
        : db.application.findFirst({ where: { id: { equals: resourceId } } });
      
      if (!resourceExists) {
        return new HttpResponse(
          JSON.stringify({ error: '资源不存在' }),
          { status: 404 }
        );
      }
      
      // 查找现有权限
      const existingPermission = db.rolePermission.findFirst({
        where: {
          role: { equals: role },
          resourceType: { equals: resourceType },
          resourceId: { equals: resourceId }
        }
      });
      
      if (existingPermission) {
        // 更新现有权限
        db.rolePermission.update({
          where: { id: { equals: existingPermission.id } },
          data: { allowed }
        });
      } else {
        // 创建新权限
        db.rolePermission.create({
          id: `rp-${Date.now()}`,
          role,
          resourceType,
          resourceId,
          allowed
        });
      }
      
      // 如果是路由权限，还需要更新路由的roles数组
      if (resourceType === 'route') {
        const route = db.route.findFirst({
          where: { id: { equals: resourceId } }
        });
        
        if (route) {
          const roles = route.roles as string[];
          if (allowed && !roles.includes(role)) {
            db.route.update({
              where: { id: { equals: resourceId } },
              data: { roles: [...roles, role] }
            });
          } else if (!allowed && roles.includes(role)) {
            db.route.update({
              where: { id: { equals: resourceId } },
              data: { roles: roles.filter(r => r !== role) }
            });
          }
        }
      }
      
      // 如果是应用权限，还需要更新应用的roles数组
      if (resourceType === 'application') {
        const app = db.application.findFirst({
          where: { id: { equals: resourceId } }
        });
        
        if (app) {
          const roles = app.roles as string[];
          if (allowed && !roles.includes(role)) {
            db.application.update({
              where: { id: { equals: resourceId } },
              data: { roles: [...roles, role] }
            });
          } else if (!allowed && roles.includes(role)) {
            db.application.update({
              where: { id: { equals: resourceId } },
              data: { roles: roles.filter(r => r !== role) }
            });
          }
        }
      }
      
      // 保存数据库状态
      saveDb();
      
      return HttpResponse.json({ success: true });
    } catch (error) {
      console.error('更新角色权限失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '更新角色权限失败' }),
        { status: 500 }
      );
    }
  }),
  
  // 更新用户特定权限
  http.put('/api/permissions/user', async ({ request }) => {
    console.log('📝 PUT /api/permissions/user - 更新用户权限');
    await delay(300);
    
    try {
      const { userId, resourceType, resourceId, allowed } = await request.json() as {
        userId: string;
        resourceType: 'route' | 'application';
        resourceId: string;
        allowed: boolean;
      };
      
      // 验证必填参数
      if (!userId || !resourceType || !resourceId || allowed === undefined) {
        return new HttpResponse(
          JSON.stringify({ error: '缺少必要参数' }),
          { status: 400 }
        );
      }
      
      // 检查用户是否存在
      const user = db.user.findFirst({
        where: { id: { equals: userId } }
      });
      
      if (!user) {
        return new HttpResponse(
          JSON.stringify({ error: '用户不存在' }),
          { status: 404 }
        );
      }
      
      // 检查资源是否存在
      const resourceExists = resourceType === 'route'
        ? db.route.findFirst({ where: { id: { equals: resourceId } } })
        : db.application.findFirst({ where: { id: { equals: resourceId } } });
      
      if (!resourceExists) {
        return new HttpResponse(
          JSON.stringify({ error: '资源不存在' }),
          { status: 404 }
        );
      }
      
      // 查找现有权限
      const existingPermission = db.userPermission.findFirst({
        where: {
          userId: { equals: userId },
          resourceType: { equals: resourceType },
          resourceId: { equals: resourceId }
        }
      });
      
      if (existingPermission) {
        // 更新现有权限
        db.userPermission.update({
          where: { id: { equals: existingPermission.id } },
          data: { allowed }
        });
      } else {
        // 创建新权限
        db.userPermission.create({
          id: `up-${Date.now()}`,
          userId,
          resourceType,
          resourceId,
          allowed
        });
      }
      
      // 保存数据库状态
      saveDb();
      
      return HttpResponse.json({ success: true });
    } catch (error) {
      console.error('更新用户权限失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '更新用户权限失败' }),
        { status: 500 }
      );
    }
  }),
  
  // 删除用户特定权限（恢复到角色默认权限）
  http.delete('/api/permissions/user', async ({ request }) => {
    console.log('📝 DELETE /api/permissions/user - 删除用户特定权限');
    await delay(300);
    
    // 获取查询参数
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const resourceType = url.searchParams.get('resourceType') as 'route' | 'application';
    const resourceId = url.searchParams.get('resourceId');
    
    if (!userId || !resourceType || !resourceId) {
      return new HttpResponse(
        JSON.stringify({ error: '缺少必要参数' }),
        { status: 400 }
      );
    }
    
    try {
      // 查找并删除用户权限
      const existingPermission = db.userPermission.findFirst({
        where: {
          userId: { equals: userId },
          resourceType: { equals: resourceType },
          resourceId: { equals: resourceId }
        }
      });
      
      if (existingPermission) {
        db.userPermission.delete({
          where: { id: { equals: existingPermission.id } }
        });
        
        // 保存数据库状态
        saveDb();
        
        return HttpResponse.json({ success: true });
      }
      
      return HttpResponse.json(
        { error: '找不到指定的权限' },
        { status: 404 }
      );
    } catch (error) {
      console.error('删除用户权限失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '删除用户权限失败' }),
        { status: 500 }
      );
    }
  }),
  
  // 获取特定用户的所有权限
  http.get('/api/permissions/user/:id', async ({ params }) => {
    const { id } = params;
    console.log(`📝 GET /api/permissions/user/${id} - 获取用户权限`);
    await delay(300);
    
    try {
      // 获取用户
      const user = db.user.findFirst({
        where: { id: { equals: id as string } }
      });
      
      if (!user) {
        return new HttpResponse(
          JSON.stringify({ error: '用户不存在' }),
          { status: 404 }
        );
      }
      
      const userRole = user.role;
      
      // 获取用户特定权限
      const userPermissions = db.userPermission.findMany({
        where: { userId: { equals: id as string } }
      });
      
      // 获取该角色的权限
      const rolePermissions = db.rolePermission.findMany({
        where: { role: { equals: userRole } }
      });
      
      // 获取所有路由和应用
      const routes = db.route.getAll();
      const applications = db.application.getAll();
      
      // 构建用户的应用权限
      const appPermissions = applications.map(app => {
        // 默认权限基于app.roles
        let allowed = (app.roles as string[]).includes(userRole);
        
        // 角色权限覆盖
        const rolePerm = rolePermissions.find(rp => 
          rp.resourceType === 'application' && rp.resourceId === app.id
        );
        if (rolePerm) {
          allowed = rolePerm.allowed;
        }
        
        // 用户特定权限覆盖
        const userPerm = userPermissions.find(up => 
          up.resourceType === 'application' && up.resourceId === app.id
        );
        if (userPerm) {
          allowed = userPerm.allowed;
        }
        
        return {
          id: app.id,
          name: app.name,
          description: app.description,
          url: app.url,
          icon: app.icon,
          allowed,
          hasCustomPermission: !!userPerm
        };
      });
      
      // 构建用户的路由权限
      const routePermissions = routes.map(route => {
        // 默认权限基于route.roles
        let allowed = (route.roles as string[]).includes(userRole);
        
        // 角色权限覆盖
        const rolePerm = rolePermissions.find(rp => 
          rp.resourceType === 'route' && rp.resourceId === route.id
        );
        if (rolePerm) {
          allowed = rolePerm.allowed;
        }
        
        // 用户特定权限覆盖
        const userPerm = userPermissions.find(up => 
          up.resourceType === 'route' && up.resourceId === route.id
        );
        if (userPerm) {
          allowed = userPerm.allowed;
        }
        
        return {
          id: route.id,
          name: route.name,
          description: route.description,
          path: route.path,
          allowed,
          hasCustomPermission: !!userPerm
        };
      });
      
      return HttpResponse.json({
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        },
        applications: appPermissions,
        routes: routePermissions
      });
    } catch (error) {
      console.error('获取用户权限失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取用户权限失败' }),
        { status: 500 }
      );
    }
  })
]; 