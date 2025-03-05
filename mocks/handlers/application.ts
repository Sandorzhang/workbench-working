import { http, HttpResponse } from 'msw';
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

export const applicationHandlers = [
  // 获取所有应用
  http.get('/api/applications', async ({ request }) => {
    console.log('📝 GET /api/applications - 请求应用列表');
    
    try {
      // 获取用户角色参数
      const url = new URL(request.url);
      const userRole = url.searchParams.get('role') || '';
      const userId = url.searchParams.get('userId') || '';
      
      // 获取所有应用
      const allApplications = db.application.getAll();
      
      // 如果没有指定用户角色或ID，返回所有应用
      if (!userRole && !userId) {
        console.log(`✅ GET /api/applications - 成功返回所有 ${allApplications.length} 个应用`);
        return HttpResponse.json(allApplications);
      }
      
      let filteredApplications = [];
      
      if (userId) {
        // 如果指定了用户ID，获取该用户的角色
        const user = db.user.findFirst({
          where: { id: { equals: userId } }
        });
        
        if (!user) {
          return new HttpResponse(
            JSON.stringify({ error: '用户不存在' }), 
            { status: 404 }
          );
        }
        
        const role = user.role;
        
        // 获取用户自定义权限覆盖
        const userPermissions = db.userPermission.findMany({
          where: {
            userId: { equals: userId },
            resourceType: { equals: 'application' }
          }
        });
        
        // 用户权限映射
        const userPermissionMap = userPermissions.reduce((map, perm) => {
          map[perm.resourceId] = perm.allowed;
          return map;
        }, {} as Record<string, boolean>);
        
        // 过滤应用
        filteredApplications = allApplications.filter(app => {
          // 1. 检查用户是否有特定的权限覆盖
          if (userPermissionMap.hasOwnProperty(app.id)) {
            return userPermissionMap[app.id];
          }
          
          // 2. 否则检查应用是否对该角色可用
          return Array.isArray(app.roles) && app.roles.includes(role);
        });
      } else if (userRole) {
        // 如果只指定了角色，按角色过滤应用
        filteredApplications = allApplications.filter(app => 
          Array.isArray(app.roles) && app.roles.includes(userRole)
        );
      }
      
      console.log(`✅ GET /api/applications - 成功返回过滤后的 ${filteredApplications.length} 个应用`);
      return HttpResponse.json(filteredApplications);
    } catch (error) {
      console.error('❌ GET /api/applications - 获取应用列表失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取应用列表失败' }), 
        { status: 500 }
      );
    }
  }),

  // 获取单个应用
  http.get('/api/applications/:id', ({ params }) => {
    const { id } = params;
    console.log(`📝 GET /api/applications/${id} - 请求单个应用`);
    
    try {
      const application = db.application.findFirst({
        where: {
          id: {
            equals: id as string,
          },
        },
      });

      if (!application) {
        console.log(`❌ GET /api/applications/${id} - 未找到应用`);
        return new HttpResponse(null, { status: 404 });
      }

      console.log(`✅ GET /api/applications/${id} - 成功返回应用: ${application.name}`);
      return HttpResponse.json(application);
    } catch (error) {
      console.error(`❌ GET /api/applications/${id} - 获取应用失败:`, error);
      return new HttpResponse(
        JSON.stringify({ error: '获取应用失败' }), 
        { status: 500 }
      );
    }
  }),
]; 