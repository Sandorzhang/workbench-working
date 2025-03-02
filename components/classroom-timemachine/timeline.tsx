import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, FileText, Mic, Video, BookOpen, Calendar, Clock, Maximize, Minimize, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FilmStrip, TeachingMoment } from '@/mocks/handlers/classroom-timemachine';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X as DialogClose } from 'lucide-react';

// 获取类型信息
const getTypeInfo = (type: string) => {
  switch (type) {
    case 'note':
      return {
        icon: <FileText className="h-4 w-4" />,
        className: 'bg-amber-500',
        label: '笔记'
      };
    case 'audio':
      return {
        icon: <Mic className="h-4 w-4" />,
        className: 'bg-blue-500',
        label: '音频'
      };
    case 'video':
      return {
        icon: <Video className="h-4 w-4" />,
        className: 'bg-rose-500',
        label: '视频'
      };
    case 'homework':
      return {
        icon: <BookOpen className="h-4 w-4" />,
        className: 'bg-green-500',
        label: '作业'
      };
    default:
      return {
        icon: <FileText className="h-4 w-4" />,
        className: 'bg-purple-500',
        label: '其他'
      };
  }
};

// 获取学科颜色
const getSubjectColor = (subject: string) => {
  const colors: Record<string, string> = {
    '语文': 'text-red-500',
    '数学': 'text-purple-500',
    '英语': 'text-blue-500',
    '物理': 'text-sky-500',
    '化学': 'text-green-500',
    '生物': 'text-emerald-500',
    '历史': 'text-amber-500',
    '地理': 'text-rose-500',
    '政治': 'text-indigo-500',
  };
  return colors[subject] || 'text-gray-500';
};

// 学科颜色映射（用于背景和边框）
const subjectColors: Record<string, string> = {
  '语文': 'text-red-500 border-red-200 bg-red-50',
  '数学': 'text-purple-500 border-purple-200 bg-purple-50',
  '英语': 'text-blue-500 border-blue-200 bg-blue-50',
  '物理': 'text-sky-500 border-sky-200 bg-sky-50',
  '化学': 'text-green-500 border-green-200 bg-green-50',
  '生物': 'text-emerald-500 border-emerald-200 bg-emerald-50',
  '历史': 'text-amber-500 border-amber-200 bg-amber-50',
  '地理': 'text-rose-500 border-rose-200 bg-rose-50',
  '政治': 'text-indigo-500 border-indigo-200 bg-indigo-50',
};

// 获取学科渐变色
const getSubjectGradient = (subject: string) => {
  const gradients: Record<string, string> = {
    '语文': 'from-red-500/20 to-transparent',
    '数学': 'from-purple-500/20 to-transparent',
    '英语': 'from-blue-500/20 to-transparent',
    '物理': 'from-sky-500/20 to-transparent',
    '化学': 'from-green-500/20 to-transparent',
    '生物': 'from-emerald-500/20 to-transparent',
    '历史': 'from-amber-500/20 to-transparent',
    '地理': 'from-rose-500/20 to-transparent',
    '政治': 'from-indigo-500/20 to-transparent',
  };
  return gradients[subject] || 'from-gray-500/20 to-transparent';
};

