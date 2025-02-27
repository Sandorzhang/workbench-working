'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
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
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  TitleSkeleton, 
  CardSkeleton, 
  ContentSkeleton, 
  ListSkeleton 
} from "@/components/ui/skeleton-loader";

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
  'classroom-impression': { color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
};

export default function CalendarPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // 日历状态
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // 获取当前年月
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // 数据获取逻辑
  const fetchEvents = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await fetch('/api/calendar');
      if (!response.ok) {
        throw new Error('获取日历事件失败');
      }
      
      const data = await response.json();
      console.log('获取到的日历事件数据:', data);
      setEvents(data);
    } catch (err) {
      console.error('获取日历事件失败:', err);
      setError('获取日历事件失败，请稍后重试');
      toast.error('获取日历事件失败，请稍后重试');
    } finally {
      // 延迟设置加载完成，展示骨架屏效果
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };
  
  useEffect(() => {
    console.log('获取日历事件数据...');
    fetchEvents();
  }, [currentYear, currentMonth]);
  
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
  
  // 处理事件点击
  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === 'classroom-impression') {
      // 提取课堂记录ID（假设存储在description字段中）
      const recordId = event.description.split('recordId:')[1]?.trim();
      if (recordId) {
        router.push(`/classroom-timemachine?recordId=${recordId}`);
      } else {
        router.push('/classroom-timemachine');
      }
    }
  };
  
  return (
    <div className="pb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我的日历</h1>
        <Button variant="outline" onClick={() => toast.info('功能开发中')}>
          <Plus className="h-4 w-4 mr-2" />
          添加事件
        </Button>
      </div>
      
      {isLoading ? (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <TitleSkeleton />
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CardSkeleton className="lg:col-span-2 h-[500px]" />
            <div className="space-y-6">
              <ContentSkeleton className="h-24" />
              <ListSkeleton count={3} />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">
                {getMonthName(currentMonth)} {currentYear}
              </h2>
              <Badge variant="outline" className="text-sm font-normal">
                {events.length} 个事件
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousMonth}
                aria-label="上个月"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextMonth}
                aria-label="下个月"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={goToToday}
                size="sm"
              >
                今天
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
              {error}
              <Button
                variant="link"
                className="ml-2 text-red-600"
                onClick={() => fetchEvents()}
              >
                重试
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 min-w-0">
              <CardContent className="p-0 overflow-x-auto">
                <div className="grid grid-cols-7 text-center py-2 bg-muted/20 border-b">
                  {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                    <div key={index} className="py-2 text-sm font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-fr min-h-[500px]">
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
            
            <div className="space-y-6">
              {selectedDate ? (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">
                        {formatDate(selectedDate)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getEventsForDate(selectedDate).length > 0 ? (
                        <p className="text-muted-foreground">
                          {getEventsForDate(selectedDate).length} 个活动安排
                        </p>
                      ) : (
                        <p className="text-muted-foreground">今日无活动安排</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {getEventsForDate(selectedDate).length > 0 ? (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">活动详情</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {getEventsForDate(selectedDate).map((event) => (
                            <div
                              key={event.id}
                              className={cn(
                                "p-3 rounded-lg cursor-pointer transition-colors",
                                eventTypeConfig[event.type]?.bgColor || "bg-gray-100",
                                "hover:bg-opacity-80"
                              )}
                              onClick={() => handleEventClick(event)}
                            >
                              <h3 className="font-medium mb-2">{event.title}</h3>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  {event.startTime} - {event.endTime}
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  {event.location}
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <Users className="h-3.5 w-3.5 mr-1" />
                                  {event.participants.length} 人参与
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </>
              ) : (
                <Card>
                  <CardContent className="py-6 text-center text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>选择一个日期查看活动安排</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}