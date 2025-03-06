'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { FilmStrip, TeachingMoment } from '@/mocks/handlers/classroom-timemachine';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { 
  Calendar, ChevronDown, ChevronUp, 
  Clock, Video, Music, FileText, Book, 
  Play, Calendar as CalendarIcon
} from 'lucide-react';

// 获取类型信息
const getTypeInfo = (type: string) => {
  switch(type) {
    case 'video':
      return { 
        icon: <Video className="h-3 w-3" />, 
        label: '视频',
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-600'
      };
    case 'audio':
      return { 
        icon: <Music className="h-3 w-3" />, 
        label: '音频',
        bgClass: 'bg-purple-50',
        textClass: 'text-purple-600'
      };
    case 'note':
      return { 
        icon: <FileText className="h-3 w-3" />, 
        label: '笔记',
        bgClass: 'bg-green-50',
        textClass: 'text-green-600'
      };
    case 'homework':
      return { 
        icon: <Book className="h-3 w-3" />, 
        label: '作业',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-600'
      };
    default:
      return { 
        icon: <Clock className="h-3 w-3" />, 
        label: '时刻',
        bgClass: 'bg-gray-50',
        textClass: 'text-gray-600'
      };
  }
};

// 获取学科背景渐变
const getSubjectGradient = (subject: string) => {
  switch(subject) {
    case '语文':
      return 'from-red-50 to-red-100/70';
    case '数学':
      return 'from-blue-50 to-blue-100/70';
    case '英语':
      return 'from-green-50 to-green-100/70';
    case '物理':
      return 'from-purple-50 to-purple-100/70';
    case '化学':
      return 'from-amber-50 to-amber-100/70';
    case '生物':
      return 'from-emerald-50 to-emerald-100/70';
    case '历史':
      return 'from-yellow-50 to-yellow-100/70';
    case '地理':
      return 'from-indigo-50 to-indigo-100/70';
    case '政治':
      return 'from-pink-50 to-pink-100/70';
    default:
      return 'from-gray-50 to-gray-100/70';
  }
};

// 生成时间线标记
const generateTimelineMarkers = (filmStrips: FilmStrip[]) => {
  // 收集所有时刻的日期
  const allDates = filmStrips.flatMap(strip => 
    strip.moments.map(moment => {
      const date = new Date(moment.date);
      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        fullDate: moment.date,
        moment
      };
    })
  );
  
  // 按日期排序
  allDates.sort((a, b) => 
    new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
  );
  
  // 按月分组
  const monthGroups: Record<string, TeachingMoment[]> = {};
  
  allDates.forEach(item => {
    const monthKey = `${item.year}-${item.month + 1}`;
    if (!monthGroups[monthKey]) {
      monthGroups[monthKey] = [];
    }
    monthGroups[monthKey].push(item.moment);
  });
  
  return {
    monthGroups,
    firstDate: allDates.length > 0 ? allDates[0].fullDate : '',
    lastDate: allDates.length > 0 ? allDates[allDates.length - 1].fullDate : '',
  };
};

// 将月份数字转为中文
const getMonthName = (month: number) => {
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return monthNames[month - 1];
};

interface VerticalTimelineProps {
  filmStrips: FilmStrip[];
  onMomentClick: (moment: TeachingMoment) => void;
  selectedMomentId?: string;
}

