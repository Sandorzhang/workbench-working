import { userHandlers } from './users';
import { authHandlers } from './auth';
import { imageHandlers } from './image';
import { calendarHandlers } from './calendar';
import { mentorHandlers } from './mentor';
import { aiAssistantHandlers } from './ai-assistant';
import { aiLibraryHandlers } from './ai-library';
// 导入其他处理器...

export const handlers = [
  ...userHandlers,
  ...authHandlers,
  ...imageHandlers,
  ...calendarHandlers,
  ...mentorHandlers,
  ...aiAssistantHandlers,
  ...aiLibraryHandlers,
  // 其他处理器...
]; 