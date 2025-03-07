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
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Search, Plus, Filter, 
  SlidersHorizontal, Download, Upload,
  LayoutDashboard, ChevronLeft, ChevronRight,
  Clock, Users, GraduationCap, CalendarDays,
  FileText, Book, Pencil, Play
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from '@/lib/utils';
import { 
  TitleSkeleton, 
  CardSkeleton, 
  CardGridSkeleton,
  DetailSkeleton,
  TabsSkeleton
} from "@/components/ui/skeleton-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/ui/page-container";
import { api } from '@/shared/api';
import { toast } from "sonner";

// 模拟单元教案数据
const mockDesigns = [
  {
    id: "1",
    title: "二次函数及其应用",
    subject: "数学",
    grade: "九年级",
    author: "张丽",
    lastModified: "2023-05-15",
    progress: 100,
    status: "已完成",
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    description: "本单元教案涵盖二次函数的基本概念、图像特征、应用场景等内容，通过丰富的例题和练习，帮助学生掌握二次函数的核心知识点。",
    lessons: [
      { id: "1-1", title: "二次函数基本概念", duration: "45分钟", type: "理论课" },
      { id: "1-2", title: "二次函数图像与性质", duration: "90分钟", type: "理论课" },
      { id: "1-3", title: "二次函数应用问题", duration: "45分钟", type: "实践课" },
      { id: "1-4", title: "二次函数综合练习", duration: "45分钟", type: "复习课" }
    ],
    objectives: [
      "理解二次函数的定义和基本性质",
      "掌握二次函数图像的绘制方法",
      "能够运用二次函数解决实际问题"
    ],
    resources: [
      { name: "教学课件", type: "PPT", size: "2.5MB" },
      { name: "练习题集", type: "PDF", size: "1.2MB" },
      { name: "教学视频", type: "MP4", size: "45MB" }
    ]
  },
  // ... [保留其他模拟数据] ...
];

interface TeachingPlanCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  design: typeof mockDesigns[0];
}

