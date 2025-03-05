import { http } from 'msw';

import { authHandlers } from './auth';
import { aiLibraryHandlers } from './ai-library';
import { conceptMapHandlers } from './concept-map';
import { academicJourneyHandlers } from './academic-journey';
import { examHandlers } from './exam';
import { questionsHandlers } from './question';
import { studentHandlers } from './student';
import { teacherHandlers } from './teacher';
import { testHandlers } from './test';
// 导入其他处理器...

export const handlers = [
  ...authHandlers,
  ...aiLibraryHandlers,
  ...conceptMapHandlers,
  ...academicJourneyHandlers,
  ...examHandlers,
  ...questionsHandlers,
  ...studentHandlers,
  ...teacherHandlers,
  ...testHandlers,
  // 其他处理器...
  
  // 处理默认头像
  http.get('*/avatars/default.png', () => {
    // 返回一个简单的透明图片数据
    return new Response(new Blob(), { 
      status: 200, 
      headers: {
        'Content-Type': 'image/png'
      }
    });
  }),
]; 