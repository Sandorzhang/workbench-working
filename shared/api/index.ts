import { authApi } from '@/features/auth/api/client';
/**
 * 统一API导出
 * 从这里可以导入所有API客户端
 */

export * from './core';

// 导入并重新导出各个模块的API客户端
import { academicJourneyApi } from '@/features/academic-journey/api/client';
import { examManagementApi } from '@/features/exam-management/api/client';
import { mentorSystemApi } from '@/features/mentor-system/api/client';
import { competencyWheelApi } from '@/features/competency-wheel/api/client';
import { calendarApi } from '@/features/calendar/api/client';
import { superadminApi } from '@/features/superadmin/api/client';

// 导出统一的API对象
export const api = {
  academicJourney: academicJourneyApi,
  examManagement: examManagementApi,
  mentorSystem: mentorSystemApi,
  competencyWheel: competencyWheelApi,
  calendar: calendarApi,
  superadmin: superadminApi,
  // 随着新API的实现，在这里添加更多的API客户端
}; 

// 直接导出所有个别 API 客户端，以便可以单独导入
export { 
  academicJourneyApi,
  examManagementApi,
  mentorSystemApi,
  competencyWheelApi,
  calendarApi,
  superadminApi,  // 直接导出 superadminApi
  authApi 
}; 
