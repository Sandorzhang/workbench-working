/**
 * Type definitions for calendar
 */

/**
 * 日历事件
 */
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;          // 格式: YYYY-MM-DD
  startTime: string;     // 格式: HH:MM
  endTime: string;       // 格式: HH:MM
  location: string;
  type: string;          // 事件类型: 'meeting', 'class', 'event', 'other'
  description: string;
  participants: string[];
}

/**
 * 创建日历事件请求
 */
export type CreateCalendarEventRequest = Omit<CalendarEvent, 'id'>;

/**
 * 更新日历事件请求
 */
export type UpdateCalendarEventRequest = Partial<Omit<CalendarEvent, 'id'>>;

/**
 * 日历事件筛选条件
 */
export interface CalendarEventFilters {
  startDate?: string;    // 格式: YYYY-MM-DD
  endDate?: string;      // 格式: YYYY-MM-DD
  type?: string;         // 事件类型
}
