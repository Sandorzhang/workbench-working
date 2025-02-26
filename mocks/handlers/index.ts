import { userHandlers } from './user';
import { authHandlers } from './auth';
import { imageHandlers } from './image';
import { calendarHandlers } from './calendar';
// 导入其他处理器...

export const handlers = [
  ...userHandlers,
  ...authHandlers,
  ...imageHandlers,
  ...calendarHandlers,
  // 其他处理器...
]; 