// 单课教案轮播组件
const TeachingPlanCarousel = ({ isOpen, onClose, design }: TeachingPlanCarouselProps) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  
  const nextLesson = () => {
    if (currentLessonIndex < design.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };
  
  const previousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">单课教案 - {design.lessons[currentLessonIndex]?.title}</DialogTitle>
          <DialogDescription>
            {design.title} 系列教案 ({currentLessonIndex + 1}/{design.lessons.length})
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {design.lessons[currentLessonIndex]?.duration}
            </Badge>
            <Badge variant={design.lessons[currentLessonIndex]?.type === "理论课" ? "default" : "secondary"} className="flex items-center gap-1">
              {design.lessons[currentLessonIndex]?.type === "理论课" ? <BookOpen className="h-3 w-3" /> : <Users className="h-3 w-3" />}
              {design.lessons[currentLessonIndex]?.type}
            </Badge>
          </div>
          
          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold mb-2">教学目标</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>掌握{design.lessons[currentLessonIndex]?.title}的核心概念</li>
              <li>能够解决相关的基础问题</li>
              <li>培养学生的逻辑思维和应用能力</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold mb-2">教学重点与难点</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-md font-medium text-primary">教学重点</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                  <li>{design.lessons[currentLessonIndex]?.title}的基本概念</li>
                  <li>典型例题分析与解法</li>
                </ul>
              </div>
              <div>
                <h4 className="text-md font-medium text-primary">教学难点</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                  <li>复杂应用场景的分析</li>
                  <li>解题思路的形成与表达</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold mb-2">教学流程</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                <Badge variant="outline">5分钟</Badge>
                <div>
                  <h4 className="font-medium">课前导入</h4>
                  <p className="text-sm text-muted-foreground">复习上节课内容，引入新的教学主题</p>
                </div>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                <Badge variant="outline">20分钟</Badge>
                <div>
                  <h4 className="font-medium">新知识讲解</h4>
                  <p className="text-sm text-muted-foreground">讲解{design.lessons[currentLessonIndex]?.title}的核心内容</p>
                </div>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                <Badge variant="outline">15分钟</Badge>
                <div>
                  <h4 className="font-medium">例题分析</h4>
                  <p className="text-sm text-muted-foreground">通过典型例题巩固所学知识</p>
                </div>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                <Badge variant="outline">5分钟</Badge>
                <div>
                  <h4 className="font-medium">小结与布置作业</h4>
                  <p className="text-sm text-muted-foreground">总结本节课内容，布置相关练习</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex items-center justify-between sm:justify-between mt-6">
          <Button
            variant="outline"
            onClick={previousLesson}
            disabled={currentLessonIndex === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            上一课
          </Button>
          <Button
            variant="outline"
            onClick={nextLesson}
            disabled={currentLessonIndex === design.lessons.length - 1}
            className="flex items-center gap-1"
          >
            下一课
            <ChevronRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 添加创建单元教案对话框组件
interface CreateTeachingDesignDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTeachingDesignDialog = ({ isOpen, onClose }: CreateTeachingDesignDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade: '',
    description: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 处理文件上传逻辑
    console.log('File selected:', e.target.files);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 调用API创建单元教案
    try {
      await api.teachingDesigns.create({
        ...formData,
        status: '进行中',
        progress: 0,
        lessons: [],
        lastModified: new Date().toISOString().split('T')[0]
      });
      
      toast.success('单元教案创建成功！');
      onClose();
    } catch (error) {
      console.error('创建失败:', error);
      toast.error('创建单元教案失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>新建单元教案</DialogTitle>
          <DialogDescription>
            填写以下信息创建新的单元教案
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="title">单元教案名称</Label>
            <Input 
              id="title" 
              name="title"
              placeholder="请输入单元教案名称" 
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="subject">学科</Label>
              <Input 
                id="subject" 
                name="subject"
                placeholder="请选择学科" 
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="grade">年级</Label>
              <Input 
                id="grade" 
                name="grade"
                placeholder="请选择年级" 
                value={formData.grade}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="description">教案描述</Label>
            <Input 
              id="description" 
              name="description"
              placeholder="请简要描述本单元教案内容" 
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="cover">封面图片</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="cover" 
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground">推荐上传16:9比例的图片，最大2MB</p>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="gap-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  创建中...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  创建教案
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function TeachingDesignPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [designs, setDesigns] = useState<typeof mockDesigns>([]);
  const [currentView, setCurrentView] = useState<string>('grid');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<typeof mockDesigns[0] | null>(null);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchDesigns = async () => {
      // 实际API请求
      try {
        setIsLoading(true);
        const response: any = await api.teachingDesigns.getList();
        setDesigns(response.data || []);
        // 如果API返回的数据为空，使用模拟数据
        if (!response.data || response.data.length === 0) {
          console.log('API返回的单元教案数据为空，使用模拟数据');
          setDesigns(mockDesigns);
        }
      } catch (error) {
        console.error('获取单元教案数据失败:', error);
        toast.error('获取单元教案数据失败');
        // 出错时使用模拟数据
        setDesigns(mockDesigns);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDesigns();
  }, []);
  
  const handleViewDesign = (design: typeof mockDesigns[0]) => {
    setSelectedDesign(design);
    setDialogOpen(true);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case '已完成':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">{status}</Badge>;
      case '进行中':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">{status}</Badge>;
      case '待开始':
        return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-orange-500';
  };
  
  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <TitleSkeleton />
            <Skeleton className="h-10 w-32" />
          </div>
          <TabsSkeleton />
          <CardGridSkeleton count={3} />
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <SidebarProvider>
        <div className="flex flex-col h-full">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">单元教案</h1>
              <Breadcrumb className="mt-2">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/workbench">工作台</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>单元教案</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Button className="gap-1" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              新建教案
            </Button>
          </div>
          
          {/* 搜索和过滤 */}
          <div className="flex items-center mb-6 space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="搜索单元教案..."
                className="pl-8"
              />
            </div>
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4" />
              筛选
            </Button>
            <SidebarTrigger>
              <Button variant="outline" className="gap-1">
                <SlidersHorizontal className="h-4 w-4" />
                高级筛选
              </Button>
            </SidebarTrigger>
          </div>
          
          {/* 内容区 */}
          <Tabs defaultValue="all" className="flex-1">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">全部教案</TabsTrigger>
                <TabsTrigger value="mine">我创建的</TabsTrigger>
                <TabsTrigger value="shared">共享给我的</TabsTrigger>
                <TabsTrigger value="recent">最近浏览</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant={currentView === 'grid' ? 'default' : 'outline'} 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setCurrentView('grid')}
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
                <Button 
                  variant={currentView === 'list' ? 'default' : 'outline'} 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setCurrentView('list')}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <TabsContent value="all" className="mt-6">
              {currentView === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {designs.map((design) => (
                    <Card 
                      key={design.id} 
                      className="overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => handleViewDesign(design)}
                    >
                      <div className="aspect-video w-full relative overflow-hidden">
                        <img 
                          src={design.coverImage} 
                          alt={design.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        {getStatusBadge(design.status)}
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                            {design.title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                          <Badge variant="outline" className="font-normal">
                            {design.subject}
                          </Badge>
                          <Badge variant="outline" className="font-normal">
                            {design.grade}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{design.lastModified}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Book className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{design.lessons.length} 课时</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">完成进度</span>
                            <span className="font-medium">{design.progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${getProgressColor(design.progress)}`}
                              style={{ width: `${design.progress}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="border rounded-md divide-y">
                  {designs.map((design) => (
                    <div 
                      key={design.id} 
                      className="flex items-center p-4 hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleViewDesign(design)}
                    >
                      <div className="mr-4 h-12 w-12 overflow-hidden rounded-md">
                        <img 
                          src={design.coverImage} 
                          alt={design.title}
                          className="object-cover h-full w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium">{design.title}</h3>
                          <div className="ml-2">
                            {getStatusBadge(design.status)}
                          </div>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <span className="mr-3">{design.subject} · {design.grade}</span>
                          <span className="mr-3">{design.lessons.length} 课时</span>
                          <span>更新于 {design.lastModified}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-4 font-normal">
                          {design.author}
                        </Badge>
                        <div className="w-24">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">进度</span>
                            <span>{design.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${getProgressColor(design.progress)}`}
                              style={{ width: `${design.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="mine" className="mt-6">
              <div className="flex items-center justify-center h-40 border rounded-md">
                <p className="text-muted-foreground">我创建的教案将显示在这里</p>
              </div>
            </TabsContent>
            
            <TabsContent value="shared" className="mt-6">
              <div className="flex items-center justify-center h-40 border rounded-md">
                <p className="text-muted-foreground">共享给我的教案将显示在这里</p>
              </div>
            </TabsContent>
            
            <TabsContent value="recent" className="mt-6">
              <div className="flex items-center justify-center h-40 border rounded-md">
                <p className="text-muted-foreground">最近浏览的教案将显示在这里</p>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* 侧边栏 */}
          <SidebarInset>
            <div className="h-full flex flex-col p-6">
              <h2 className="text-lg font-semibold mb-4">高级筛选</h2>
              <div className="space-y-4">
                <div>
                  <Label>学科</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">数学</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">语文</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">英语</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">物理</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">化学</Badge>
                  </div>
                </div>
                <div>
                  <Label>年级</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">七年级</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">八年级</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">九年级</Badge>
                  </div>
                </div>
                <div>
                  <Label>创建者</Label>
                  <Input className="mt-2" placeholder="输入创建者姓名" />
                </div>
                <div>
                  <Label>创建日期</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input type="date" className="col-span-1" />
                    <Input type="date" className="col-span-1" />
                  </div>
                </div>
                <div>
                  <Label>状态</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">已完成</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">进行中</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">待开始</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-4 space-x-2">
                <Button variant="outline">重置</Button>
                <Button>应用筛选</Button>
              </div>
            </div>
          </SidebarInset>
        </div>
        
        {/* 教案详情对话框 */}
        {selectedDesign && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl">{selectedDesign.title}</DialogTitle>
                  {getStatusBadge(selectedDesign.status)}
                </div>
                <DialogDescription className="flex items-center gap-2">
                  <Badge variant="outline" className="font-normal">
                    {selectedDesign.subject}
                  </Badge>
                  <Badge variant="outline" className="font-normal">
                    {selectedDesign.grade}
                  </Badge>
                  <span className="text-muted-foreground">创建者: {selectedDesign.author}</span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-6">
                <div className="aspect-video overflow-hidden rounded-lg border">
                  <img 
                    src={selectedDesign.coverImage} 
                    alt={selectedDesign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">教案描述</h3>
                  <p className="text-muted-foreground">{selectedDesign.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">教学目标</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {selectedDesign.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">课时安排</h3>
                    <Badge variant="outline" className="font-normal">
                      共 {selectedDesign.lessons.length} 课时
                    </Badge>
                  </div>
                  <div className="border rounded-lg divide-y">
                    {selectedDesign.lessons.map((lesson) => (
                      <div 
                        key={lesson.id} 
                        className="p-4 flex items-center justify-between hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedDesign(selectedDesign);
                          setLessonDialogOpen(true);
                        }}
                      >
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Pencil className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{lesson.title}</h4>
                            <p className="text-sm text-muted-foreground">{lesson.type}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-normal flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.duration}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">教学资源</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {selectedDesign.resources.map((resource, index) => (
                      <div 
                        key={index} 
                        className="flex items-center p-3 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          {resource.type === 'PDF' && <FileText className="h-5 w-5 text-primary" />}
                          {resource.type === 'PPT' && <LayoutDashboard className="h-5 w-5 text-primary" />}
                          {resource.type === 'MP4' && <Play className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{resource.name}</p>
                          <p className="text-sm text-muted-foreground">{resource.type} · {resource.size}</p>
                        </div>
                        <Download className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button variant="outline" className="gap-1">
                  <Download className="h-4 w-4" />
                  下载教案
                </Button>
                <Button className="gap-1">
                  <Pencil className="h-4 w-4" />
                  编辑教案
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* 单课教案轮播对话框 */}
        {selectedDesign && (
          <TeachingPlanCarousel 
            isOpen={lessonDialogOpen}
            onClose={() => setLessonDialogOpen(false)}
            design={selectedDesign}
          />
        )}
        
        {/* 创建单元教案对话框 */}
        <CreateTeachingDesignDialog 
          isOpen={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
        />
      </SidebarProvider>
    </PageContainer>
  );
} 