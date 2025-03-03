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
  'meeting': { color: 'text-blue-700', bgColor: 'bg-blue-50/80' },
  'class': { color: 'text-emerald-700', bgColor: 'bg-emerald-50/80' },
  'exam': { color: 'text-rose-700', bgColor: 'bg-rose-50/80' },
  'activity': { color: 'text-violet-700', bgColor: 'bg-violet-50/80' },
  'holiday': { color: 'text-amber-700', bgColor: 'bg-amber-50/80' },
  'classroom-impression': { color: 'text-indigo-700', bgColor: 'bg-indigo-50/80' },
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
  const fetchEvents = async (retryCount = 0) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // 准备请求头和查询参数
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // 如果有token，添加授权头
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('获取日历事件: 未提供认证token');
      }
      
      // 构建查询参数
      const queryParams = new URLSearchParams();
      queryParams.append('year', currentYear.toString());
      queryParams.append('month', (currentMonth + 1).toString());
      
      // 发起请求
      const response = await fetch(`/api/calendar-events?${queryParams.toString()}`, { 
        headers,
        cache: 'no-store'
      });
      
      if (!response.ok) {
        // 处理401未授权错误
        if (response.status === 401) {
          console.error('获取日历事件: 认证失败');
          toast.error('登录已过期，请重新登录');
          // 这里可以添加重定向到登录页面的逻辑
          setEvents([]);
          setError('请登录后查看日历');
          setIsLoading(false);
          return;
        }
        
        // 其他错误重试
        if (retryCount < 2) { // 最多重试2次
          console.log(`获取日历事件失败，正在重试(${retryCount + 1}/2)...`);
          // 短暂延迟后重试
          setTimeout(() => fetchEvents(retryCount + 1), 1000);
          return;
        }
        
        throw new Error(`获取日历事件失败: ${response.status}`);
      }
      
      // 处理响应数据
      const data = await response.json();
      console.log(`获取到的日历事件数据 (${currentYear}年${currentMonth + 1}月):`, data);
      
      // 确保数据是数组，否则使用空数组
      if (Array.isArray(data)) {
        setEvents(data);
        
        // 如果当前有选中的日期，查看该日期是否有事件
        if (selectedDate) {
          const formattedDate = format(selectedDate, 'yyyy-MM-dd');
          const eventsForSelectedDate = data.filter(event => event.date === formattedDate);
          if (eventsForSelectedDate.length === 0) {
            // 日期没有事件时也给予反馈
            console.log(`选中的日期 ${formattedDate} 没有事件`);
          }
        }
        
      } else {
        console.warn('API返回的数据不是数组:', data);
        setEvents([]);
        toast.warning('日历数据格式不正确');
      }
    } catch (err) {
      console.error('获取日历事件失败:', err);
      setError('获取日历事件失败，请稍后重试');
      toast.error('获取日历事件失败，请稍后重试');
      setEvents([]); // 确保在错误时清空事件
    } finally {
      // 延迟设置加载完成，展示骨架屏效果
      setTimeout(() => {
        setIsLoading(false);
      }, 800); // 缩短加载时间，提升用户体验
    }
  };
  
  useEffect(() => {
    console.log(`获取 ${currentYear}年${currentMonth + 1}月 的日历事件数据...`);
    fetchEvents();
  }, [currentYear, currentMonth, token]); // 添加token到依赖数组，确保token变化时重新获取数据
  
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
            <div className="w-24 h-10 bg-gray-100 rounded-md animate-pulse"></div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-32 h-8 bg-gray-100 rounded-md animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-100 rounded-md animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-md animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-100 rounded-md animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-100 rounded-md animate-pulse"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CardSkeleton className="lg:col-span-2 h-[550px]" />
            <div className="space-y-6">
              <ContentSkeleton className="h-28" />
              <ListSkeleton count={3} className="gap-4" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold transition-all duration-300">
                {getMonthName(currentMonth)} {currentYear}
              </h2>
              <Badge variant="outline" className="text-sm font-normal animate-fadeIn">
                {events.length} 个事件
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousMonth}
                aria-label="上个月"
                className="transition-transform duration-200 hover:-translate-x-0.5"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextMonth}
                aria-label="下个月"
                className="transition-transform duration-200 hover:translate-x-0.5"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={goToToday}
                size="sm"
                className="transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
              >
                今天
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 animate-fadeIn">
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
                <div className="grid grid-cols-7 text-center py-3 bg-muted/10 border-b">
                  {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                    <div key={index} className="py-1.5 text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-fr min-h-[520px]">
                  {calendarDays.map((day, index) => (
                    <div 
                      key={index}
                      onClick={() => handleDateClick(day.date)}
                      className={cn(
                        "min-h-[90px] md:min-h-[100px] lg:min-h-[110px] p-2 border relative cursor-pointer transition-all duration-200",
                        day.isCurrentMonth 
                          ? "bg-white hover:bg-gray-50/80" 
                          : "bg-gray-50/30 text-gray-400 hover:bg-gray-100/50",
                        isToday(day.date) && "bg-primary/5",
                        isSelected(day.date) && isToday(day.date) && "ring-1 ring-primary/30 ring-inset",
                        isSelected(day.date) && !isToday(day.date) && "ring-1 ring-primary/40 ring-inset bg-primary/5"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className={cn(
                          "flex items-center justify-center w-7 h-7 transition-all",
                          isToday(day.date) && "bg-primary text-primary-foreground rounded-full",
                          isSelected(day.date) && !isToday(day.date) && "font-medium text-primary"
                        )}>
                          <span className="text-sm">{day.day}</span>
                        </div>
                        {hasEvents(day.date) && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 font-medium bg-background/80">
                            {getEventsForDate(day.date).length}
                          </Badge>
                        )}
                      </div>
                      
                      {/* 事件指示器 */}
                      <div className="space-y-1.5 overflow-hidden max-h-[70px]">
                        {getEventsForDate(day.date).slice(0, 2).map((event, eventIndex) => (
                          <div 
                            key={eventIndex}
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-sm truncate shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
                              eventTypeConfig[event.type]?.bgColor || "bg-gray-100/80",
                              eventTypeConfig[event.type]?.color || "text-gray-600",
                              "transition-all duration-150 hover:translate-x-0.5"
                            )}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {getEventsForDate(day.date).length > 2 && (
                          <div className="text-[10px] text-muted-foreground pl-1 font-medium">
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
                                "p-4 rounded-lg cursor-pointer transition-all duration-200",
                                eventTypeConfig[event.type]?.bgColor || "bg-gray-100/80",
                                "hover:translate-y-[-1px] hover:shadow-md"
                              )}
                              onClick={() => handleEventClick(event)}
                            >
                              <h3 className="font-medium mb-3 flex justify-between items-center">
                                <span>{event.title}</span>
                                <Badge variant="outline" className="text-xs font-normal">
                                  {event.type === 'meeting' && '会议'}
                                  {event.type === 'class' && '课程'}
                                  {event.type === 'exam' && '考试'}
                                  {event.type === 'activity' && '活动'}
                                  {event.type === 'holiday' && '假期'}
                                  {event.type === 'classroom-impression' && '课堂印象'}
                                </Badge>
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                                  {event.startTime} - {event.endTime}
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 mr-1.5" />
                                  {event.location || "未指定地点"}
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <Users className="h-3.5 w-3.5 mr-1.5" />
                                  {event.participants.length > 0 ? `${event.participants.length} 人参与` : "无参与者"}
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