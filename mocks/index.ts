// import { server } from './node'
import { seedDb } from './db';
import { handlers } from './handlers/index';

// 初始化MSW数据库
seedDb();

// 浏览器
export const worker = {
  start: async (options = {}) => {
    if (typeof window === 'undefined') {
      return;
    }

    // 动态导入browser模块
    const { worker } = await import('./browser');
    
    // 启动worker
    await worker.start(options);
    
    return worker;
  },
};

// 服务器
export const server = async () => {
  if (typeof window !== 'undefined') {
    return;
  }

  // 动态导入node模块
  const { server } = await import('./node');
  
  // 启动服务器
  server.listen();
  
  return server;
}; 