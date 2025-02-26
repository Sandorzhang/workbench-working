import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import { seedDb } from './db';

// 初始化模拟数据
seedDb();

// 创建并导出server
export const server = setupServer(...handlers); 