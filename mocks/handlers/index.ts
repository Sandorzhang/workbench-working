import { userHandlers } from './user';
import { authHandlers } from './auth';
// 导入其他处理器...

export const handlers = [
  ...userHandlers,
  ...authHandlers,
  // 其他处理器...
]; 