import { http, HttpResponse, delay } from 'msw';
import { v4 as uuidv4 } from 'uuid';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// Mock notification data
const mockNotifications: Notification[] = [
  {
    id: uuidv4(),
    title: '系统通知',
    message: '欢迎使用系统',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: '考试创建成功',
    message: '期中考试已成功创建',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: uuidv4(),
    title: '系统更新',
    message: '系统将于今晚进行维护更新',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: uuidv4(),
    title: '错误报告',
    message: '上传文件过程中发生错误',
    type: 'error',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export const notificationHandlers = [
  // Get all notifications
  http.get('*/api/notifications', async () => {
    await delay(300);
    
    console.log('[MSW] 处理请求: GET /api/notifications');
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: mockNotifications
    });
  }),
  
  // Get notification by ID
  http.get('*/api/notifications/:id', async ({ params }) => {
    await delay(200);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: GET /api/notifications/${id}`);
    
    const notification = mockNotifications.find(n => n.id === id);
    
    if (!notification) {
      return HttpResponse.json({
        code: 404,
        message: 'Notification not found',
        success: false,
        data: null
      }, { status: 404 });
    }
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: notification
    });
  }),
  
  // Get unread notifications count
  http.get('*/api/notifications/unread/count', async () => {
    await delay(200);
    
    console.log('[MSW] 处理请求: GET /api/notifications/unread/count');
    
    const count = mockNotifications.filter(n => !n.read).length;
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: { count }
    });
  }),
  
  // Mark notification as read
  http.patch('*/api/notifications/:id/read', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: PATCH /api/notifications/${id}/read`);
    
    const notificationIndex = mockNotifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      return HttpResponse.json({
        code: 404,
        message: 'Notification not found',
        success: false,
        data: null
      }, { status: 404 });
    }
    
    // In a real handler, we would update the database
    const updatedNotification = {
      ...mockNotifications[notificationIndex],
      read: true
    };
    
    return HttpResponse.json({
      code: 0,
      message: 'Notification marked as read',
      success: true,
      data: updatedNotification
    });
  }),
  
  // Mark all notifications as read
  http.patch('*/api/notifications/read-all', async () => {
    await delay(400);
    
    console.log('[MSW] 处理请求: PATCH /api/notifications/read-all');
    
    // In a real handler, we would update the database
    const updatedNotifications = mockNotifications.map(n => ({ ...n, read: true }));
    
    return HttpResponse.json({
      code: 0,
      message: 'All notifications marked as read',
      success: true,
      data: { count: updatedNotifications.length }
    });
  }),
  
  // Delete notification
  http.delete('*/api/notifications/:id', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    console.log(`[MSW] 处理请求: DELETE /api/notifications/${id}`);
    
    const notificationIndex = mockNotifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      return HttpResponse.json({
        code: 404,
        message: 'Notification not found',
        success: false,
        data: null
      }, { status: 404 });
    }
    
    // In a real handler, we would remove from the database
    // mockNotifications.splice(notificationIndex, 1);
    
    return HttpResponse.json({
      code: 0,
      message: 'Notification deleted successfully',
      success: true,
      data: null
    });
  }),
  
  // Create notification (for testing)
  http.post('*/api/notifications', async ({ request }) => {
    await delay(400);
    
    console.log('[MSW] 处理请求: POST /api/notifications');
    
    try {
      const body = await request.json() as Partial<Notification>;
      console.log('[MSW] 接收到的通知数据:', body);
      
      // Validate required fields
      if (!body.title || !body.message || !body.type) {
        return HttpResponse.json({
          code: 400,
          message: 'Missing required fields',
          success: false,
          data: null
        }, { status: 400 });
      }
      
      const newNotification: Notification = {
        id: uuidv4(),
        title: body.title,
        message: body.message,
        type: body.type,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // In a real handler, we would add this to the database
      // mockNotifications.push(newNotification);
      
      return HttpResponse.json({
        code: 0,
        message: 'Notification created successfully',
        success: true,
        data: newNotification
      }, { status: 201 });
    } catch (error) {
      console.error('[MSW] Error creating notification:', error);
      return HttpResponse.json({
        code: 500,
        message: 'Failed to create notification',
        success: false,
        data: null
      }, { status: 500 });
    }
  })
]; 