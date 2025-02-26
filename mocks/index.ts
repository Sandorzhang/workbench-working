// import { server } from './node'
import { seedDb } from './db';
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