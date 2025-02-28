'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, BookOpen, Clock, Play, Pause, SkipBack, SkipForward, 
  Calendar, ChevronLeft, Video, Mic, Upload, Heart, ThumbsUp, Tag,
  ChevronRight, ChevronDown, ChevronUp, Film, RadioTower, School,
  PenTool, FileAudio, BarChart, FileVideo, Bookmark, ArrowRight, X, Share
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AppSidebar } from "@/components/app-sidebar";
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
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { 
  TitleSkeleton, 
  CardSkeleton, 
  ListSkeleton,
  ContentSkeleton,
  TabsSkeleton
} from "@/components/ui/skeleton-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

// 添加Memory图标组件
const MemoryIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 2h10M5 6c1-2 3-4 7-4 4 0 6 2 7 4 1 2 1 9-7 12-8-3-8-10-7-12Z"></path>
    <path d="M9 15c.1-3.25 6.739-2 8 0 1 1 1 4-3 4.5-4-.5-5-3.5-5-4.5Z"></path>
  </svg>
);

// 定义课堂记录类型
type ClassRecord = {
  id: string;
  title: string;
  date: string;
  duration: string;
  teacher: string;
  class: string;
  thumbnail: string;
  isMine: boolean;
  subject: string;
  likes: number;
};

// 定义胶片类型
type FilmStrip = {
  semester: string; // 修改为学期
  period: string; // 添加时间段描述
  moments: TeachingMoment[];
};

type TeachingMoment = {
  id: string;
  type: 'note' | 'audio' | 'homework' | 'video';
  title: string;
  date: string;
  thumbnail: string;
  description: string;
  subjectColor: string;
  subject: string;
};

// 模拟课堂记录数据
const mockClassRecords: ClassRecord[] = [
  {
    id: '1',
    title: '高中物理 - 牛顿第二定律',
    date: '2023-11-15',
    duration: '45分钟',
    teacher: '张老师',
    class: '高二(3)班',
    thumbnail: 'https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGh5c2ljc3xlbnwwfHwwfHx8MA%3D%3D',
    isMine: true,
    subject: '物理',
    likes: 24,
  },
  {
    id: '2',
    title: '初中数学 - 二次函数',
    date: '2023-11-10',
    duration: '40分钟',
    teacher: '张老师',
    class: '初三(2)班',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWF0aHxlbnwwfHwwfHx8MA%3D%3D',
    isMine: true,
    subject: '数学',
    likes: 32,
  },
  {
    id: '3',
    title: '高中语文 - 红楼梦赏析',
    date: '2023-11-05',
    duration: '50分钟',
    teacher: '李老师',
    class: '高一(1)班',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpbmVzZSUyMGxpdGVyYXR1cmV8ZW58MHx8MHx8fDA%3D',
    isMine: false,
    subject: '语文',
    likes: 45,
  },
  {
    id: '4',
    title: '初中英语 - 现在完成时',
    date: '2023-11-03',
    duration: '45分钟',
    teacher: '王老师',
    class: '初二(4)班',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZW5nbGlzaHxlbnwwfHwwfHx8MA%3D%3D',
    isMine: false,
    subject: '英语',
    likes: 18,
  },
  {
    id: '5',
    title: '高中化学 - 元素周期表',
    date: '2023-11-01',
    duration: '50分钟',
    teacher: '张老师',
    class: '高一(2)班',
    thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hlbWlzdHJ5fGVufDB8fDB8fHww',
    isMine: true,
    subject: '化学',
    likes: 15,
  },
];

