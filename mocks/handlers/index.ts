import { http } from 'msw';

import { authHandlers } from './auth';
import { userHandlers } from './user';
import { calendarHandlers } from './calendar';
import { dataAssetsHandlers } from './data-assets';
// 导入其他处理器...

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...calendarHandlers,
  ...dataAssetsHandlers,
  // 其他处理器...
]; 