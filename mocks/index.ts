// import { server } from './node'
import { seedDb, db, loadDb, saveDb } from './db';
import { handlers } from './handlers/index';

// 初始化MSW数据库 - 只有在加载失败时才会执行
seedDb();

// 手动初始化角色权限
const initializeRolePermissions = () => {
  console.log('检查角色权限状态...');
  
  // 首先检查是否已经存在角色权限数据
  const existingAdminPermissions = db.rolePermission.findMany({
    where: {
      role: {
        equals: 'admin'
      }
    }
  });
  
  const existingTeacherPermissions = db.rolePermission.findMany({
    where: {
      role: {
        equals: 'teacher'
      }
    }
  });
  
  // 如果已有权限数据，则不重新初始化
  if (existingAdminPermissions.length > 0 || existingTeacherPermissions.length > 0) {
    console.log(`发现现有权限数据：admin=${existingAdminPermissions.length}，teacher=${existingTeacherPermissions.length}，跳过初始化`);
    return;
  }
  
  console.log('未找到现有权限数据，开始初始化默认角色权限...');
  const roles = ['admin', 'teacher']; // 添加teacher角色
  const allApplications = db.application.getAll();
  console.log(`找到 ${allApplications.length} 个应用，准备设置权限`);
  
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
      
      console.log(`找到 ${existingPermissions.length} 个现有${role}权限记录`);
      
      db.rolePermission.deleteMany({
        where: {
          role: {
            equals: role
          }
        }
      });
      console.log(`已删除现有${role}角色权限`);
    } catch (e) {
      console.log(`删除${role}角色旧权限时出错或无权限可删除`, e);
    }
    
    // 为角色添加应用权限
    // 根据角色分配不同的应用权限
    let applicationsForRole = allApplications;
    
    // 如果是教师角色，只分配与教学相关的应用
    if (role === 'teacher') {
      // 排除管理员专用应用
      const adminOnlyAppIds = ['10', '11', '12', '13', '14']; // 教育管理、教师管理、学生管理、年级管理、班级管理
      applicationsForRole = allApplications.filter(app => !adminOnlyAppIds.includes(app.id));
    }
    
    // 添加权限
    applicationsForRole.forEach(app => {
      try {
        db.rolePermission.create({
          id: `${role}-${app.id}`,
          role: role,
          applicationId: app.id,
          granted: true,
          createdAt: new Date().toISOString()
        });
        console.log(`已为${role}角色添加应用权限: ${app.name}`);
      } catch (e) {
        console.log(`为${role}添加应用权限失败: ${app.name}`, e);
      }
    });
  });
  
  // 保存数据库状态
  saveDb();
  console.log('权限初始化完成，数据库状态已保存');
};

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