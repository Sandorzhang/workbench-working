import { http, HttpResponse, delay } from 'msw';

// 日历事件类型
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  description: string;
  participants: string[];
}

// 获取YYYY-MM-DD格式的日期字符串
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 模拟日历事件数据
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '教师会议',
    date: '2024-03-20',
    startTime: '09:00',
    endTime: '10:30',
    location: '会议室A',
    type: 'meeting',
    description: '讨论本学期教学计划',
    participants: ['张老师', '李老师', '王老师']
  },
  {
    id: '2',
    title: '高等数学课',
    date: '2024-03-20',
    startTime: '14:00',
    endTime: '15:30',
    location: '教室201',
    type: 'class',
    description: '微积分基础',
    participants: ['一年级数学班']
  },
  {
    id: '3',
    title: '英语口语练习',
    date: '2024-03-21',
    startTime: '10:00',
    endTime: '11:30',
    location: '语音室B',
    type: 'class',
    description: '日常会话练习',
    participants: ['二年级英语班']
  },
  {
    id: '4',
    title: '家长会',
    date: '2024-03-22',
    startTime: '18:30',
    endTime: '20:00',
    location: '多功能厅',
    type: 'meeting',
    description: '期中家长会',
    participants: ['全体家长', '班主任']
  },
  {
    id: '5',
    title: '校园运动会',
    date: '2024-03-25',
    startTime: '08:30',
    endTime: '16:30',
    location: '操场',
    type: 'event',
    description: '春季校园运动会',
    participants: ['全体师生']
  }
];

// Add some additional test events
for (let i = 0; i < 10; i++) {
  const today = new Date();
  const randomDay = new Date(today);
  randomDay.setDate(today.getDate() + i + 1);
  
  mockEvents.push({
    id: String(i + 6),
    title: `测试事件 ${i + 1}`,
    date: formatDate(randomDay),
    startTime: '09:00',
    endTime: '10:00',
    location: '测试地点',
    type: 'test',
    description: '自动生成的测试事件',
    participants: ['测试用户']
  });
}

export const calendarHandlers = [
  // Get all calendar events
  http.get('*/api/calendar/events', async ({ request }) => {
    await delay(400);
    
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    console.log(`[MSW] 处理请求: GET /api/calendar/events, 过滤条件: ${startDate} to ${endDate}`);
    
    let filteredEvents = [...mockEvents];
    
    // Filter by date range if provided
    if (startDate && endDate) {
      filteredEvents = filteredEvents.filter(event => 
        event.date >= startDate && event.date <= endDate
      );
    } else if (startDate) {
      filteredEvents = filteredEvents.filter(event => 
        event.date >= startDate
      );
    } else if (endDate) {
      filteredEvents = filteredEvents.filter(event => 
        event.date <= endDate
      );
    }
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: filteredEvents
    });
  }),
  
  // Get calendar event by ID
  http.get('*/api/calendar/events/:id', async ({ params }) => {
    await delay(200);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: GET /api/calendar/events/${id}`);
    
    const event = mockEvents.find(event => event.id === id);
    
    if (!event) {
      return HttpResponse.json({
        code: 404,
        message: 'Event not found',
        success: false,
        data: null
      }, { status: 404 });
    }
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: event
    });
  }),
  
  // Create calendar event
  http.post('*/api/calendar/events', async ({ request }) => {
    await delay(500);
    
    console.log('[MSW] 处理请求: POST /api/calendar/events');
    
    try {
      const body = await request.json() as Partial<CalendarEvent>;
      console.log('[MSW] 接收到的事件数据:', body);
      
      // Validate required fields
      if (!body.title || !body.date || !body.startTime || !body.endTime) {
        return HttpResponse.json({
          code: 400,
          message: 'Missing required fields',
          success: false,
          data: null
        }, { status: 400 });
      }
      
      const newEvent: CalendarEvent = {
        id: String(Date.now()),
        title: body.title,
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        location: body.location || '',
        type: body.type || 'other',
        description: body.description || '',
        participants: body.participants || []
      };
      
      // In a real handler, we would add this to the database
      // mockEvents.push(newEvent);
      
      return HttpResponse.json({
        code: 0,
        message: 'Event created successfully',
        success: true,
        data: newEvent
      }, { status: 201 });
    } catch (error) {
      console.error('[MSW] Error creating event:', error);
      return HttpResponse.json({
        code: 500,
        message: 'Failed to create event',
        success: false,
        data: null
      }, { status: 500 });
    }
  }),
  
  // Update calendar event
  http.put('*/api/calendar/events/:id', async ({ params, request }) => {
    await delay(300);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: PUT /api/calendar/events/${id}`);
    
    try {
      const body = await request.json() as Partial<CalendarEvent>;
      console.log('[MSW] 接收到的更新数据:', body);
      
      const eventIndex = mockEvents.findIndex(event => event.id === id);
      
      if (eventIndex === -1) {
        return HttpResponse.json({
          code: 404,
          message: 'Event not found',
          success: false,
          data: null
        }, { status: 404 });
      }
      
      // In a real handler, we would update the database
      const updatedEvent = {
        ...mockEvents[eventIndex],
        ...body
      };
      
      return HttpResponse.json({
        code: 0,
        message: 'Event updated successfully',
        success: true,
        data: updatedEvent
      });
    } catch (error) {
      console.error('[MSW] Error updating event:', error);
      return HttpResponse.json({
        code: 500,
        message: 'Failed to update event',
        success: false,
        data: null
      }, { status: 500 });
    }
  }),
  
  // Delete calendar event
  http.delete('*/api/calendar/events/:id', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: DELETE /api/calendar/events/${id}`);
    
    const eventIndex = mockEvents.findIndex(event => event.id === id);
    
    if (eventIndex === -1) {
      return HttpResponse.json({
        code: 404,
        message: 'Event not found',
        success: false,
        data: null
      }, { status: 404 });
    }
    
    // In a real handler, we would remove from the database
    // mockEvents.splice(eventIndex, 1);
    
    return HttpResponse.json({
      code: 0,
      message: 'Event deleted successfully',
      success: true,
      data: null
    });
  }),
  
  // Get events by type
  http.get('*/api/calendar/events/type/:type', async ({ params }) => {
    await delay(300);
    
    const { type } = params;
    console.log(`[MSW] 处理请求: GET /api/calendar/events/type/${type}`);
    
    const filteredEvents = mockEvents.filter(event => event.type === type);
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: filteredEvents
    });
  })
]; 