// 模拟胶片数据
const mockFilmStrips: FilmStrip[] = [
  {
    semester: '2023-秋',
    period: '2023年9月-2024年1月',
    moments: [
      {
        id: 'note1',
        type: 'note',
        title: '物理课知识点笔记',
        date: '2023-10-15',
        thumbnail: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bm90ZXN8ZW58MHx8MHx8fDA%3D',
        description: '牛顿第二定律公式推导笔记',
        subjectColor: 'blue',
        subject: '物理',
      },
      {
        id: 'audio1',
        type: 'audio',
        title: '课堂提问录音',
        date: '2023-11-20',
        thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXVkaW8lMjB3YXZlfGVufDB8fDB8fHww',
        description: '学生关于牛顿定律的问答',
        subjectColor: 'blue',
        subject: '物理',
      },
      {
        id: 'video1',
        type: 'video',
        title: '课堂教学视频',
        date: '2023-12-15',
        thumbnail: 'https://images.unsplash.com/photo-1576097492152-4687fcb6b81b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2xhc3Nyb29tJTIwdGVhY2hpbmd8ZW58MHx8MHx8fDA%3D',
        description: '物理课堂精彩片段',
        subjectColor: 'blue',
        subject: '物理',
      },
    ],
  },
  {
    semester: '2023-春',
    period: '2023年2月-2023年6月',
    moments: [
      {
        id: 'note2',
        type: 'note',
        title: '数学课读书笔记',
        date: '2023-03-05',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWF0aHxlbnwwfHwwfHx8MA%3D%3D',
        description: '二次函数公式推导笔记',
        subjectColor: 'purple',
        subject: '数学',
      },
      {
        id: 'homework1',
        type: 'homework',
        title: '数学作业成绩趋势',
        date: '2023-04-10',
        thumbnail: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3JhcGglMjBjaGFydHxlbnwwfHwwfHx8MA%3D%3D',
        description: '二次函数单元测试成绩走势',
        subjectColor: 'purple',
        subject: '数学',
      },
      {
        id: 'audio2',
        type: 'audio',
        title: '课堂讲解录音',
        date: '2023-05-25',
        thumbnail: 'https://images.unsplash.com/photo-1546708470-deacc8735a08?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXVkaW8lMjByZWNvcmRpbmd8ZW58MHx8MHx8fDA%3D',
        description: '数学公式讲解',
        subjectColor: 'purple',
        subject: '数学',
      },
    ],
  },
  {
    semester: '2022-秋',
    period: '2022年9月-2023年1月',
    moments: [
      {
        id: 'note3',
        type: 'note',
        title: '语文课读书笔记',
        date: '2022-10-05',
        thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hpbmVzZSUyMGxpdGVyYXR1cmV8ZW58MHx8MHx8fDA%3D',
        description: '《红楼梦》人物关系笔记',
        subjectColor: 'red',
        subject: '语文',
      },
      {
        id: 'audio3',
        type: 'audio',
        title: '朗读录音',
        date: '2022-11-15',
        thumbnail: 'https://images.unsplash.com/photo-1546708470-deacc8735a08?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXVkaW8lMjByZWNvcmRpbmd8ZW58MHx8MHx8fDA%3D',
        description: '经典文学作品朗读',
        subjectColor: 'red',
        subject: '语文',
      },
      {
        id: 'homework2',
        type: 'homework',
        title: '语文作业评分',
        date: '2022-12-01',
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZW5nbGlzaCUyMGdyYWRlfGVufDB8fDB8fHww',
        description: '语文写作能力提升曲线',
        subjectColor: 'red',
        subject: '语文',
      },
    ],
  },
  {
    semester: '2022-春',
    period: '2022年2月-2022年6月',
    moments: [
      {
        id: 'note4',
        type: 'note',
        title: '英语课笔记',
        date: '2022-03-10',
        thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZW5nbGlzaHxlbnwwfHwwfHx8MA%3D%3D',
        description: '现在完成时用法笔记',
        subjectColor: 'yellow',
        subject: '英语',
      },
      {
        id: 'audio4',
        type: 'audio',
        title: '口语练习录音',
        date: '2022-04-25',
        thumbnail: 'https://images.unsplash.com/photo-1461784180009-27c427be5bab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YXVkaW8lMjB3YXZlfGVufDB8fDB8fHww',
        description: '英语口语对话练习',
        subjectColor: 'yellow',
        subject: '英语',
      },
      {
        id: 'video2',
        type: 'video',
        title: '课堂活动视频',
        date: '2022-05-20',
        thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2xhc3Nyb29tJTIwdGVhY2hpbmd8ZW58MHx8MHx8fDA%3D',
        description: '英语口语课堂活动',
        subjectColor: 'yellow',
        subject: '英语',
      },
    ],
  },
  {
    semester: '2021-秋',
    period: '2021年9月-2022年1月',
    moments: [
      {
        id: 'note5',
        type: 'note',
        title: '化学实验记录',
        date: '2021-10-10',
        thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hlbWlzdHJ5JTIwbm90ZXN8ZW58MHx8MHx8fDA%3D',
        description: '元素周期表实验记录',
        subjectColor: 'green',
        subject: '化学',
      },
      {
        id: 'homework3',
        type: 'homework',
        title: '化学作业评分',
        date: '2021-11-15',
        thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hlbWlzdHJ5fGVufDB8fDB8fHww',
        description: '化学实验报告评分',
        subjectColor: 'green',
        subject: '化学',
      },
      {
        id: 'video3',
        type: 'video',
        title: '实验演示视频',
        date: '2021-12-05',
        thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hlbWlzdHJ5fGVufDB8fDB8fHww',
        description: '化学反应实验演示',
        subjectColor: 'green',
        subject: '化学',
      },
    ],
  },
];

