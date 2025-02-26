'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Plus, 
  Users,
  Loader2
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { MswInitializer } from '@/components/MswInitializer';

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

// 获取当前月份的天数
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// 获取当前月份的第一天是星期几
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// 获取月份名称
const getMonthName = (month: number) => {
  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];
  return monthNames[month];
};

// 事件类型对应的颜色和图标
const eventTypeConfig: Record<string, { color: string, bgColor: string }> = {
  'meeting': { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  'class': { color: 'text-green-600', bgColor: 'bg-green-100' },
  'exam': { color: 'text-red-600', bgColor: 'bg-red-100' },
  'activity': { color: 'text-purple-600', bgColor: 'bg-purple-100' },
  'holiday': { color: 'text-amber-600', bgColor: 'bg-amber-100' },
};

export default function CalendarPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  // 日历状态
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // 获取当前年月
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // 数据获取逻辑 - 移除认证检查
  useEffect(() => {
    console.log('获取日历事件数据...');
    
    // 使用模拟数据而不是进行API请求
    const mockEvents = [
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
        title: '期中考试',
        date: '2024-03-25',
        startTime: '09:00',
        endTime: '11:00',
        location: '考场1',
        type: 'exam',
        description: '高等数学期中考试',
        participants: ['一年级全体学生']
      },
      {
        id: '4',
        title: '校园文化节',
        date: '2024-03-28',
        startTime: '13:00',
        endTime: '17:00',
        location: '学校操场',
        type: 'activity',
        description: '年度校园文化节活动',
        participants: ['全校师生']
      },
      {
        id: '5',
        title: '清明节放假',
        date: '2024-04-05',
        startTime: '00:00',
        endTime: '23:59',
        location: '',
        type: 'holiday',
        description: '清明节假期',
        participants: []
      }
    ];
    
    // 直接设置模拟数据
    setEvents(mockEvents);
    setIsLoading(false);
    
  }, []);
  
  // 日历导航
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };
  
  // 获取当前月的日历数据
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  
  // 生成日历网格
  const calendarDays = [];
  
  // 添加上个月的剩余天数
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({
      day: prevMonthDays - firstDayOfMonth + i + 1,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth - 1, prevMonthDays - firstDayOfMonth + i + 1)
    });
  }
  
  // 添加当前月的天数
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(currentYear, currentMonth, i)
    });
  }
  
  // 添加下个月的天数以填充网格
  const remainingDays = 42 - calendarDays.length; // 6行7列 = 42个格子
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth + 1, i)
    });
  }
  
  // 检查日期是否是今天
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // 检查日期是否被选中
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };
  
  // 获取指定日期的事件
  const getEventsForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.date === formattedDate);
  };
  
  // 检查日期是否有事件
  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };
  
  // 处理日期点击
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };
  
  // 获取选中日期的事件
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  
  // 格式化日期显示
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };
  
  return (
    <>
      <SidebarProvider>
        <div className="grid lg:grid-cols-[280px_1fr]">
          <AppSidebar />
          <div className="flex flex-col">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/dashboard">
                        教育管理平台
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>我的日历</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <div className="max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">我的日历</h2>
                    <p className="mt-1 text-sm text-gray-500">管理您的课程、会议和学校活动</p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      今天
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="default" size="sm" className="ml-2">
                      <Plus className="h-4 w-4 mr-1" />
                      添加事件
                    </Button>
                  </div>
                </div>
                
                {/* 错误提示 */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 日历视图 */}
                  <div className="md:col-span-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">
                            {getMonthName(currentMonth)} {currentYear}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {events.length} 个事件
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* 星期标题 */}
                        <div className="grid grid-cols-7 mb-2">
                          {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                            <div 
                              key={index} 
                              className="text-center py-2 text-sm font-medium text-gray-500"
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                        
                        {/* 日历网格 */}
                        <div className="grid grid-cols-7 gap-1">
                          {calendarDays.map((day, index) => (
                            <div 
                              key={index}
                              onClick={() => handleDateClick(day.date)}
                              className={cn(
                                "h-24 p-1 border rounded-md relative cursor-pointer transition-colors",
                                day.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400",
                                isToday(day.date) && "border-primary",
                                isSelected(day.date) && "ring-2 ring-primary ring-offset-1",
                                !day.isCurrentMonth && "hover:bg-gray-100",
                                day.isCurrentMonth && "hover:bg-gray-50"
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <span className={cn(
                                  "text-sm font-medium",
                                  isToday(day.date) && "bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center"
                                )}>
                                  {day.day}
                                </span>
                                {hasEvents(day.date) && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                                    {getEventsForDate(day.date).length}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* 事件指示器 */}
                              <div className="mt-1 space-y-1 overflow-hidden max-h-16">
                                {getEventsForDate(day.date).slice(0, 2).map((event, eventIndex) => (
                                  <div 
                                    key={eventIndex}
                                    className={cn(
                                      "text-[10px] px-1 py-0.5 rounded truncate",
                                      eventTypeConfig[event.type]?.bgColor || "bg-gray-100",
                                      eventTypeConfig[event.type]?.color || "text-gray-600"
                                    )}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                {getEventsForDate(day.date).length > 2 && (
                                  <div className="text-[10px] text-gray-500 pl-1">
                                    +{getEventsForDate(day.date).length - 2} 更多
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* 事件列表 */}
                  <div className="md:col-span-1">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {selectedDate ? formatDate(selectedDate) : '今日事件'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : selectedDateEvents.length > 0 ? (
                          <div className="space-y-4">
                            {selectedDateEvents.map((event) => (
                              <div key={event.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium">{event.title}</h4>
                                    <div className="flex items-center mt-1 text-sm text-gray-500">
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span>{event.startTime} - {event.endTime}</span>
                                    </div>
                                    {event.location && (
                                      <div className="flex items-center mt-1 text-sm text-gray-500">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span>{event.location}</span>
                                      </div>
                                    )}
                                    {event.participants && event.participants.length > 0 && (
                                      <div className="flex items-center mt-1 text-sm text-gray-500">
                                        <Users className="h-3 w-3 mr-1" />
                                        <span>{event.participants.join(', ')}</span>
                                      </div>
                                    )}
                                  </div>
                                  <Badge className={cn(
                                    "ml-2",
                                    eventTypeConfig[event.type]?.bgColor || "bg-gray-100",
                                    eventTypeConfig[event.type]?.color || "text-gray-600"
                                  )}>
                                    {event.type === 'meeting' && '会议'}
                                    {event.type === 'class' && '课程'}
                                    {event.type === 'exam' && '考试'}
                                    {event.type === 'activity' && '活动'}
                                    {event.type === 'holiday' && '假期'}
                                    {!['meeting', 'class', 'exam', 'activity', 'holiday'].includes(event.type) && event.type}
                                  </Badge>
                                </div>
                                {event.description && (
                                  <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <CalendarIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">
                              {selectedDate ? '该日期没有安排事件' : '今天没有安排事件'}
                            </p>
                            <Button variant="outline" size="sm" className="mt-4">
                              <Plus className="h-4 w-4 mr-1" />
                              添加事件
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}