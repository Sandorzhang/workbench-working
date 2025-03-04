'use client';

import React, { useState, useEffect } from 'react';
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Search, Plus, Filter, 
  SlidersHorizontal, Download, Upload,
  LayoutDashboard, ChevronLeft, ChevronRight,
  Clock, Users, GraduationCap, CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  TitleSkeleton, 
  CardSkeleton, 
  CardGridSkeleton,
  DetailSkeleton,
  TabsSkeleton
} from "@/components/ui/skeleton-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/ui/page-container";
import { SectionContainer } from "@/components/ui/section-container";
import { CardContainer } from "@/components/ui/card-container";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { HeroSection } from "@/components/ui/hero-section";

// 模拟单元教学设计数据
const mockUnitDesign = {
  id: '1',
  title: '诗词鉴赏专题',
  subject: '初中语文',
  unit: '第一单元',
  description: '包含《静夜思》、《望岳》等经典诗词的教学设计',
  lessons: [
    {
      id: '1',
      title: '《静夜思》赏析',
      duration: '45分钟',
      grade: '初中一年级',
      targetClass: '1班',
      teacher: '张老师',
      date: '2024-03-20',
      objectives: [
        '理解诗歌的意境和情感',
        '掌握诗歌的写作特点',
        '学会鉴赏诗歌的方法'
      ],
      keyPoints: [
        '月光意象的运用',
        '思乡情感的表达',
        '诗歌的语言特色'
      ],
      activities: [
        '课前预习诗歌',
        '课堂朗读感悟',
        '小组讨论分析',
        '课后延伸练习'
      ]
    },
    {
      id: '2',
      title: '《望岳》赏析',
      duration: '45分钟',
      grade: '初中一年级',
      targetClass: '1班',
      teacher: '张老师',
      date: '2024-03-22',
      objectives: [
        '理解诗人的爱国情怀',
        '分析诗歌的表现手法',
        '感受诗歌的气势磅礴'
      ],
      keyPoints: [
        '夸张手法的运用',
        '比喻手法的分析',
        '诗歌的结构特点'
      ],
      activities: [
        '观看泰山图片',
        '诗歌朗读品味',
        '分组探讨交流',
        '写作练习'
      ]
    }
  ]
};

// 添加更多的模拟数据来展示不同状态的设计
const mockDesigns = [
  {
    id: '1',
    title: '诗词鉴赏专题',
    subject: '初中语文',
    unit: '第一单元',
    description: '包含《静夜思》、《望岳》等经典诗词的教学设计',
    status: 'published',
    lastModified: '2024-03-15',
    progress: 100,
    lessons: mockUnitDesign.lessons
  },
  {
    id: '2',
    title: '数学函数专题',
    subject: '初中数学',
    unit: '第三单元',
    description: '一次函数、二次函数的概念与应用',
    status: 'draft',
    lastModified: '2024-03-18',
    progress: 60,
    lessons: []
  },
  {
    id: '3',
    title: '物理力学专题',
    subject: '初中物理',
    unit: '第二单元',
    description: '牛顿运动定律及其应用',
    status: 'archived',
    lastModified: '2024-03-10',
    progress: 100,
    lessons: []
  }
];

interface TeachingPlanCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  design: typeof mockDesigns[0];
}

