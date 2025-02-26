import { userHandlers } from './user';
import { authHandlers } from './auth';
import { imageHandlers } from './image';
// 导入其他处理器...

export const handlers = [
  ...userHandlers,
  ...authHandlers,
  ...imageHandlers,
  // 其他处理器...
]; 