export default function VerticalTimeline({ filmStrips, onMomentClick, selectedMomentId }: VerticalTimelineProps) {
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [timelineHeight, setTimelineHeight] = useState(0);
  const [viewportPosition, setViewportPosition] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const { monthGroups, firstDate, lastDate } = useMemo(() => {
    return generateTimelineMarkers(filmStrips);
  }, [filmStrips]);

  // 选择第一个学期
  useEffect(() => {
    if (filmStrips.length > 0 && !selectedSemester) {
      setSelectedSemester(filmStrips[0].semester);
    }
  }, [filmStrips, selectedSemester]);
  
  // 根据窗口调整时间线高度
  useEffect(() => {
    const handleResize = () => {
      if (viewportRef.current) {
        setTimelineHeight(viewportRef.current.offsetHeight - 100); // 减去头部和底部的空间
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 处理滚动
  const handleScroll = (direction: 'up' | 'down') => {
    const scrollAmount = direction === 'up' ? -100 : 100;
    setViewportPosition(prev => {
      const newPosition = prev + scrollAmount;
      // 限制滚动范围
      if (newPosition < 0) return 0;
      if (timelineRef.current) {
        const maxScroll = timelineRef.current.scrollHeight - timelineHeight;
        if (newPosition > maxScroll) return maxScroll;
      }
      return newPosition;
    });
  };
  
  // 滚动效果
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = viewportPosition;
    }
  }, [viewportPosition]);
  
  const momentCount = useMemo(() => {
    return filmStrips.reduce((total, strip) => total + strip.moments.length, 0);
  }, [filmStrips]);
  
  if (filmStrips.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">暂无时间线数据</h3>
          <p className="mt-2 text-gray-500 text-sm">
            教学时间线将在这里显示
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div ref={viewportRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      {/* 时间线标题 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">教学时间线</h3>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{firstDate}</span>
          <span>-</span>
          <span>{lastDate}</span>
        </div>
      </div>
      
      {/* 学期选择器 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-2">
          {filmStrips.map((strip) => (
            <Button
              key={strip.semester}
              variant={selectedSemester === strip.semester ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSemester(strip.semester)}
              className={cn(
                "rounded-lg h-auto py-1.5 text-xs",
                selectedSemester === strip.semester 
                  ? "bg-primary text-white shadow-sm" 
                  : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
              )}
            >
              <span className="truncate">{strip.semester}</span>
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-1.5 text-xs h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center",
                  selectedSemester === strip.semester 
                    ? "bg-white/20 text-white" 
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {strip.moments.length}
              </Badge>
            </Button>
          ))}
        </div>
      </div>
      
      {/* 进度指示器 */}
      <div className="relative px-4 py-2 flex justify-between">
        <button 
          onClick={() => handleScroll('up')}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          title="向上滚动"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        
        <div className="h-1 flex-1 bg-gray-100 rounded-full mx-2 self-center">
          <div 
            className="h-1 bg-primary rounded-full" 
            style={{ 
              width: timelineRef.current ? `${(viewportPosition / Math.max(1, timelineRef.current.scrollHeight - timelineHeight)) * 100}%` : '0%' 
            }}
          />
        </div>
        
        <button 
          onClick={() => handleScroll('down')}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          title="向下滚动"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      
      {/* 主时间线区域 */}
      <ScrollArea 
        ref={timelineRef} 
        className="flex-1 overflow-hidden"
      >
        <div className="relative">
          {/* 时间线列表 */}
          <div className="relative px-4 py-3">
            {/* 时间线中线 */}
            <div className="absolute left-[23px] top-5 bottom-5 w-px bg-gray-200" />
            
            {/* 月份分组 */}
            {Object.entries(monthGroups).map(([monthKey, moments]) => {
              const [year, month] = monthKey.split('-').map(Number);
              return (
                <div key={monthKey} className="mb-6">
                  {/* 月份标题 */}
                  <div className="flex items-center mb-3">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-xs font-medium text-gray-700">
                      {getMonthName(month)} {year}
                    </span>
                  </div>
                  
                  {/* 时刻列表 */}
                  <div className="space-y-3">
                    {moments.map(moment => {
                      const isSelected = moment.id === selectedMomentId;
                      const date = new Date(moment.date);
                      const typeInfo = getTypeInfo(moment.type);
                      
                      return (
                        <div 
                          key={moment.id}
                          className={cn(
                            "flex items-start group",
                            isSelected ? "relative z-10" : ""
                          )}
                        >
                          {/* 日期指示 */}
                          <div className="flex flex-col items-center mr-3 w-[30px]">
                            <div className="text-[10px] text-gray-500">{date.getDate()}</div>
                            <div 
                              className={cn(
                                "h-4 w-4 rounded-full border-2 border-white mt-0.5 group-hover:scale-110 transition-transform",
                                isSelected 
                                  ? "bg-primary shadow-md" 
                                  : "bg-gray-200 group-hover:bg-gray-300"
                              )}
                            />
                          </div>
                          
                          {/* 卡片内容 */}
                          <Card 
                            className={cn(
                              "flex-1 p-2 cursor-pointer group-hover:shadow-md transition-all overflow-hidden",
                              isSelected 
                                ? "ring-2 ring-primary ring-offset-2 shadow-md" 
                                : "border-gray-100 hover:border-gray-200",
                              `bg-gradient-to-br ${getSubjectGradient(moment.subject)}`
                            )}
                            onClick={() => onMomentClick(moment)}
                          >
                            <div className="flex items-start space-x-2">
                              {moment.type === 'video' && (
                                <div className="relative h-12 w-16 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                                  {moment.thumbnail && (
                                    <img 
                                      src={moment.thumbnail} 
                                      alt={moment.title} 
                                      className="h-full w-full object-cover"
                                    />
                                  )}
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <div className="h-6 w-6 rounded-full bg-white/80 flex items-center justify-center">
                                      <Play className="h-3 w-3 text-gray-800 fill-gray-800 ml-0.5" />
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center mb-1">
                                  <Badge 
                                    variant="secondary"
                                    className={cn(
                                      "px-1.5 py-0 h-4 text-[10px] rounded font-normal",
                                      typeInfo.bgClass,
                                      typeInfo.textClass
                                    )}
                                  >
                                    <span className="flex items-center">
                                      {typeInfo.icon}
                                      <span className="ml-0.5">{typeInfo.label}</span>
                                    </span>
                                  </Badge>
                                </div>
                                <h4 className="text-xs font-medium text-gray-900 line-clamp-1">{moment.title}</h4>
                              </div>
                            </div>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
      
      {/* 底部状态 */}
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-center text-gray-500">
        共 {momentCount} 个教学时刻
      </div>
    </div>
  );
} 