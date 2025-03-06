import { http, HttpResponse, delay } from 'msw'
import { v4 as uuidv4 } from 'uuid'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

// 通知数据存储
let notifications: Notification[] = [
  {
    id: uuidv4(),
    title: '系统通知',
    message: '欢迎使用考试管理系统',
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
  }
]

// 获取所有通知
export const getNotifications = http.get('/api/notifications', async () => {
  await delay()
  return HttpResponse.json(notifications, { status: 200 })
})

// 获取未读通知数量
export const getUnreadCount = http.get('/api/notifications/unread/count', async () => {
  await delay()
  const count = notifications.filter(n => !n.read).length
  return HttpResponse.json({ count }, { status: 200 })
})

// 标记通知为已读
export const markAsRead = http.patch('/api/notifications/:id/read', async ({ params }) => {
  await delay()
  
  const notificationId = params.id as string
  const notificationIndex = notifications.findIndex(n => n.id === notificationId)
  
  if (notificationIndex === -1) {
    return new HttpResponse(null, { status: 404 })
  }
  
  notifications[notificationIndex].read = true
  
  return HttpResponse.json(notifications[notificationIndex], { status: 200 })
})

// 标记所有通知为已读
export const markAllAsRead = http.patch('/api/notifications/read-all', async () => {
  await delay()
  
  notifications = notifications.map(n => ({ ...n, read: true }))
  
  return HttpResponse.json({ success: true }, { status: 200 })
})

// 删除通知
export const deleteNotification = http.delete('/api/notifications/:id', async ({ params }) => {
  await delay()
  
  const notificationId = params.id as string
  const notificationIndex = notifications.findIndex(n => n.id === notificationId)
  
  if (notificationIndex === -1) {
    return new HttpResponse(null, { status: 404 })
  }
  
  notifications.splice(notificationIndex, 1)
  
  return new HttpResponse(null, { status: 204 })
})

export const notificationHandlers = [
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
]