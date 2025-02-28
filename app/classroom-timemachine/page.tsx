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
  PenTool, FileAudio, BarChart, FileVideo, Bookmark, ArrowRight, X
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
const MemoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  
  // 渲染胶片帧
  const renderFilmFrame = (moment: TeachingMoment) => {
    return (
      <motion.div 
        key={moment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          scale: 1.03, 
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" 
        }}
        transition={{ duration: 0.2 }}
        className="relative w-[280px] h-[220px] bg-white rounded-md overflow-hidden cursor-pointer group"
        onClick={() => onMomentClick && onMomentClick(moment)}
      >
        {/* 胶片外观 - 顶部和底部的黑边 */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-black z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-black z-10"></div>
        
        {/* 胶片内容区域 */}
        <div className="absolute top-3 bottom-3 left-0 right-0 overflow-hidden">
          {/* 胶片齿孔 - 左侧 */}
          <div className="absolute top-0 bottom-0 left-0 w-7 bg-black z-10 flex flex-col justify-between py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={`left-hole-${i}`} 
                className="w-5 h-5 mx-1 rounded-full bg-gray-200 border-2 border-gray-800 flex items-center justify-center"
              >
                <div className="w-2 h-2 rounded-full bg-gray-800"></div>
              </div>
            ))}
          </div>
          
          {/* 胶片齿孔 - 右侧 */}
          <div className="absolute top-0 bottom-0 right-0 w-7 bg-black z-10 flex flex-col justify-between py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={`right-hole-${i}`} 
                className="w-5 h-5 mx-1 rounded-full bg-gray-200 border-2 border-gray-800 flex items-center justify-center"
              >
                <div className="w-2 h-2 rounded-full bg-gray-800"></div>
              </div>
            ))}
          </div>
          
          {/* 内容区域 */}
          <div className="absolute top-0 bottom-0 left-7 right-7 overflow-hidden">
            <div className="relative h-full w-full bg-gray-100 group-hover:brightness-105 transition-all duration-300">
              {/* 缩略图和背景 */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={moment.thumbnail} 
                  alt={moment.title}
                  className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              
              {/* 内容类型指示器 */}
              <div className="absolute top-2 left-2 z-20">
                {moment.type === 'note' && (
                  <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-md">
                    <PenTool className="h-3 w-3 text-blue-600 mr-1" />
                    <span className="text-xs font-medium text-gray-800">课堂笔记</span>
                  </div>
                )}
                {moment.type === 'audio' && (
                  <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-md">
                    <FileAudio className="h-3 w-3 text-purple-600 mr-1" />
                    <span className="text-xs font-medium text-gray-800">语音记录</span>
                  </div>
                )}
                {moment.type === 'homework' && (
                  <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-md">
                    <BarChart className="h-3 w-3 text-amber-600 mr-1" />
                    <span className="text-xs font-medium text-gray-800">作业评分</span>
                  </div>
                )}
                {moment.type === 'video' && (
                  <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-md">
                    <FileVideo className="h-3 w-3 text-rose-600 mr-1" />
                    <span className="text-xs font-medium text-gray-800">课堂视频</span>
                  </div>
                )}
              </div>
              
              {/* 学科标签 */}
              <div className="absolute top-2 right-2 z-20">
                <Badge variant="outline" className={cn("backdrop-blur-sm bg-white/70 border shadow-sm", subjectColors[moment.subject])}>
                  {moment.subject}
                </Badge>
              </div>
              
              {/* 根据类型显示不同的内容预览 */}
              <div className="absolute inset-x-0 bottom-0 z-10">
                {/* 笔记预览 - 手写效果 */}
                {moment.type === 'note' && (
                  <div className="px-3 py-2 bg-white/10 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <h4 className="text-sm font-medium text-white">{moment.title}</h4>
                    </div>
                    <div className="bg-blue-50/80 backdrop-blur-sm rounded-md p-2 mb-2 transform -rotate-1 shadow-sm">
                      <p className="text-xs italic font-medium text-blue-900 line-clamp-2">{moment.description}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/80">{moment.date}</span>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-0 h-6 px-2">
                        查看笔记 <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* 音频预览 - 波形图 */}
                {moment.type === 'audio' && (
                  <div className="px-3 py-2 bg-black/30 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <h4 className="text-sm font-medium text-white">{moment.title}</h4>
                    </div>
                    <div className="h-12 bg-black/40 rounded-md p-2 flex items-center justify-center mb-2">
                      <div className="flex items-center space-x-0.5">
                        {Array.from({ length: 30 }).map((_, i) => {
                          // 创建波形效果
                          const height = 2 + Math.sin(i * 0.5) * 10 + Math.random() * 5;
                          return (
                            <div 
                              key={i} 
                              className="w-1 bg-purple-400"
                              style={{ height: `${height}px` }}
                            ></div>
                          );
                        })}
                      </div>
                      <div className="absolute right-6 bottom-14">
                        <div className="w-8 h-8 rounded-full bg-purple-600/80 flex items-center justify-center cursor-pointer hover:bg-purple-500 transition-colors">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/80">{moment.date}</span>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-0 h-6 px-2">
                        播放录音 <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* 作业预览 - 动态成长曲线 */}
                {moment.type === 'homework' && (
                  <div className="px-3 py-2 bg-black/30 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <h4 className="text-sm font-medium text-white">{moment.title}</h4>
                    </div>
                    <div className="h-12 bg-black/40 rounded-md mb-2 flex items-end justify-center p-2">
                      <div className="flex items-end space-x-1 h-full">
                        {[60, 65, 72, 68, 75, 80, 85, 82, 88, 92].map((score, i) => {
                          const height = (score / 100) * 100 + '%';
                          return (
                            <div key={i} className="relative group">
                              <div 
                                className={cn(
                                  "w-2 rounded-t-sm transition-all duration-500",
                                  i < 5 ? "bg-amber-400" : "bg-green-400"
                                )}
                                style={{ height }}
                              ></div>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {score}分
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/80">{moment.date}</span>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-0 h-6 px-2">
                        评分趋势 <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* 视频预览 */}
                {moment.type === 'video' && (
                  <div className="px-3 py-2 bg-black/30 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <h4 className="text-sm font-medium text-white">{moment.title}</h4>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/80">{moment.date}</span>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-0 h-6 px-2">
                        观看视频 <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:bg-rose-600/70 transition-colors duration-300">
                        <Play className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="bg-gray-950 rounded-lg shadow-lg overflow-hidden">
      {/* 顶部导航 - 整个学期时间轴 */}
      <div className="bg-black px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            BACK / 返回
          </Button>
        </div>
        <div className="flex items-center">
          <div className="text-xl font-bold text-white tracking-wider">
            教师成长档案
          </div>
        </div>
        <div className="text-gray-300 text-sm">
          教学历程 2021年-2023年
        </div>
      </div>
      
      {/* 学期选择器 */}
      <div className="bg-gray-900 p-4 flex items-center justify-center">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "text-xs rounded-none border-gray-700 text-gray-300",
              !selectedSemester && "bg-white/10 text-white"
            )}
            onClick={() => setSelectedSemester(null)}
          >
            ALL / 全部
          </Button>
          
          {/* 学期过滤按钮 */}
          {filmStrips.map(strip => (
            <Button 
              key={strip.semester} 
              variant="outline" 
              size="sm"
              className={cn(
                "text-xs rounded-none border-gray-700 text-gray-300",
                selectedSemester === strip.semester && "bg-white/10 text-white"
              )}
              onClick={() => handleSelectSemester(strip.semester)}
            >
              {strip.semester}
            </Button>
          ))}
        </div>
      </div>
      
      {/* 胶片墙展示区域 */}
      <div className="relative">
        <ScrollArea 
          className="w-full h-[450px] rounded-md bg-gray-900 pt-6 pb-6" 
          ref={timelineRef}
        >
          <div className="flex px-10">
            {/* 如果没有选择特定学期，显示所有学期的胶片 */}
            {!selectedSemester ? (
              filmStrips.map(strip => (
                <div
                  key={strip.semester}
                  id={`filmstrip-semester-${strip.semester}`}
                  className="flex-none pr-8 last:pr-0"
                >
                  <div className="flex flex-col">
                    {/* 学期标识 */}
                    <div className="mb-4 text-center">
                      <h3 className="text-white text-md font-semibold">{strip.semester}</h3>
                      <p className="text-gray-400 text-xs">{strip.period}</p>
                    </div>
                    
                    {/* 胶片列表 */}
                    <div className="flex space-x-6">
                      {strip.moments.map(moment => renderFilmFrame(moment))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // 显示选中学期的胶片
              <div className="w-full">
                <div className="mb-4 text-center">
                  <h3 className="text-white text-xl font-semibold">{selectedSemesterData.semester}</h3>
                  <p className="text-gray-400 text-sm">{selectedSemesterData.period}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                  {selectedSemesterData.moments.map(moment => renderFilmFrame(moment))}
                </div>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="z-30" />
        </ScrollArea>
        
        {/* 左右导航按钮 */}
        <button className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm z-30 text-white hover:bg-black/70 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm z-30 text-white hover:bg-black/70 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      {/* 内容详情 */}
      {selectedSemester && selectedSemesterData.moments.length > 0 && (
        <div className="bg-black px-8 py-6 text-center">
          <h2 className="text-white text-2xl font-semibold mb-1">{selectedSemesterData.moments[0].title}</h2>
          <p className="text-rose-500 text-sm">
            {selectedSemesterData.moments[0].subject} - {selectedSemesterData.moments[0].date}
          </p>
        </div>
      )}
      
      {/* 页脚 */}
      <div className="bg-black px-6 py-3 flex items-center justify-between text-xs text-gray-500">
        <div>© ALL RIGHTS RESERVED.</div>
        <div className="flex space-x-2">
          <span>FB</span>
          <span>/</span>
          <span>TW</span>
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
          className="fixed inset-0 z-50 bg-black flex flex-col"
        >
          <div className="p-4 flex justify-between items-center bg-black/80 backdrop-blur-sm">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCloseMemoryView}
              className="text-white hover:bg-white/10"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <h3 className="text-xl font-semibold text-white">记忆墙</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCloseMemoryView}
              className="text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <FilmStripTimeline 
              filmStrips={mockFilmStrips} 
              onMomentClick={handleMomentClick}
            />
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
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="myList" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              我的课堂列表
            </TabsTrigger>
            <TabsTrigger value="schoolList" className="flex items-center">
              <School className="mr-2 h-4 w-4" />
              全校时光
            </TabsTrigger>
          </TabsList>

          {/* 我的课堂列表 - 保持原有内容 */}
          <TabsContent value="myList" className="animate-fadeIn">
            {/* 这里保持现有的我的课堂列表JSX */}
          </TabsContent>

          {/* 全校时光 - 保持原有内容 */}
          <TabsContent value="schoolList" className="animate-fadeIn">
            {/* 这里保持现有的全校时光JSX */}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
} 