// 生成时间段标记
const generateTimelineMarkers = (filmStrips: FilmStrip[]) => {
  // 提取所有时间点并排序
  const allDates = filmStrips.flatMap(strip => {
    return strip.moments.map(moment => ({
      date: moment.date,
      semester: strip.semester
    }));
  }).sort((a, b) => {
    // 假设日期格式为 YYYY-MM-DD
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // 生成主要时间节点（按月份分组）
  const monthlyMarkers: Record<string, string> = {};
  allDates.forEach(item => {
    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!monthlyMarkers[monthKey]) {
      monthlyMarkers[monthKey] = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    }
  });

  return Object.values(monthlyMarkers);
};

interface TimelineProps {
  filmStrips: FilmStrip[];
  onMomentClick?: (moment: TeachingMoment) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ 
  filmStrips,
  onMomentClick
}) => {
  const [selectedSemester, setSelectedSemester] = useState<string | null>(
    filmStrips.length > 0 ? filmStrips[0].semester : null
  );
  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null);
  const [expandedMoment, setExpandedMoment] = useState<TeachingMoment | null>(null);
  const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('compact');
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineWidth, setTimelineWidth] = useState(2000);
  const [containerWidth, setContainerWidth] = useState(0);
  const [viewportPosition, setViewportPosition] = useState(0); // 0-100 表示滚动视口在时间线上的位置
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // 提取总时间范围
  const timeRange = useMemo(() => {
    if (filmStrips.length === 0) return { start: '', end: '' };
    
    const startDate = filmStrips[0].startDate;
    const endDate = filmStrips[filmStrips.length - 1].endDate;
    
    return { start: startDate, end: endDate };
  }, [filmStrips]);

  // 生成时间标记
  const timeMarkers = useMemo(() => {
    return generateTimelineMarkers(filmStrips);
  }, [filmStrips]);
  
  // 响应式调整宽度
  useEffect(() => {
    const updateWidth = () => {
      if (timelineRef.current) {
        const parentWidth = timelineRef.current.parentElement?.offsetWidth || 800;
        setContainerWidth(parentWidth);
        
        // 确保每个学期有足够的空间，最小宽度为容器的3倍
        const minWidth = parentWidth * 3;
        const calculatedWidth = filmStrips.length * 800;
        const finalWidth = Math.max(minWidth, calculatedWidth);
        setTimelineWidth(finalWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [filmStrips.length]);

  // 监听滚动位置更新
  useEffect(() => {
    const handleScroll = () => {
      if (timelineRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = timelineRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const position = maxScroll ? (scrollLeft / maxScroll) * 100 : 0;
        setViewportPosition(position);
      }
    };

    const timeline = timelineRef.current;
    timeline?.addEventListener('scroll', handleScroll);
    
    return () => {
      timeline?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 将所有教学时刻展平为一个数组，方便访问
  const allMoments = useMemo(() => {
    return filmStrips.flatMap(strip => strip.moments);
  }, [filmStrips]);

  // 处理选择学期
  const handleSelectSemester = (semester: string) => {
    setSelectedSemester(semester);
    // 滚动到对应的学期区域
    const stripIndex = filmStrips.findIndex(strip => strip.semester === semester);
    if (stripIndex !== -1 && timelineRef.current) {
      const scrollPosition = (stripIndex / filmStrips.length) * timelineWidth;
      timelineRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  };

  // 向左滚动
  const scrollLeft = () => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  // 向右滚动
  const scrollRight = () => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // 处理时刻点击
  const handleMomentClick = (moment: TeachingMoment) => {
    setSelectedMomentId(selectedMomentId === moment.id ? null : moment.id);
    if (onMomentClick) {
      onMomentClick(moment);
    }
  };

  // 处理节点点击
  const handleNodeClick = (moment: TeachingMoment, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    handleMomentClick(moment);
  };

  // 切换视图模式
  const toggleViewMode = () => {
    setViewMode(viewMode === 'compact' ? 'expanded' : 'compact');
  };

  // 打开详情对话框
  const openDetailDialog = (moment: TeachingMoment) => {
    setExpandedMoment(moment);
    setIsDialogOpen(true);
  };

  // 紧凑视图的胶片帧
  const renderCompactFilmFrame = (moment: TeachingMoment, position: number) => {
    const isSelected = selectedMomentId === moment.id;
    const typeInfo = getTypeInfo(moment.type);
    const subjectColor = getSubjectColor(moment.subject);
    const subjectGradient = getSubjectGradient(moment.subject);

    return (
      <div 
        key={moment.id} 
        className="relative group"
        style={{ 
          position: 'absolute',
          left: `${position}%`,
          width: '200px',
          marginLeft: '-100px', // 居中
          zIndex: isSelected ? 30 : 10 // 选中的时刻提高层级，避免被其他元素遮挡
        }}
        onClick={() => handleMomentClick(moment)}
      >
        {/* 日期标签 - 在时间线上方 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[calc(60px-30px)] z-20">
          <div className={cn(
            "px-3 py-1 text-sm font-medium rounded-md whitespace-nowrap",
            isSelected ? "bg-primary text-white" : "bg-background border border-border text-foreground"
          )}>
            <div className="flex items-center">
              <Calendar className="mr-1.5 h-4 w-4" />
              {moment.date}
            </div>
          </div>
        </div>
        
        {/* 连接线 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[calc(60px-25px+20px)] h-[75px] w-0.5 z-20">
          <div className={cn(
            "w-full h-full",
            isSelected 
              ? "bg-primary" 
              : `bg-gradient-to-b ${subjectGradient.replace('from-', '').replace('/20', '')}`
          )}></div>
        </div>
        
        {/* 时间线上的锚点 */}
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 top-[60px] mt-[-4px] z-30"
          onClick={(e) => handleNodeClick(moment, e)}
        >
          <div 
            className={cn(
              "flex items-center justify-center rounded-full cursor-pointer transition-all",
              isSelected 
                ? "w-5 h-5 border-2 border-primary bg-white shadow-sm" 
                : "w-4 h-4 border border-gray-400 bg-white hover:border-primary"
            )}
          >
            {isSelected && (
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            )}
          </div>
        </div>
        
        {/* 卡片内容 - 在时间线下方 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[calc(60px+38px)] z-20">
          <motion.div 
            className={cn(
              "w-56 rounded-lg overflow-hidden border shadow-sm bg-card transition-colors",
              isSelected ? "border-primary" : "border-border hover:border-primary/50"
            )}
            whileHover={{ y: -2, scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="relative h-32 w-full overflow-hidden">
              <img 
                src={moment.thumbnail || '/placeholder.jpg'} 
                alt={moment.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                <div className="absolute bottom-3 left-3 right-3 overflow-hidden">
                  <div className="flex items-center gap-2 mb-2 w-full">
                    <Badge className={cn("py-1 px-2.5 text-xs flex-shrink-0", typeInfo.className)}>
                      <span className="flex items-center w-full overflow-hidden">
                        {typeInfo.icon}
                        <span className="ml-1 truncate">{typeInfo.label}</span>
                      </span>
                    </Badge>
                    <Badge variant="outline" className="py-1 px-2 text-xs bg-black/30 text-white border-0">
                      {moment.subject}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium text-white line-clamp-1">{moment.title}</h3>
                </div>
              </div>
              
              {/* 播放按钮 */}
              {(moment.type === 'video' || moment.type === 'audio') && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="w-9 h-9 rounded-full bg-black/50 hover:bg-primary border-none">
                    <Play className="h-4 w-4 text-white" />
                  </Button>
                </div>
              )}
              
              {/* 放大按钮 */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="w-7 h-7 rounded-full bg-black/50 hover:bg-primary border-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetailDialog(moment);
                  }}
                >
                  <Maximize className="h-3.5 w-3.5 text-white" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  // 扩展视图的胶片帧
  const renderExpandedFilmFrame = (moment: TeachingMoment, position: number) => {
    const isSelected = selectedMomentId === moment.id;
    const typeInfo = getTypeInfo(moment.type);
    const subjectColor = getSubjectColor(moment.subject);
    const subjectGradient = getSubjectGradient(moment.subject);

    return (
      <div 
        key={moment.id} 
        className="relative group"
        style={{ 
          position: 'absolute',
          left: `${position}%`,
          width: '250px',
          marginLeft: '-125px', // 居中
          zIndex: isSelected ? 30 : 10
        }}
        onClick={() => handleMomentClick(moment)}
      >
        {/* 日期标签 - 在时间线上方 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[calc(60px-35px)] z-20">
          <div className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap shadow-sm",
            isSelected ? "bg-primary text-white" : "bg-background border border-border text-foreground"
          )}>
            <div className="flex items-center">
              <Calendar className="mr-1.5 h-4 w-4" />
              {moment.date}
            </div>
          </div>
        </div>
        
        {/* 连接线 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[calc(60px-25px+20px)] h-[85px] w-1 z-20">
          <div className={cn(
            "w-full h-full",
            isSelected 
              ? "bg-primary" 
              : `bg-gradient-to-b ${subjectGradient.replace('from-', '').replace('/20', '')}`
          )}></div>
        </div>
        
        {/* 时间线上的锚点 */}
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 top-[60px] mt-[-5px] z-30"
          onClick={(e) => handleNodeClick(moment, e)}
        >
          <div 
            className={cn(
              "flex items-center justify-center rounded-full cursor-pointer transition-all",
              isSelected 
                ? "w-6 h-6 border-3 border-primary bg-white shadow-md" 
                : "w-5 h-5 border-2 border-gray-400 bg-white hover:border-primary"
            )}
          >
            {isSelected && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
            )}
          </div>
        </div>
        
        {/* 卡片内容 - 在时间线下方 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[calc(60px+45px)] z-20">
          <motion.div 
            className={cn(
              "w-64 rounded-xl overflow-hidden border shadow-md bg-card transition-colors",
              isSelected ? "border-primary" : "border-border hover:border-primary/50"
            )}
            whileHover={{ y: -3, scale: 1.03, transition: { duration: 0.2 } }}
          >
            <div className="relative h-40 w-full overflow-hidden">
              <img 
                src={moment.thumbnail || '/placeholder.jpg'} 
                alt={moment.title} 
                className="w-full h-full object-cover"
              />
              {/* 视频播放容器 */}
              {moment.type === 'video' && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button 
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-full py-2 px-4 shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetailDialog(moment);
                    }}
                  >
                    <Play className="h-4 w-4" />
                    播放视频
                  </Button>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                <div className="absolute bottom-3 left-3 right-3 overflow-hidden">
                  <div className="flex items-center gap-2 mb-2 w-full">
                    <Badge className={cn("py-1.5 px-3 text-sm flex-shrink-0", typeInfo.className)}>
                      <span className="flex items-center w-full overflow-hidden">
                        {typeInfo.icon}
                        <span className="ml-1.5 truncate">{typeInfo.label}</span>
                      </span>
                    </Badge>
                    <Badge variant="outline" className="py-1.5 px-2.5 text-xs bg-black/30 text-white border-0">
                      {moment.subject}
                    </Badge>
                  </div>
                  <h3 className="text-base font-medium text-white line-clamp-1">{moment.title}</h3>
                </div>
              </div>
            </div>
            
            <div className="p-3">
              <p className="text-xs text-gray-600 line-clamp-2">{moment.description}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {moment.duration}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetailDialog(moment);
                  }}
                >
                  查看详情
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  if (filmStrips.length === 0) {
    return (
      <div className="w-full h-[300px] rounded-lg border border-border bg-card flex items-center justify-center">
        <div className="text-center p-6">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">暂无时间线数据</h3>
          <p className="mt-1 text-sm text-gray-500">
            您的教学时间线将在这里显示
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full rounded-lg border border-border bg-card overflow-hidden">
        {/* 时间导航标题和时间范围指示 */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              教学时间导航
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm font-normal">
                {timeRange.start} 至 {timeRange.end}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={toggleViewMode}
              >
                {viewMode === 'compact' ? (
                  <Maximize className="h-4 w-4" />
                ) : (
                  <Minimize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* 学期选择器 */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-2">
              {filmStrips.map((strip) => (
                <Button
                  key={strip.semester}
                  variant={selectedSemester === strip.semester ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSelectSemester(strip.semester)}
                  className="min-w-max"
                >
                  {strip.semester}
                  <Badge variant="secondary" className="ml-2 bg-background text-foreground">
                    {strip.moments.length}
                  </Badge>
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        
        {/* 主时间线区域 */}
        <div className="relative p-4 pt-2 pb-6">
          {/* 时间进度指示器 */}
          <div className="mb-3 relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-primary rounded-full"
              style={{ width: `${viewportPosition}%` }}
            ></div>
            <div 
              className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent to-primary/50 rounded-full"
              style={{ left: `calc(${viewportPosition}% - 32px)` }}
            ></div>
            
            {/* 月份标记 */}
            {timeMarkers.map((marker, index) => (
              <div
                key={marker}
                className="absolute -top-6 transform -translate-x-1/2"
                style={{ 
                  left: `${(index / (timeMarkers.length - 1)) * 100}%`,
                }}
              >
                <div className="text-xs font-medium text-muted-foreground">{marker}</div>
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 h-3 w-px bg-muted-foreground"></div>
              </div>
            ))}
          </div>
          
          {/* 时间线操作区 */}
          <div className="flex justify-between items-center mb-1">
            <Badge variant="outline" className="bg-muted/50 text-sm font-normal">
              {selectedSemester ? `当前: ${selectedSemester}` : '滑动或点击学期按钮导航'}
            </Badge>
            
            <div className="flex items-center space-x-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={scrollLeft}
                className="h-7 w-7 p-0 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={scrollRight}
                className="h-7 w-7 p-0 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 滚动区域 */}
          <div className="relative overflow-hidden border border-muted rounded-md">
            <ScrollArea 
              ref={timelineRef} 
              className={cn(
                "w-full overflow-x-auto overflow-y-hidden",
                viewMode === 'compact' ? "h-[350px]" : "h-[480px]"
              )}
            >
              <div 
                className="relative" 
                style={{ 
                  width: `${timelineWidth}px`, 
                  height: viewMode === 'compact' ? '350px' : '480px' 
                }}
              >
                {/* 时间线背景 */}
                <div className="absolute left-0 right-0 top-[60px] h-1.5 bg-muted z-10">
                  {/* 刻度线 */}
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "absolute h-2.5 w-px", 
                        i % 5 === 0 ? "bg-muted-foreground" : "bg-border"
                      )} 
                      style={{ left: `${i}%`, top: '-0.5px' }}
                    />
                  ))}
                </div>
                
                {/* 学期区域标识 */}
                {filmStrips.map((strip, index) => {
                  const startPos = (index / filmStrips.length) * 100;
                  const endPos = ((index + 1) / filmStrips.length) * 100;
                  const width = endPos - startPos;
                  
                  return (
                    <div 
                      key={strip.semester}
                      className={cn(
                        "absolute h-12 z-5 border-l border-r border-border",
                        selectedSemester === strip.semester 
                          ? "bg-primary/5" 
                          : index % 2 === 0 ? "bg-muted/40" : "bg-muted/20"
                      )}
                      style={{ 
                        left: `${startPos}%`, 
                        width: `${width}%`,
                        top: '40px'
                      }}
                    />
                  );
                })}
                
                {/* 学期标签 */}
                {filmStrips.map((strip, index) => (
                  <div 
                    key={strip.semester}
                    id={`semester-${strip.semester}`}
                    className="absolute text-sm font-medium z-20"
                    style={{ 
                      left: `${(index / filmStrips.length) * 100}%`, 
                      top: '10px',
                      transform: 'translateX(10px)'
                    }}
                  >
                    <div className={cn(
                      "text-xs font-semibold",
                      selectedSemester === strip.semester 
                        ? "text-primary" 
                        : "text-muted-foreground"
                    )}>
                      {strip.semester}
                    </div>
                  </div>
                ))}
                
                {/* 渲染所有时刻 */}
                {filmStrips.map((strip, stripIndex) => {
                  const stripStart = (stripIndex / filmStrips.length) * 100;
                  const stripWidth = 100 / filmStrips.length;
                  
                  return strip.moments.map((moment, momentIndex) => {
                    // 计算每个时刻在当前学期区域内的相对位置
                    const momentPosition = stripStart + 
                      ((momentIndex + 1) / (strip.moments.length + 1)) * stripWidth;
                    
                    return viewMode === 'compact' 
                      ? renderCompactFilmFrame(moment, momentPosition)
                      : renderExpandedFilmFrame(moment, momentPosition);
                  });
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* 详情弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="absolute top-2 right-2 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setIsDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          {expandedMoment && (
            <div className="w-full">
              {/* 视频内容 */}
              {expandedMoment.type === 'video' && (
                <div className="aspect-video bg-black flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <img 
                      src={expandedMoment.thumbnail || '/placeholder.jpg'} 
                      alt={expandedMoment.title} 
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button 
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-full py-3 px-6 shadow-lg"
                      >
                        <Play className="h-5 w-5" />
                        播放视频
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 详情内容 */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      "py-1.5 px-3 text-sm", 
                      getTypeInfo(expandedMoment.type).className
                    )}>
                      <span className="flex items-center">
                        {getTypeInfo(expandedMoment.type).icon}
                        <span className="ml-1.5">{getTypeInfo(expandedMoment.type).label}</span>
                      </span>
                    </Badge>
                    <Badge variant="outline" className={cn(
                      "py-1.5 px-3 text-sm border", 
                      subjectColors[expandedMoment.subject] || "border-gray-200 bg-gray-50"
                    )}>
                      {expandedMoment.subject}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    {expandedMoment.date}
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-4">{expandedMoment.title}</h2>
                
                <p className="text-gray-700 mb-6">{expandedMoment.description}</p>
                
                {expandedMoment.content && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <pre className="text-sm whitespace-pre-wrap">{expandedMoment.content}</pre>
                  </div>
                )}
                
                {/* 音频播放器 */}
                {expandedMoment.type === 'audio' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center">
                    <Button variant="outline" size="sm" className="mr-4 h-10 w-10 rounded-full p-0">
                      <Play className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-1/3"></div>
                    </div>
                    <span className="ml-4 text-sm text-gray-500">{expandedMoment.duration}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Timeline; 