// 学科颜色映射
const subjectColors: Record<string, string> = {
  '语文': 'text-red-500 border-red-200',
  '数学': 'text-purple-500 border-purple-200',
  '英语': 'text-blue-500 border-blue-200',
  '物理': 'text-sky-500 border-sky-200',
  '化学': 'text-green-500 border-green-200',
  '生物': 'text-emerald-500 border-emerald-200',
  '历史': 'text-amber-500 border-amber-200',
  '地理': 'text-rose-500 border-rose-200',
  '政治': 'text-indigo-500 border-indigo-200',
};

// 获取最高点赞的课堂记录
const getTopLikedRecords = (records: ClassRecord[], count = 1): ClassRecord[] => {
  return [...records].sort((a, b) => b.likes - a.likes).slice(0, count);
};

const topLikedRecords = getTopLikedRecords(mockClassRecords, 2).map(record => record.id);

// 获取类型对应的图标
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'note':
      return <BookOpen className="h-3 w-3" />;
    case 'audio':
      return <Mic className="h-3 w-3" />;
    case 'homework':
      return <BookOpen className="h-3 w-3" />;
    case 'video':
      return <Video className="h-3 w-3" />;
    default:
      return <BookOpen className="h-3 w-3" />;
  }
};

// 获取类型对应的颜色
const getTypeColor = (type: string) => {
  switch (type) {
    case 'note':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'audio':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'homework':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'video':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// 获取主题色背景
const getSubjectBackground = (subject: string) => {
  switch (subject) {
    case '物理':
      return 'from-blue-500/20 to-transparent';
    case '数学':
      return 'from-purple-500/20 to-transparent';
    case '语文':
      return 'from-red-500/20 to-transparent';
    case '英语':
      return 'from-yellow-500/20 to-transparent';
    case '化学':
      return 'from-green-500/20 to-transparent';
    default:
      return 'from-gray-500/20 to-transparent';
  }
};

// 添加新的时光胶片组件
const FilmStripTimeline = ({
  filmStrips,
  onMomentClick
}: {
  filmStrips: FilmStrip[];
  onMomentClick?: (moment: TeachingMoment) => void;
}) => {
  const [selectedSemester, setSelectedSemester] = useState<string | null>(filmStrips[0]?.semester || null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // 选择学期
  const handleSelectSemester = (semester: string) => {
    setSelectedSemester(semester);
    // 滚动到选定的学期内容
    const semesterElement = document.getElementById(`filmstrip-semester-${semester}`);
    if (semesterElement && timelineRef.current) {
      timelineRef.current.scrollTo({
        left: semesterElement.offsetLeft - 100,
        behavior: 'smooth',
      });
    }
  };
  
  // 当前选中的学期内容
  const selectedSemesterData = useMemo(() => {
    return filmStrips.find(strip => strip.semester === selectedSemester) || filmStrips[0];
  }, [selectedSemester, filmStrips]);
  
  // 滚动到左侧
  const scrollLeft = () => {
    if (timelineRef.current) {
      timelineRef.current.scrollTo({
        left: timelineRef.current.scrollLeft - 600,
        behavior: 'smooth',
      });
    }
  };
  
  // 滚动到右侧
  const scrollRight = () => {
    if (timelineRef.current) {
      timelineRef.current.scrollTo({
        left: timelineRef.current.scrollLeft + 600,
        behavior: 'smooth',
      });
    }
  };
  
  // 渲染胶片帧
  const renderFilmFrame = (moment: TeachingMoment, semesterIndex: number = 0, momentIndex: number = 0, totalMoments: number = 1) => {
    // 计算节点在时间轴上的相对位置
    const positionPercent = selectedSemester 
      ? ((momentIndex / (totalMoments - 1 || 1)) * 100) 
      : ((semesterIndex + (momentIndex / totalMoments)) / filmStrips.length * 100);
      
    return (
      <div className="relative">
        {/* 时间标识 - 连接到导轨 */}
        <div className="absolute top-[-120px] left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-[95px] bg-gray-300"></div>
            <div className="absolute top-0 w-4 h-4 rounded-full bg-white border-2 border-primary transform -translate-x-1/2 left-1/2 shadow-sm"></div>
            <div className="absolute top-8 rounded-full bg-white shadow-sm px-3 py-1 text-xs text-gray-700 font-medium border border-gray-100 transform -translate-x-1/2 left-1/2 whitespace-nowrap">
              {moment.date}
            </div>
          </div>
        </div>
        
        <motion.div 
          key={moment.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            scale: 1.02, 
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)" 
          }}
          transition={{ duration: 0.2 }}
          className="relative w-[280px] h-[220px] bg-white rounded-lg overflow-hidden cursor-pointer shadow-sm"
          onClick={() => onMomentClick && onMomentClick(moment)}
        >
          {/* 缩略图背景 */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
            <motion.img 
              src={moment.thumbnail} 
              alt={moment.title}
              className="w-full h-full object-cover opacity-90"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
          </div>

          {/* 顶部信息条 */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-3 z-20">
            {/* 类型标签 - 简化设计 */}
            <div className="flex items-center">
              <div className="bg-white/90 backdrop-blur-md rounded-full h-6 pl-1.5 pr-2 py-0.5 flex items-center shadow-sm">
                {moment.type === 'note' && <PenTool className="h-3 w-3 text-blue-600 mr-1" />}
                {moment.type === 'audio' && <FileAudio className="h-3 w-3 text-purple-600 mr-1" />}
                {moment.type === 'homework' && <BarChart className="h-3 w-3 text-amber-600 mr-1" />}
                {moment.type === 'video' && <FileVideo className="h-3 w-3 text-rose-600 mr-1" />}
                <span className="text-xs font-medium text-gray-800">
                  {moment.type === 'note' && '笔记'}
                  {moment.type === 'audio' && '录音'}
                  {moment.type === 'homework' && '作业'}
                  {moment.type === 'video' && '视频'}
                </span>
              </div>
            </div>
            
            {/* 学科标签 - 简化设计 */}
            <Badge variant="outline" className={cn("backdrop-blur-md bg-white/80 border-0 shadow-sm", subjectColors[moment.subject])}>
              {moment.subject}
            </Badge>
          </div>
          
          {/* 中央播放按钮 - 仅针对视频和音频 */}
          {(moment.type === 'video' || moment.type === 'audio') && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center z-10"
              initial={{ opacity: 0.6 }}
              whileHover={{ opacity: 1 }}
            >
              <motion.div 
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 transition-colors duration-300"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
              >
                <Play className={cn(
                  "h-5 w-5",
                  moment.type === 'video' ? "text-rose-500" : "text-purple-500"
                )} />
              </motion.div>
            </motion.div>
          )}
          
          {/* 底部信息 - 更简洁的设计 */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-3 bg-gradient-to-t from-black to-transparent pt-10">
            <h4 className="text-base font-medium text-white mb-1 line-clamp-1">{moment.title}</h4>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/80">{moment.date}</span>
              <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
                <ArrowRight className="h-3.5 w-3.5 text-white/80" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };
  
  return (
    <div className="h-full w-full bg-white overflow-hidden flex flex-col">
      {/* 学期选择器 - 设计优化 */}
      <div className="border-b border-gray-100 py-3 px-6">
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-gray-50 rounded-lg shadow-sm">
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "text-xs rounded-md h-7 text-gray-600 px-3 mx-0.5",
                !selectedSemester && "bg-white text-gray-900 shadow-sm"
              )}
              onClick={() => setSelectedSemester(null)}
            >
              全部学期
            </Button>
            
            {/* 学期过滤按钮 */}
            {filmStrips.map(strip => (
              <Button 
                key={strip.semester} 
                variant="ghost" 
                size="sm"
                className={cn(
                  "text-xs rounded-md h-7 text-gray-600 px-3 mx-0.5",
                  selectedSemester === strip.semester && "bg-white text-gray-900 shadow-sm"
                )}
                onClick={() => handleSelectSemester(strip.semester)}
              >
                {strip.semester}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 胶片墙展示区域 */}
      <div className="relative flex-1">
        {/* 时间轴背景 - 固定导轨 */}
        <div className="absolute left-0 right-0 top-[120px] h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 z-10 mx-10">
          {/* 刻度线 */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={`tick-${i}`}
              className="absolute top-[-4px] w-0.5 h-2 bg-gray-400"
              style={{ left: `${(i / 19) * 100}%` }}
            ></div>
          ))}
          
          {/* 学期区域标识 */}
          {!selectedSemester && filmStrips.map((strip, index, array) => (
            <div 
              key={`timeline-semester-${strip.semester}`} 
              className="absolute top-[-10px] text-xs font-medium text-gray-500"
              style={{ 
                left: `${(index / array.length) * 100}%`, 
                width: `${(1 / array.length) * 100}%` 
              }}
            >
              <div className="flex items-center">
                <div className="w-1 h-5 bg-gray-400 rounded-full"></div>
                <div className="ml-2">{strip.semester}</div>
              </div>
            </div>
          ))}
        </div>
        
        <ScrollArea 
          className="h-full w-full bg-gray-50/50 pt-12 pb-8" 
          ref={timelineRef}
        >
          <div className="flex px-10">
            {/* 如果没有选择特定学期，显示所有学期的胶片 */}
            {!selectedSemester ? (
              filmStrips.map((strip, stripIndex) => (
                <div
                  key={strip.semester}
                  id={`filmstrip-semester-${strip.semester}`}
                  className="flex-none pr-8 last:pr-0"
                >
                  <motion.div 
                    className="flex flex-col"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* 学期标识 - 更精美的设计 */}
                    <div className="mb-10 text-center">
                      <div className="inline-block bg-white px-4 py-1.5 rounded-lg shadow-sm mb-2">
                        <h3 className="text-primary font-medium">{strip.semester}</h3>
                      </div>
                      <p className="text-gray-500 text-xs">{strip.period}</p>
                    </div>
                    
                    {/* 胶片列表 */}
                    <div className="flex space-x-6 pt-8">
                      {strip.moments.map((moment, momentIdx) => 
                        renderFilmFrame(moment, stripIndex, momentIdx, strip.moments.length)
                      )}
                    </div>
                  </motion.div>
                </div>
              ))
            ) : (
              // 显示选中学期的胶片
              <motion.div 
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-12 text-center">
                  <div className="inline-block bg-white px-5 py-2 rounded-lg shadow-sm mb-2">
                    <h3 className="text-primary text-lg font-medium">{selectedSemesterData.semester}</h3>
                  </div>
                  <p className="text-gray-500 text-sm">{selectedSemesterData.period}</p>
                </div>
                
                {/* 单学期时间轴 */}
                <div className="relative mb-12">
                  <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 z-10">
                    {/* 刻度线 */}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div 
                        key={`semester-tick-${i}`}
                        className="absolute top-[-4px] w-0.5 h-2 bg-gray-400"
                        style={{ left: `${(i / 9) * 100}%` }}
                      ></div>
                    ))}
                    
                    {/* 单学期范围标记 */}
                    <div className="absolute top-[-10px] text-xs font-medium text-gray-500 left-0">
                      <div className="flex items-center">
                        <div className="w-1 h-5 bg-gray-400 rounded-full"></div>
                        <div className="ml-2">{selectedSemesterData.semester}开始</div>
                      </div>
                    </div>
                    <div className="absolute top-[-10px] text-xs font-medium text-gray-500 right-0">
                      <div className="flex items-center">
                        <div className="w-1 h-5 bg-gray-400 rounded-full"></div>
                        <div className="ml-2">{selectedSemesterData.semester}结束</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-2 pt-8">
                  {selectedSemesterData.moments.map((moment, idx) => 
                    renderFilmFrame(moment, 0, idx, selectedSemesterData.moments.length)
                  )}
                </div>
              </motion.div>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="z-30 h-2.5 mt-4 bg-gray-200/50" />
        </ScrollArea>
        
        {/* 左右导航按钮 - 放置在两侧 */}
        <motion.button 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-10 h-20 rounded-r-lg bg-white/70 flex items-center justify-center backdrop-blur-md z-30 text-gray-600 shadow-sm border border-gray-100"
          whileHover={{ backgroundColor: "rgba(255,255,255,0.95)" }}
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
        <motion.button 
          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-20 rounded-l-lg bg-white/70 flex items-center justify-center backdrop-blur-md z-30 text-gray-600 shadow-sm border border-gray-100"
          whileHover={{ backgroundColor: "rgba(255,255,255,0.95)" }}
          onClick={scrollRight}
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>
      
      {/* 页脚 - 更简约的设计 */}
      <div className="py-3 px-6 flex items-center justify-center text-xs text-gray-400 border-t border-gray-100">
        <div className="flex space-x-4 items-center">
          <span>© 教师成长档案</span>
          <div className="h-3 w-px bg-gray-200"></div>
          <span>回忆里的教学瞬间</span>
        </div>
      </div>
    </div>
  );
};

