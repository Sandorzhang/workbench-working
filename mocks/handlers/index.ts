import { http } from 'msw';

import { authHandlers } from './auth';
import { userHandlers } from './user';
import { calendarHandlers } from './calendar';
import { dataAssetsHandlers } from './data-assets';
import { aiLibraryHandlers } from './ai-library';
import { mentorHandlers } from './mentor';
import { imageHandlers } from './image';
import { teachingPlanHandlers } from './teaching-plans';
import { agentHandlers } from './agents';
import { classroomTimemachineHandlers } from './classroom-timemachine';
import { educationHandlers } from './education';
import { academicStandardsHandlers } from './academic-standards';
import { aiAssistantHandlers } from './ai-assistant';
import { conceptMapHandlers } from './concept-map';
import { academicJourneyHandlers } from './academic-journey';
import { teachingDesignsHandlers } from './teaching-designs-alt';
import { examHandlers } from './exam';
import { questionHandlers } from './question';
import { notificationHandlers } from './notification';
// 导入其他处理器...

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...examHandlers,
  ...questionHandlers,
  ...calendarHandlers,
  ...dataAssetsHandlers,
  ...aiLibraryHandlers,
  ...mentorHandlers,
  ...imageHandlers,
  ...teachingPlanHandlers,
  ...agentHandlers,
  ...classroomTimemachineHandlers,
  ...educationHandlers,
  ...academicStandardsHandlers,
  ...aiAssistantHandlers,
  ...conceptMapHandlers,
  ...academicJourneyHandlers,
  ...teachingDesignsHandlers,
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