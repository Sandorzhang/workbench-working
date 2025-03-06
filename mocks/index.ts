// import { server } from './node'
import { seedDb, db, loadDb, saveDb } from './db';
import { handlers } from './handlers/index';

// 初始化MSW数据库 - 只有在加载失败时才会执行
seedDb();

// 手动初始化角色权限
const initializeRolePermissions = () => {
  console.log('>>> [MSW初始化] 检查角色权限状态...');
  
  // 获取角色权限
  const existingPermissions = db.rolePermission.getAll();
  
  // 检查每个角色是否有权限记录
  const roles = ['superadmin', 'admin', 'teacher', 'student'];
  const roleHasPermissions: Record<string, boolean> = {};
  
  roles.forEach(role => {
    const hasPerms = existingPermissions.some(p => p.role === role);
    roleHasPermissions[role] = hasPerms;
    console.log(`>>> [MSW初始化] 角色 "${role}" ${hasPerms ? '已有' : '没有'} 权限记录`);
  });
  
  // 如果所有角色都有权限记录，则跳过初始化
  const allRolesHavePermissions = roles.every(role => roleHasPermissions[role]);
  
  if (allRolesHavePermissions) {
    console.log('>>> [MSW初始化] 所有角色都已有权限记录，跳过完全初始化');
    
    // 仍然检查是否有缺失的权限（针对角色应该访问的应用）
    const allApplications = db.application.getAll();
    console.log(`>>> [MSW初始化] 系统中共有 ${allApplications.length} 个应用，检查权限完整性`);
    
    // 补充可能缺失的权限
    roles.forEach(role => {
      console.log(`>>> [MSW初始化] 检查角色 "${role}" 的应用权限...`);
      
      // 获取当前角色所有现有权限
      const rolePerms = existingPermissions.filter(p => p.role === role);
      const permittedAppIds = rolePerms.filter(p => p.granted).map(p => p.applicationId);
      const deniedAppIds = rolePerms.filter(p => !p.granted).map(p => p.applicationId);
      
      console.log(`>>> [MSW初始化] 角色 "${role}" 现有权限: ${permittedAppIds.length} 允许, ${deniedAppIds.length} 拒绝`);
      
      // 确定该角色应该可访问的应用
      let applicationsForRole = allApplications;
      
      if (role === 'teacher') {
        // 排除管理员专用应用
        const adminOnlyAppIds = ['10', '11', '12', '13', '14']; 
        applicationsForRole = allApplications.filter(app => !adminOnlyAppIds.includes(app.id));
      } else if (role === 'student') {
        // 学生只能访问部分应用
        const studentAppIds = ['1', '2', '3', '5', '7', '8'];
        applicationsForRole = allApplications.filter(app => studentAppIds.includes(app.id));
      }
      
      // 检查默认角色权限是否丢失
      applicationsForRole.forEach(app => {
        if (!permittedAppIds.includes(app.id) && !deniedAppIds.includes(app.id)) {
          // 此应用缺少权限记录，添加默认允许
          try {
            db.rolePermission.create({
              id: `${role}-${app.id}-${Date.now()}`,
              role: role,
              applicationId: app.id,
              granted: true,
              createdAt: new Date().toISOString()
            });
            console.log(`>>> [MSW初始化] 补充角色权限: 为 ${role} 添加应用 ${app.name} (ID: ${app.id}) 的访问权限`);
          } catch (e) {
            console.log(`>>> [MSW初始化] 补充权限失败: ${role}-${app.id}`, e);
          }
        }
      });
      
      // 对于应该拒绝的应用，也检查缺失记录
      if (role === 'teacher' || role === 'student') {
        const restrictedApps = allApplications.filter(app => !applicationsForRole.some(a => a.id === app.id));
        
        restrictedApps.forEach(app => {
          if (!permittedAppIds.includes(app.id) && !deniedAppIds.includes(app.id)) {
            // 此应用缺少权限记录，添加默认拒绝
            try {
              db.rolePermission.create({
                id: `${role}-${app.id}-restricted-${Date.now()}`,
                role: role,
                applicationId: app.id,
                granted: false,
                createdAt: new Date().toISOString()
              });
              console.log(`>>> [MSW初始化] 补充角色权限: 为 ${role} 添加应用 ${app.name} (ID: ${app.id}) 的拒绝权限`);
            } catch (e) {
              console.log(`>>> [MSW初始化] 补充拒绝权限失败: ${role}-${app.id}`, e);
            }
          }
        });
      }
    });
    
    // 保存数据库状态
    saveDb();
    console.log('>>> [MSW初始化] 权限完整性检查完成，数据库已保存');
    return;
  }
  
  console.log('>>> [MSW初始化] 开始进行完整的权限初始化...');
  const allApplications = db.application.getAll();
  console.log(`>>> [MSW初始化] 找到 ${allApplications.length} 个应用，准备设置权限`);
  
  // 为每个角色设置权限
  roles.forEach(role => {
    // 清除现有角色权限
    try {
      const existingPermissions = db.rolePermission.findMany({
        where: {
          role: {
            equals: role
          }
        }
      });
      
      console.log(`>>> [MSW初始化] 找到 ${existingPermissions.length} 个现有 ${role} 权限记录`);
      
      db.rolePermission.deleteMany({
        where: {
          role: {
            equals: role
          }
        }
      });
      console.log(`>>> [MSW初始化] 已删除现有 ${role} 角色权限`);
    } catch (e) {
      console.log(`>>> [MSW初始化] 删除 ${role} 角色旧权限时出错`, e);
    }
    
    // 为角色添加应用权限
    // 根据角色分配不同的应用权限
    let applicationsForRole = allApplications;
    
    // 根据角色限制应用访问权限
    if (role === 'teacher') {
      // 排除管理员专用应用
      const adminOnlyAppIds = ['10', '11', '12', '13', '14']; // 教育管理、教师管理、学生管理、年级管理、班级管理
      applicationsForRole = allApplications.filter(app => !adminOnlyAppIds.includes(app.id));
    } else if (role === 'student') {
      // 学生只能访问部分应用
      const studentAppIds = ['1', '2', '3', '5', '7', '8']; // 只允许学生访问部分应用
      applicationsForRole = allApplications.filter(app => studentAppIds.includes(app.id));
    }
    
    // 添加权限
    applicationsForRole.forEach(app => {
      try {
        db.rolePermission.create({
          id: `${role}-${app.id}-${Date.now()}`,
          role: role,
          applicationId: app.id,
          granted: true,
          createdAt: new Date().toISOString()
        });
        console.log(`>>> [MSW初始化] 为 ${role} 角色添加应用权限: ${app.name} (ID: ${app.id})`);
      } catch (e) {
        console.log(`>>> [MSW初始化] 为 ${role} 添加应用权限失败: ${app.name}`, e);
      }
    });
    
    // 如果是学生或教师，对某些应用明确禁止访问
    if (role === 'student' || role === 'teacher') {
      const restrictedApps = allApplications.filter(app => !applicationsForRole.some(a => a.id === app.id));
      restrictedApps.forEach(app => {
        try {
          db.rolePermission.create({
            id: `${role}-${app.id}-restricted-${Date.now()}`,
            role: role,
            applicationId: app.id,
            granted: false,
            createdAt: new Date().toISOString()
          });
          console.log(`>>> [MSW初始化] 为 ${role} 角色禁止访问应用: ${app.name} (ID: ${app.id})`);
        } catch (e) {
          console.log(`>>> [MSW初始化] 为 ${role} 设置禁止权限失败: ${app.name}`, e);
        }
      });
    }
  });
  
  // 保存数据库状态
  saveDb();
  console.log('>>> [MSW初始化] 权限初始化完成，数据库状态已保存');
};

