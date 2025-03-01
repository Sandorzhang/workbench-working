import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, FileText, Mic, Video, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FilmStrip, TeachingMoment } from '@/mocks/handlers/classroom-timemachine';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// 获取类型信息
const getTypeInfo = (type: string) => {
  switch (type) {
    case 'note':
      return {
        icon: <FileText className="h-3 w-3" />,
        className: 'bg-amber-500',
        label: '笔记'
      };
    case 'audio':
      return {
        icon: <Mic className="h-3 w-3" />,
        className: 'bg-blue-500',
        label: '音频'
      };
    case 'video':
      return {
        icon: <Video className="h-3 w-3" />,
        className: 'bg-rose-500',
        label: '视频'
      };
    case 'homework':
      return {
        icon: <BookOpen className="h-3 w-3" />,
        className: 'bg-green-500',
        label: '作业'
      };
    default:
      return {
        icon: <FileText className="h-3 w-3" />,
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
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineWidth, setTimelineWidth] = useState(2000);
  const [containerWidth, setContainerWidth] = useState(0);
  
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

  // 渲染胶片帧
  const renderFilmFrame = (moment: TeachingMoment, position: number) => {
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
          zIndex: isSelected ? 50 : 10 // 选中的时刻提高层级，避免被其他元素遮挡
        }}
        onClick={() => handleMomentClick(moment)}
      >
        {/* 日期标签 - 在时间线上方 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[calc(60px-25px)] z-30">
          <div className={cn(
            "px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap",
            isSelected ? "bg-primary text-white" : "bg-background border border-border text-foreground"
          )}>
            {moment.date}
          </div>
        </div>
        
        {/* 连接线 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[calc(60px-25px+20px)] h-[65px] w-px z-20">
          <div className={cn(
            "w-full h-full bg-gradient-to-b",
            isSelected ? "from-primary to-primary/50" : `${subjectGradient}`
          )}></div>
        </div>
        
        {/* 时间线上的锚点 */}
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 top-[60px] mt-[-4px] z-50"
          onClick={(e) => handleNodeClick(moment, e)}
        >
          <motion.div 
            className={cn(
              "w-2 h-2 rounded-full border-2 cursor-pointer transition-all",
              isSelected 
                ? "w-3 h-3 border-primary bg-white" 
                : `border-gray-400 bg-white hover:border-primary`
            )}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.9 }}
            animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        {/* 卡片内容 - 在时间线下方 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[calc(60px+25px)] z-30">
          <motion.div 
            className={cn(
              "w-48 rounded-lg overflow-hidden border shadow-sm bg-card transition-all",
              isSelected ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-primary/50"
            )}
            whileHover={{ y: -2 }}
            animate={isSelected ? { y: -4 } : { y: 0 }}
          >
            <div className="relative h-24 w-full overflow-hidden">
              <img 
                src={moment.thumbnail || '/placeholder.jpg'} 
                alt={moment.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                <div className="absolute bottom-2 left-2 right-2 overflow-hidden">
                  <div className="flex items-center gap-1 mb-1 w-full overflow-hidden">
                    <Badge className={cn("h-4 px-1 text-[10px] flex-shrink-0", typeInfo.className)}>
                      <span className="flex items-center w-full overflow-hidden">
                        {typeInfo.icon}
                        <span className="ml-0.5 truncate">{typeInfo.label}</span>
                      </span>
                    </Badge>
                  </div>
                  <h3 className="text-xs font-medium text-white line-clamp-1">{moment.title}</h3>
                </div>
              </div>
              
              {/* 播放按钮 */}
              {(moment.type === 'video' || moment.type === 'audio') && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full bg-black/50 hover:bg-primary border-none">
                    <Play className="h-4 w-4 text-white" />
                  </Button>
                </div>
              )}
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
    <div className="w-full rounded-lg border border-border bg-card overflow-hidden">
      {/* 学期选择器 */}
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold mb-3">教学时间线</h3>
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
      <div className="relative p-4 pb-6 pt-2">
        {/* 时间线提示 */}
        <div className="flex justify-center mb-1">
          <Badge variant="outline" className="bg-muted/50 text-sm font-normal">
            滑动查看更多 · 点击节点查看详情
          </Badge>
        </div>
        
        {/* 滚动区域 */}
        <div className="relative overflow-hidden">
          <ScrollArea 
            ref={timelineRef} 
            className="w-full h-[320px] overflow-x-auto overflow-y-hidden"
          >
            <div className="relative" style={{ width: `${timelineWidth}px`, height: '320px' }}>
              {/* 时间线背景 */}
              <div className="absolute left-0 right-0 top-[60px] h-0.5 bg-muted z-10">
                {/* 刻度线 */}
                {Array.from({ length: 50 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute h-1.5 w-px bg-border" 
                    style={{ left: `${(i + 1) * 2}%`, top: '-0.5px' }}
                  />
                ))}
              </div>
              
              {/* 学期标签 */}
              {filmStrips.map((strip, index) => (
                <div 
                  key={strip.semester}
                  id={`semester-${strip.semester}`}
                  className="absolute text-sm font-medium text-muted-foreground"
                  style={{ 
                    left: `${(index / filmStrips.length) * 100}%`, 
                    top: '10px',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <Badge variant="outline" className="whitespace-nowrap">
                    {strip.startDate} - {strip.endDate}
                  </Badge>
                  <div className="text-xs text-center mt-1">{strip.semester}</div>
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
                  
                  return renderFilmFrame(moment, momentPosition);
                });
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          
          {/* 导航按钮 */}
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={scrollLeft}
              className="h-8 w-8 p-0 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={scrollRight}
              className="h-8 w-8 p-0 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline; 