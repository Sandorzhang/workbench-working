// import { server } from './node'
import { seedDb, db } from './db';
import { handlers } from './handlers/index';

// 初始化MSW数据库
seedDb();

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