// 确保角色权限初始化执行
initializeRolePermissions();

// 最大重试次数
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

// 浏览器
export const worker = {
  start: async (options = {}) => {
    if (typeof window === 'undefined') {
      return;
    }

    let retries = 0;
    
    const tryStart = async (): Promise<any> => {
      try {
        console.log(`尝试启动 MSW worker (尝试 ${retries + 1}/${MAX_RETRIES})...`);
        
        // 动态导入browser模块
        const { worker } = await import('./browser');
        
        // 启动worker
        await worker.start(options);
        
        // 确保默认会话可用
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('设置默认测试token');
          localStorage.setItem('token', 'default-token');
          
          // 创建一个默认会话，确保default-token有效
          try {
            // 检查是否有默认用户
            const defaultUser = db.user.findFirst({
              where: {
                id: {
                  equals: '1',
                },
              },
            });
            
            if (defaultUser) {
              console.log('为默认用户创建有效会话');
              const expiresAt = new Date();
              expiresAt.setDate(expiresAt.getDate() + 7); // 7天有效期
              
              // 先删除任何可能存在的default-token会话
              try {
                db.session.delete({
                  where: {
                    token: {
                      equals: 'default-token',
                    },
                  },
                });
              } catch (e) {
                // 忽略不存在的会话
              }
              
              // 创建新会话
              db.session.create({
                id: String(Date.now()),
                userId: defaultUser.id,
                token: 'default-token',
                expiresAt: expiresAt.toISOString(),
              });
              
              console.log('默认会话创建成功');
            } else {
              console.warn('找不到默认用户，无法创建默认会话');
            }
          } catch (e) {
            console.error('创建默认会话失败:', e);
          }
        }
        
        // 初始化角色权限
        initializeRolePermissions();
        
        console.log('MSW worker 启动成功，handlers:', handlers.length);
        return worker;
      } catch (error) {
        console.error(`MSW worker 启动失败 (尝试 ${retries + 1}/${MAX_RETRIES}):`, error);
        
        if (retries < MAX_RETRIES - 1) {
          retries++;
          console.log(`等待 ${RETRY_DELAY}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return tryStart();
        }
        
        throw error;
      }
    };
    
    return tryStart();
  },
};

// 服务器
export const server = async () => {
  if (typeof window !== 'undefined') {
    return;
  }

  try {
    // 动态导入node模块
    const { server } = await import('./node');
    
    // 启动服务器
    server.listen();
    console.log('MSW server 启动成功');
    
    return server;
  } catch (error) {
    console.error('MSW server 启动失败:', error);
    throw error;
  }
}; 