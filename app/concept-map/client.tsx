'use client';

import React, { useState, useEffect } from 'react';
import { ConceptMapView } from '@/components/concept-map/concept-map-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Minimize2, Network, Plus, ArrowRight, Search, Filter, SlidersHorizontal, Map, Lightbulb, GitBranch } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { HeroSection } from '@/components/ui/hero-section';
import { PageContainer } from '@/components/ui/page-container';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ConceptMapClient() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-50/30 to-white/90 dark:from-indigo-950/20 dark:to-gray-900/90 backdrop-blur-md flex flex-col">
        <div className={cn(
          "flex justify-end p-3 border-b",
          "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
          "border-gray-100/60 dark:border-gray-800/40"
        )}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFullscreen}
            className="border-gray-200/80 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90"
          >
            <Minimize2 className="h-4 w-4 mr-1.5" />
            退出全屏
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col space-y-5 p-6">
              <div className="flex-1 min-h-[500px]">
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
            </div>
          ) : (
            <ConceptMapView isLoading={isLoading} />
          )}
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <SidebarProvider>
        <div className="flex flex-col h-full">
          {/* Hero Section */}
          <div className="mb-8">
            <HeroSection
              title="大概念地图中心"
              description="探索学科知识结构，理解概念间关联，发现不同知识点之间的联系，构建完整的知识体系框架。"
              icon={Network}
              size="md"
              iconColor="text-indigo-600"
              iconBgColor="bg-indigo-50/90"
              gradient="from-indigo-50/40 via-indigo-50/20 to-transparent"
              shadow="md"
              actions={
                <Button 
                  className="gap-1 shadow-sm"
                  onClick={toggleFullscreen}
                >
                  <Plus className="h-4 w-4" />
                  新建地图
                </Button>
              }
            />
          </div>
          
          {/* 搜索和过滤 */}
          <div className="flex items-center mb-6 space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="搜索概念地图..."
                className="pl-8 transition-all border-muted focus:border-primary"
              />
            </div>
            <Button variant="outline" className="gap-1 hover:bg-muted/50 transition-colors">
              <Filter className="h-4 w-4" />
              筛选
            </Button>
            <SidebarTrigger>
              <Button variant="outline" className="gap-1 hover:bg-muted/50 transition-colors">
                <SlidersHorizontal className="h-4 w-4" />
                高级筛选
              </Button>
            </SidebarTrigger>
          </div>
          
          {/* 内容区 */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="flex justify-between items-center">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="all" className="transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">所有地图</TabsTrigger>
                <TabsTrigger value="math" className="transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">数学</TabsTrigger>
                <TabsTrigger value="physics" className="transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">物理</TabsTrigger>
                <TabsTrigger value="biology" className="transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">生物</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-6 flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex flex-col space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Skeleton className="h-12 w-12 rounded-xl mr-4" />
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                      </div>
                      <Skeleton className="h-10 w-32 rounded-lg" />
                    </div>
                    <div className="flex-1 min-h-[500px]">
                      <Skeleton className="h-full w-full rounded-xl" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: item * 0.05 }}
                        className="border rounded-xl overflow-hidden group hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                        onClick={toggleFullscreen}
                      >
                        <div className="aspect-video bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
                          {item % 3 === 0 ? (
                            <GitBranch className="h-16 w-16 text-indigo-400/50" />
                          ) : item % 3 === 1 ? (
                            <Network className="h-16 w-16 text-indigo-400/50" />
                          ) : (
                            <Map className="h-16 w-16 text-indigo-400/50" />
                          )}
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button size="sm" variant="secondary" className="gap-1">
                              <ArrowRight className="h-3.5 w-3.5" />
                              查看地图
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-medium mb-1 group-hover:text-primary transition-colors">
                            {item % 3 === 0 ? '数学函数概念图' : item % 3 === 1 ? '物理力学体系' : '生物系统分类'}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {item % 3 === 0 ? '探索数学函数之间的内在联系' : item % 3 === 1 ? '理解力学基本概念与定律关系' : '生物分类系统与进化关系'}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>2024-03-0{item}</span>
                            <span>{item * 8 + 12} 个概念节点</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="math" className="mt-6 flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <div className="flex items-center justify-center h-[400px] border rounded-xl bg-muted/10">
                  <div className="text-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">选择此分类下的具体内容将在后续实现</p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="physics" className="mt-6 flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <div className="flex items-center justify-center h-[400px] border rounded-xl bg-muted/10">
                  <div className="text-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">选择此分类下的具体内容将在后续实现</p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="biology" className="mt-6 flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <div className="flex items-center justify-center h-[400px] border rounded-xl bg-muted/10">
                  <div className="text-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">选择此分类下的具体内容将在后续实现</p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
          
          {/* 侧边栏 */}
          <SidebarInset>
            <div className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">高级筛选</h3>
              <div className="space-y-6 flex-1">
                <div className="space-y-3">
                  <label htmlFor="subject" className="text-sm font-medium">学科</label>
                  <Input id="subject" placeholder="选择学科" />
                </div>
                <div className="space-y-3">
                  <label htmlFor="grade" className="text-sm font-medium">适用年级</label>
                  <Input id="grade" placeholder="选择年级" />
                </div>
                <div className="space-y-3">
                  <label htmlFor="complexity" className="text-sm font-medium">复杂度</label>
                  <Input id="complexity" placeholder="选择复杂度" />
                </div>
                <div className="space-y-3">
                  <label htmlFor="date" className="text-sm font-medium">创建日期</label>
                  <Input id="date" placeholder="选择日期范围" />
                </div>
              </div>
              <div className="mt-auto pt-4 space-x-2">
                <Button variant="outline">重置</Button>
                <Button>应用筛选</Button>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </PageContainer>
  );
} 