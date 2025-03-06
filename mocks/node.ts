import { setupServer } from 'msw/node';
import { handlers } from './handlers/index';
import { seedDb } from './db';

// 初始化模拟数据
seedDb();

// 创建并导出server
export const server = setupServer(...handlers);

console.log(`MSW 服务器端配置完成，处理程序数量: ${handlers.length}`); 