export default function ClassroomTimeMachinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mainTab, setMainTab] = useState<'myList' | 'schoolList'>('myList');
  const [selectedMoment, setSelectedMoment] = useState<TeachingMoment | null>(null);
  const [showMemoryView, setShowMemoryView] = useState(false);
  const memoryViewRef = useRef<HTMLDivElement>(null);
  
  // 处理URL参数
  useEffect(() => {
    const recordId = searchParams.get('recordId');
    if (recordId) {
      // 检查记录是否存在
      const recordExists = mockClassRecords.some(record => record.id === recordId);
      if (recordExists) {
        setSelectedRecord(recordId);
      } else {
        console.warn(`记录ID ${recordId} 不存在`);
      }
    }
    setIsLoading(false);
  }, [searchParams]);
  
  const handleUploadRecording = () => {
    // 实现上传功能，后续可以添加具体逻辑
    console.log('上传课堂实录');
    // 这里可以添加显示上传对话框的逻辑
  };

  const handleOpenMemoryView = () => {
    setShowMemoryView(true);
  };

  const handleCloseMemoryView = () => {
    setShowMemoryView(false);
  };
  
  const handleSelectRecord = (id: string) => {
    setSelectedRecord(id);
    // 更新URL，但不触发页面刷新
    const url = new URL(window.location.href);
    url.searchParams.set('recordId', id);
    window.history.pushState({}, '', url);
  };
  
  const handleMomentClick = (moment: TeachingMoment) => {
    setSelectedMoment(moment);
    // 可以在这里处理点击事件，比如显示详情弹窗等
    console.log("Clicked on moment:", moment);
  };
  
  if (isLoading) {
    // 保持现有加载状态的JSX不变
    return (
      <div className="max-w-7xl mx-auto w-full animate-fadeIn">
        {/* 现有的加载状态JSX */}
      </div>
    );
  }
  
  // 如果有选中的记录，显示记录详情
  if (selectedRecord) {
    const record = mockClassRecords.find(r => r.id === selectedRecord);
    
    if (!record) {
      return (
        <div className="max-w-7xl mx-auto py-6">
          {/* 现有的未找到记录JSX */}
        </div>
      );
    }
    
    return (
      <div className="max-w-7xl mx-auto w-full">
        {/* 现有的记录详情JSX */}
      </div>
    );
  }
  
  // 否则显示记录列表和胶片墙
  return (
    <>
      {/* 全屏记忆墙视图 */}
      {showMemoryView && (
        <motion.div 
          ref={memoryViewRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-white overflow-hidden flex flex-col"
        >
          <div className="py-2 px-6 flex justify-between items-center border-b border-gray-200">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCloseMemoryView}
              className="text-gray-700 hover:bg-gray-100 rounded-md pl-2 pr-3"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              BACK / 返回
            </Button>
            <h3 className="text-base font-medium text-gray-800">
              教师成长档案
            </h3>
            <div className="text-gray-600 text-sm">
              教学历程 2021年-2023年
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            {/* 添加背景色和图案 */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 opacity-100"></div>
            <div className="absolute inset-0 bg-grid-primary/5"></div>
            {/* 内容包装器 */}
            <div className="relative z-10 h-full overflow-hidden">
              <FilmStripTimeline 
                filmStrips={mockFilmStrips} 
                onMomentClick={handleMomentClick}
              />
            </div>
          </div>
          <div className="py-2 px-6 bg-primary/10 border-t border-primary/20 flex justify-between items-center text-xs text-gray-600">
            <div className="flex items-center">
              <Film className="h-3 w-3 mr-1 text-primary" />
              <span>共展示 {mockFilmStrips.reduce((total, strip) => total + strip.moments.length, 0)} 个教学瞬间</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-600 hover:text-primary hover:bg-primary/10">
                <Bookmark className="h-3 w-3 mr-1" />
                收藏记忆墙
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-600 hover:text-primary hover:bg-primary/10">
                <Share className="h-3 w-3 mr-1" />
                分享
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">课堂时光机</h2>
            <p className="mt-1 text-sm text-gray-500">记录和回放课堂教学过程，辅助教学分析</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button 
              onClick={handleOpenMemoryView}
              className="bg-rose-500 text-white hover:bg-rose-600"
              size="sm"
            >
              <MemoryIcon />
              <span className="ml-2">回忆</span>
            </Button>
            <Button 
              onClick={handleUploadRecording}
              className="bg-primary text-white hover:bg-primary/90"
              size="sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              上传课堂实录
            </Button>
          </div>
        </div>

        {/* 主标签页 */}
        <Tabs value={mainTab} onValueChange={(value) => setMainTab(value as 'myList' | 'schoolList')} className="mb-8">
          <TabsList className="inline-flex mb-6 rounded-lg p-1 bg-muted/20">
            <TabsTrigger value="myList" className="flex items-center px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <BookOpen className="mr-2 h-4 w-4" />
              我的课堂列表
            </TabsTrigger>
            <TabsTrigger value="schoolList" className="flex items-center px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <School className="mr-2 h-4 w-4" />
              全校时光
            </TabsTrigger>
          </TabsList>

          {/* 我的课堂列表 - 保持原有内容 */}
          <TabsContent value="myList" className="animate-fadeIn">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <div className="w-1.5 h-5 bg-sky-500 rounded-full mr-2"></div>
                  我的课堂
                </h3>
                
                <div className="flex gap-2">
                  {/* 这里可以添加学科筛选按钮 */}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mockClassRecords.filter(record => record.isMine).map((record) => (
                  <Card 
                    key={record.id} 
                    className={cn(
                      "overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 border border-gray-200",
                      selectedRecord === record.id ? "ring-2 ring-primary shadow-md" : "hover:translate-y-[-4px]"
                    )}
                    onClick={() => handleSelectRecord(record.id)}
                  >
                    <div className="relative h-32 w-full group">
                      <img 
                        src={record.thumbnail} 
                        alt={record.title} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Badge className="bg-sky-600 hover:bg-sky-700 text-xs">{record.class}</Badge>
                            {record.isMine && (
                              <Badge variant="secondary" className="bg-sky-100 text-sky-800 hover:bg-sky-200 text-xs">我的</Badge>
                            )}
                            {topLikedRecords.includes(record.id) && (
                              <Badge variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-200 text-xs">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                热门
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-white line-clamp-1">{record.title}</h3>
                        </div>
                      </div>
                      
                      {/* 学科标签 */}
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className={cn("border px-2 py-0.5 text-xs", subjectColors[record.subject])}>
                          {record.subject}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 text-gray-500 mr-1" />
                          <span className="text-gray-500">{record.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-gray-500 mr-1" />
                          <span className="text-gray-500">{record.date}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <div className="flex items-center">
                          <Avatar className="h-5 w-5 mr-1">
                            <AvatarFallback>{record.teacher.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{record.teacher}</span>
                        </div>
                        <div className="flex items-center text-rose-500">
                          <Heart className="h-3 w-3 mr-1 fill-rose-500" />
                          <span>{record.likes}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 全校时光 - 保持原有内容 */}
          <TabsContent value="schoolList" className="animate-fadeIn">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <div className="w-1.5 h-5 bg-indigo-500 rounded-full mr-2"></div>
                  全校精彩课堂
                </h3>
                
                <div className="flex gap-2">
                  {/* 这里可以添加学科/教师筛选按钮 */}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mockClassRecords.filter(record => !record.isMine).map((record) => (
                  <Card 
                    key={record.id}
                    className={cn(
                      "overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 border border-gray-200",
                      selectedRecord === record.id ? "ring-2 ring-primary shadow-md" : "hover:translate-y-[-4px]"
                    )}
                    onClick={() => handleSelectRecord(record.id)}
                  >
                    <div className="relative h-32 w-full group">
                      <img 
                        src={record.thumbnail}
                        alt={record.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Badge className="bg-indigo-600 hover:bg-indigo-700 text-xs">{record.class}</Badge>
                            {topLikedRecords.includes(record.id) && (
                              <Badge variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-200 text-xs">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                热门
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-white line-clamp-1">{record.title}</h3>
                        </div>
                      </div>
                      
                      {/* 学科标签 */}
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className={cn("border px-2 py-0.5 text-xs", subjectColors[record.subject])}>
                          {record.subject}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 text-gray-500 mr-1" />
                          <span className="text-gray-500">{record.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-gray-500 mr-1" />
                          <span className="text-gray-500">{record.date}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <div className="flex items-center">
                          <Avatar className="h-5 w-5 mr-1">
                            <AvatarFallback>{record.teacher.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{record.teacher}</span>
                        </div>
                        <div className="flex items-center text-rose-500">
                          <Heart className="h-3 w-3 mr-1 fill-rose-500" />
                          <span>{record.likes}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
} 