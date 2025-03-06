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
  Users,
  Loader2
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
import { Skeleton } from "@/components/ui/skeleton";
import { HeroSection } from '@/components/ui/hero-section';
import { api } from '@/shared/api';
import { CalendarEvent } from "@/features/calendar/types";

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
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  
  // 日期状态
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // 页面状态
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  
  // 获取当前年月
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // 检查认证状态，如果未登录则显示提示
  useEffect(() => {
    if (!authLoading) {
      // 认证检查完成
      setAuthChecked(true);
      
      if (!isAuthenticated) {
        console.log('未登录状态，显示提示信息');
        setError('请登录后查看您的日历');
        setIsLoading(false);
        // 导航到登录页面
        toast.error('请先登录');
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      } else {
        console.log('用户已登录:', user?.name);
        setError(null);
      }
    }
  }, [authLoading, isAuthenticated, user, router]);
  
  // 当认证状态确认后且用户登录时，获取日历数据
  useEffect(() => {
    // 确保认证检查已完成且用户已登录
    if (authChecked && isAuthenticated && user) {
      console.log('开始获取日历数据, 用户:', user.name, '(', user.role, ')');
      fetchEvents();
    }
  }, [authChecked, isAuthenticated, user, currentYear, currentMonth]);
  
  // 手动刷新函数
  const refreshEvents = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    await fetchEvents();
    setIsRefreshing(false);
    setLastRefreshTime(new Date());
  };
  
  // 数据获取逻辑
  const fetchEvents = async (retryCount = 0) => {
    try {
      if (!isAuthenticated) {
        console.log('未认证状态，取消获取日历数据');
        setError('请登录后查看您的日历');
        setIsLoading(false);
        return;
      }
      
      setError(null);
      if (!initialLoadDone) {
        setIsLoading(true);
      }
      
      console.log(`正在获取 ${user?.name || '未知用户'} 的日历事件...`);
      
      // 使用新的API客户端获取日历事件
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await api.calendar.getEvents({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });
      
      if (response.success) {
        console.log(`获取到的日历事件数据:`, response.data);
        
        // 更新事件列表
        setEvents(response.data);
        
        // 如果当前有选中的日期，查看该日期是否有事件
        if (selectedDate) {
          const formattedDate = format(selectedDate, 'yyyy-MM-dd');
          const eventsForSelectedDate = response.data.filter(event => event.date === formattedDate);
          setSelectedDateEvents(eventsForSelectedDate);
        }
      } else {
        console.error('获取日历事件失败:', response.message);
        setError(response.message || '获取日历事件失败');
        setEvents([]);
      }
    } catch (error) {
      console.error('获取日历事件出错:', error);
      setError(error instanceof Error ? error.message : '获取日历事件时出现错误');
      setEvents([]);
    } finally {
      setIsLoading(false);
      setInitialLoadDone(true);
    }
  };
  
  // 日历导航
  const goToPreviousMonth = () => {
    setIsLoading(true);
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const goToNextMonth = () => {
    setIsLoading(true);
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const goToToday = () => {
    setIsLoading(true);
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
      // 提取课堂记录ID
      const recordId = event.description.split('recordId:')[1]?.trim();
      if (recordId) {
        console.log('跳转到课堂时光机，记录ID:', recordId);
        router.push(`/classroom-timemachine/${recordId}`);
      } else {
        console.warn('课堂记录ID未找到:', event);
        toast.error('无法访问课堂记录');
      }
    }
  };
  
  // 渲染加载状态
  if (isLoading && !initialLoadDone) {
    return (
      <div className="space-y-4 p-4">
        <TitleSkeleton />
        <CardSkeleton />
        <ContentSkeleton />
        <ListSkeleton />
      </div>
    );
  }
  
  // 渲染错误状态
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-50 text-red-500 p-6 rounded-lg shadow-md animate-fadeIn text-center">
          <p className="mb-4">{error}</p>
          <Button
            variant="default"
            onClick={() => router.push('/login')}
            className="bg-red-500 hover:bg-red-600"
          >
            前往登录
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* 添加 Hero 部分 */}
      <HeroSection
        title="我的日历"
        description="安排和管理您的教学课程与重要活动"
        icon={CalendarIcon}
        gradient="from-green-50 to-teal-50"
        className="mb-6"
        actions={
          <Button 
            className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium"
            onClick={() => toast.info("创建事件功能正在开发中")}
          >
            <Plus className="h-4 w-4 mr-2" />
            创建事件
          </Button>
        }
      />
      
      {/* 日历控制栏 */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold transition-all duration-300">
            {getMonthName(currentMonth)} {currentYear}
          </h2>
          <Badge variant="outline" className="text-sm font-normal animate-fadeIn">
            {events.length} 个事件
          </Badge>
          {isRefreshing && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {lastRefreshTime && (
            <span className="text-xs text-muted-foreground">
              上次更新: {format(lastRefreshTime, 'HH:mm:ss')}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            disabled={isRefreshing}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={goToToday}
            disabled={isRefreshing}
          >
            今天
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            disabled={isRefreshing}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={refreshEvents}
            disabled={isRefreshing}
          >
            <Loader2 className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>
      
      <div className="w-full overflow-x-auto">
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
    </div>
  );
}