const TeachingPlanCarousel = ({ isOpen, onClose, design }: TeachingPlanCarouselProps) => {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const nextLesson = () => {
    setDirection(1);
    setCurrentLesson((prev) => 
      prev === design.lessons.length - 1 ? prev : prev + 1
    );
  };

  const previousLesson = () => {
    setDirection(-1);
    setCurrentLesson((prev) => prev === 0 ? prev : prev - 1);
  };

  if (!isOpen) return null;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      y: direction > 0 ? '-20%' : '20%',
      opacity: 0,
      scale: 0.9,
      rotateZ: direction > 0 ? 10 : -10
    }),
    center: {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      rotateZ: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      y: direction < 0 ? '-20%' : '20%',
      opacity: 0,
      scale: 0.9,
      rotateZ: direction < 0 ? 10 : -10,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    })
  };

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div 
        className="relative h-full ml-[var(--sidebar-width)]"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div 
          className="h-full flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <div className="relative w-full max-w-6xl px-20">
            {/* 左侧切换按钮 */}
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                previousLesson();
              }}
              disabled={currentLesson === 0}
              className={cn(
                "absolute -left-4 top-1/2 -translate-y-1/2 rounded-full z-50",
                "bg-white border-0 hover:bg-gray-100",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "w-12 h-12 shadow-lg"
              )}
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Button>

            {/* 右侧切换按钮 */}
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                nextLesson();
              }}
              disabled={currentLesson === design.lessons.length - 1}
              className={cn(
                "absolute -right-4 top-1/2 -translate-y-1/2 rounded-full z-50",
                "bg-white border-0 hover:bg-gray-100",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "w-12 h-12 shadow-lg"
              )}
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </Button>

            {/* 课时指示器 */}
            <div className="absolute -top-12 right-0 z-50">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white text-sm">
                  第 {currentLesson + 1} / {design.lessons.length} 课时
                </span>
              </div>
            </div>

            <div className="overflow-hidden perspective-1000">
              <AnimatePresence
                initial={false}
                custom={direction}
                mode="wait"
              >
                <motion.div
                  key={currentLesson}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="bg-white rounded-lg shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    transformOrigin: direction > 0 ? "0% 50%" : "100% 50%"
                  }}
                >
                  <div className="p-6 border-b">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center text-xl font-semibold">
                        {currentLesson + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold">
                          {design.lessons[currentLesson].title}
                        </h3>
                        <div className="flex items-center space-x-6 mt-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2" />
                            {design.lessons[currentLesson].duration}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-2" />
                            {design.lessons[currentLesson].targetClass}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <GraduationCap className="h-4 w-4 mr-2" />
                            {design.lessons[currentLesson].grade}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            {design.lessons[currentLesson].date}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary">
                        {design.lessons[currentLesson].teacher}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-3 gap-6">
                    <div className="bg-primary/5 rounded-lg p-4 h-[500px] overflow-y-auto">
                      <h4 className="font-medium mb-4 flex items-center text-primary sticky top-0 bg-primary/5 py-2">
                        <span className="bg-primary/10 rounded-full p-1 mr-2">
                          <BookOpen className="h-4 w-4" />
                        </span>
                        教学目标
                      </h4>
                      <div className="space-y-3">
                        {design.lessons[currentLesson].objectives.map((objective, index) => (
                          <div
                            key={index}
                            className="flex items-start"
                          >
                            <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 shrink-0">
                              {index + 1}
                            </span>
                            <span className="text-sm">{objective}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 h-[500px] overflow-y-auto">
                      <h4 className="font-medium mb-4 flex items-center text-blue-600 sticky top-0 bg-blue-50 py-2">
                        <span className="bg-blue-100 rounded-full p-1 mr-2">
                          <BookOpen className="h-4 w-4" />
                        </span>
                        教学重点
                      </h4>
                      <div className="space-y-3">
                        {design.lessons[currentLesson].keyPoints.map((point, index) => (
                          <div
                            key={index}
                            className="flex items-start"
                          >
                            <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 shrink-0">
                              {index + 1}
                            </span>
                            <span className="text-sm">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 h-[500px] overflow-y-auto">
                      <h4 className="font-medium mb-4 flex items-center text-green-600 sticky top-0 bg-green-50 py-2">
                        <span className="bg-green-100 rounded-full p-1 mr-2">
                          <BookOpen className="h-4 w-4" />
                        </span>
                        教学活动
                      </h4>
                      <div className="space-y-3">
                        {design.lessons[currentLesson].activities.map((activity, index) => (
                          <div
                            key={index}
                            className="p-3 bg-white rounded-lg border border-green-100 text-sm flex items-start"
                          >
                            <span className="bg-green-100 text-green-600 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 shrink-0">
                              {index + 1}
                            </span>
                            {activity}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UnitTeachingDesignPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [designs, setDesigns] = useState<typeof mockDesigns>([]);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [currentDesign, setCurrentDesign] = useState<typeof mockDesigns[0] | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  useEffect(() => {
    // 模拟API请求
    const fetchDesigns = async () => {
      try {
        // 在实际应用中，这里会从API获取数据
        const response = await fetch('/api/teaching-designs');
        
        if (response.ok) {
          const data = await response.json();
          setDesigns(data);
        }
      } catch (error) {
        console.error('Error fetching designs:', error);
      } finally {
        // 延迟设置加载状态以展示骨架屏效果
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };
    
    fetchDesigns();
  }, []);
  
  const handleViewDesign = (design: typeof mockDesigns[0]) => {
    setCurrentDesign(design);
    setIsCarouselOpen(true);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">已发布</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">草稿</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">已归档</Badge>;
      default:
        return null;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        {/* 页面标题骨架屏 */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center">
            <Skeleton className="h-14 w-14 rounded-2xl mr-6" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        {/* 主内容区骨架屏 */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-10 w-64" />
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
            
            <Skeleton className="h-10 w-full mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 页面标题区域 */}
      <HeroSection
        title="单元教学设计"
        description="管理和创建单元教学设计方案"
        icon={BookOpen}
        gradient="from-cyan-50 to-blue-50"
        actions={
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              className="h-10 rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => window.location.href = '/dashboard'}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              返回工作台
            </Button>
            <Button 
              className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              新建设计
            </Button>
          </div>
        }
      />
      
      {/* 主内容区 */}
      <div className="flex-1">
        <SectionContainer padding="standard" className="mb-0 h-full">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索单元教学设计..."
                  className="pl-10 w-full md:max-w-[400px] rounded-xl border-gray-200"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-dashed rounded-xl">
                <Filter className="mr-2 h-4 w-4" />
                筛选
              </Button>
              <Button variant="outline" size="sm" className="border-dashed rounded-xl">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                排序
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="outline" size="sm" className="border-dashed rounded-xl">
                <Upload className="mr-2 h-4 w-4" />
                导入
              </Button>
              <Button variant="outline" size="sm" className="border-dashed rounded-xl">
                <Download className="mr-2 h-4 w-4" />
                导出
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-gray-50/70 p-1 rounded-lg">
              <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">全部设计</TabsTrigger>
              <TabsTrigger value="draft" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">草稿箱</TabsTrigger>
              <TabsTrigger value="published" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">已发布</TabsTrigger>
              <TabsTrigger value="archived" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">已归档</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <ResponsiveGrid xs={1} sm={1} md={2} lg={3} gap="md">
                {designs.map((design) => (
                  <CardContainer 
                    key={design.id}
                    elevated
                    clickable
                    onClick={() => handleViewDesign(design)}
                    className="h-full hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-lg">{design.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{design.subject} · {design.unit}</p>
                          </div>
                          {getStatusBadge(design.status)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{design.description}</p>
                        
                        <div className="mt-auto">
                          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                            <span>完成度</span>
                            <span>{design.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getProgressColor(design.progress)}`}
                              style={{ width: `${design.progress}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>更新于 {design.lastModified}</span>
                            </div>
                            <div className="flex items-center">
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                查看详情
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CardContainer>
                ))}
              </ResponsiveGrid>
            </TabsContent>
            
            <TabsContent value="draft" className="space-y-4">
              <ResponsiveGrid xs={1} sm={1} md={2} lg={3} gap="md">
                {/* 草稿箱内容 */}
                {designs.filter(d => d.status === 'draft').map((design) => (
                  <CardContainer 
                    key={design.id}
                    elevated
                    clickable
                    onClick={() => handleViewDesign(design)}
                    className="h-full hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-lg">{design.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{design.subject} · {design.unit}</p>
                          </div>
                          {getStatusBadge(design.status)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{design.description}</p>
                        
                        <div className="mt-auto">
                          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                            <span>完成度</span>
                            <span>{design.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getProgressColor(design.progress)}`}
                              style={{ width: `${design.progress}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>更新于 {design.lastModified}</span>
                            </div>
                            <div className="flex items-center">
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                查看详情
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CardContainer>
                ))}
              </ResponsiveGrid>
            </TabsContent>
            
            <TabsContent value="published" className="space-y-4">
              <ResponsiveGrid xs={1} sm={1} md={2} lg={3} gap="md">
                {/* 已发布内容 */}
                {designs.filter(d => d.status === 'published').map((design) => (
                  <CardContainer 
                    key={design.id}
                    elevated
                    clickable
                    onClick={() => handleViewDesign(design)}
                    className="h-full hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-lg">{design.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{design.subject} · {design.unit}</p>
                          </div>
                          {getStatusBadge(design.status)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{design.description}</p>
                        
                        <div className="mt-auto">
                          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                            <span>完成度</span>
                            <span>{design.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getProgressColor(design.progress)}`}
                              style={{ width: `${design.progress}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>更新于 {design.lastModified}</span>
                            </div>
                            <div className="flex items-center">
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                查看详情
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CardContainer>
                ))}
              </ResponsiveGrid>
            </TabsContent>
            
            <TabsContent value="archived" className="space-y-4">
              <ResponsiveGrid xs={1} sm={1} md={2} lg={3} gap="md">
                {/* 已归档内容 */}
                {designs.filter(d => d.status === 'archived').map((design) => (
                  <CardContainer 
                    key={design.id}
                    elevated
                    clickable
                    onClick={() => handleViewDesign(design)}
                    className="h-full hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-lg">{design.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{design.subject} · {design.unit}</p>
                          </div>
                          {getStatusBadge(design.status)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{design.description}</p>
                        
                        <div className="mt-auto">
                          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                            <span>完成度</span>
                            <span>{design.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getProgressColor(design.progress)}`}
                              style={{ width: `${design.progress}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>更新于 {design.lastModified}</span>
                            </div>
                            <div className="flex items-center">
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                查看详情
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CardContainer>
                ))}
              </ResponsiveGrid>
            </TabsContent>
          </Tabs>
        </SectionContainer>
      </div>
      
      {/* 教学计划轮播图 */}
      {currentDesign && (
        <TeachingPlanCarousel
          isOpen={isCarouselOpen}
          onClose={() => {
            setIsCarouselOpen(false);
            // 可选：如果希望关闭时也清除当前选中的设计
            // setCurrentDesign(null);
          }}
          design={currentDesign}
        />
      )}
    </div>
  );
} 