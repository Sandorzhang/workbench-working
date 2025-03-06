/**
 * Client-side API methods for calendar
 */
import { buildApiPath, handleRequest, ApiResponse } from '@/shared/api/core';
import { CalendarEvent, CreateCalendarEventRequest, UpdateCalendarEventRequest, CalendarEventFilters } from '../types';
// Uncomment and adapt as needed:
// import { Type1, Type2 } from '../types';

// Feature name - used to create all API paths consistently
const FEATURE = 'calendar';

/**
 * 日历API客户端
 */
export const calendarApi = {
  /**
   * 获取所有日历事件
   * @param filters 可选的筛选条件
   */
  getEvents: async (filters?: CalendarEventFilters): Promise<ApiResponse<CalendarEvent[]>> => {
    let queryParams = '';
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.type) params.append('type', filters.type);
      
      queryParams = `?${params.toString()}`;
    }
    
    return handleRequest(buildApiPath(FEATURE, `/events${queryParams}`));
  },

  /**
   * 获取指定ID的日历事件
   * @param id 事件ID
   */
  getEventById: async (id: string): Promise<ApiResponse<CalendarEvent>> => {
    return handleRequest(buildApiPath(FEATURE, `/events/${id}`));
  },

  /**
   * 按类型获取日历事件
   * @param type 事件类型
   */
  getEventsByType: async (type: string): Promise<ApiResponse<CalendarEvent[]>> => {
    return handleRequest(buildApiPath(FEATURE, `/events/type/${type}`));
  },

  /**
   * 创建新的日历事件
   * @param event 事件数据
   */
  createEvent: async (event: CreateCalendarEventRequest): Promise<ApiResponse<CalendarEvent>> => {
    return handleRequest(
      buildApiPath(FEATURE, '/events'),
      {
        method: 'POST',
        body: JSON.stringify(event)
      }
    );
  },

  /**
   * 更新日历事件
   * @param id 事件ID
   * @param event 更新的事件数据
   */
  updateEvent: async (id: string, event: UpdateCalendarEventRequest): Promise<ApiResponse<CalendarEvent>> => {
    return handleRequest(
      buildApiPath(FEATURE, `/events/${id}`),
      {
        method: 'PUT',
        body: JSON.stringify(event)
      }
    );
  },

  /**
   * 删除日历事件
   * @param id 事件ID
   */
  deleteEvent: async (id: string): Promise<ApiResponse<void>> => {
    return handleRequest(
      buildApiPath(FEATURE, `/events/${id}`),
      { method: 'DELETE' }
    );
  },

  /**
   * 获取当前用户的日历事件
   */
  getMyEvents: async (filters?: CalendarEventFilters): Promise<ApiResponse<CalendarEvent[]>> => {
    let queryParams = '';
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.type) params.append('type', filters.type);
      
      queryParams = `?${params.toString()}`;
    }
    
    return handleRequest(buildApiPath(FEATURE, `/my-events${queryParams}`));
  },

  /**
   * 导出日历事件
   * @param format 导出格式 (ics, csv)
   * @param filters 可选的筛选条件
   */
  exportEvents: async (format: 'ics' | 'csv', filters?: CalendarEventFilters): Promise<ApiResponse<{ url: string }>> => {
    let queryParams = `format=${format}`;
    
    if (filters) {
      if (filters.startDate) queryParams += `&startDate=${filters.startDate}`;
      if (filters.endDate) queryParams += `&endDate=${filters.endDate}`;
      if (filters.type) queryParams += `&type=${filters.type}`;
    }
    
    return handleRequest(buildApiPath(FEATURE, `/export?${queryParams}`));
  }
};
