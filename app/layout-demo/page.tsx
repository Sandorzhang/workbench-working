'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/ui/page-container';
import { SectionContainer } from '@/components/ui/section-container';
import { CardContainer } from '@/components/ui/card-container';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { 
  PlusCircle, 
  LayoutGrid, 
  Grid2X2,
  Box, 
  SlidersHorizontal, 
  ChevronDown, 
  Info, 
  Settings,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export default function LayoutDemoPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('grid');
  
  // 模拟加载状态
  const toggleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };
  
  return (
    <PageContainer
      title="布局系统演示"
      description="本页面展示项目中的各种布局组件及其用法"
      loading={loading}
      actions={
        <Button variant="outline" size="sm" onClick={toggleLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          模拟加载
        </Button>
      }
    >
      <Tabs defaultValue="components" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="components">布局组件</TabsTrigger>
          <TabsTrigger value="patterns">常用布局模式</TabsTrigger>
          <TabsTrigger value="responsive">响应式行为</TabsTrigger>
        </TabsList>
        
        <TabsContent value="components" className="space-y-6">
          {/* 布局组件展示 */}
          <SectionContainer
            title="页面容器组件 (PageContainer)"
            description="用于页面最外层的包装，提供一致的页面结构"
            divider
          >
            <div className="text-sm text-gray-600">
              <p>PageContainer 组件是页面的最外层容器，提供：</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>页面标题和描述</li>
                <li>操作按钮区域</li>
                <li>内容区域的不同布局模式 (stack, grid, split)</li>
                <li>内置的加载状态和骨架屏</li>
              </ul>
            </div>
          </SectionContainer>
          
          <SectionContainer
            title="区块容器组件 (SectionContainer)"
            description="用于将页面内容划分为不同的区块，每个区块可以有自己的标题和操作区"
            actions={
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            }
            divider
          >
            <div className="text-sm text-gray-600">
              <p>SectionContainer 组件用于划分页面内容，提供：</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>区块标题和描述</li>
                <li>可选的分隔线</li>
                <li>可折叠功能</li>
                <li>自定义内边距</li>
                <li>操作按钮区域</li>
              </ul>
            </div>
          </SectionContainer>
          
          <SectionContainer
            title="卡片容器组件 (CardContainer)"
            description="用于展示具体内容的卡片"
            collapsible={true}
            defaultOpen={true}
            divider
          >
            <ResponsiveGrid xs={1} sm={2} md={3} gap="md">
              <CardContainer
                title="基本卡片"
                description="展示基础信息的卡片"
              >
                <div className="py-4">
                  <p className="text-sm text-gray-600">卡片内容区域</p>
                </div>
              </CardContainer>
              
              <CardContainer
                title="带操作的卡片"
                description="右上角带有操作按钮"
                actions={
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                }
              >
                <div className="py-4">
                  <p className="text-sm text-gray-600">卡片内容区域</p>
                </div>
              </CardContainer>
              
              <CardContainer
                title="带底部的卡片"
                description="底部区域可以放置额外信息或操作"
                elevated={true}
                footer={
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">标签</Badge>
                    <Button variant="ghost" size="sm">查看详情</Button>
                  </div>
                }
              >
                <div className="py-4">
                  <p className="text-sm text-gray-600">卡片内容区域</p>
                </div>
              </CardContainer>
            </ResponsiveGrid>
          </SectionContainer>
          
          <SectionContainer
            title="响应式网格组件 (ResponsiveGrid)"
            description="用于创建响应式网格布局，可以根据屏幕大小自动调整列数"
            divider
          >
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  variant={activeTab === 'grid' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('grid')}
                >
                  <Grid2X2 className="mr-2 h-4 w-4" />
                  等宽网格
                </Button>
                <Button
                  variant={activeTab === 'dense' ? 'default' : 'outline'} 
                  onClick={() => setActiveTab('dense')}
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  密集网格
                </Button>
                <Select defaultValue="md">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="网格间距" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">超小间距</SelectItem>
                    <SelectItem value="sm">小间距</SelectItem>
                    <SelectItem value="md">中等间距</SelectItem>
                    <SelectItem value="lg">大间距</SelectItem>
                    <SelectItem value="xl">超大间距</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {activeTab === 'grid' && (
                <ResponsiveGrid xs={1} sm={2} md={3} lg={3} xl={4} gap="md">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-md h-24 flex items-center justify-center text-sm text-gray-500">
                      网格项 {i + 1}
                    </div>
                  ))}
                </ResponsiveGrid>
              )}
              
              {activeTab === 'dense' && (
                <ResponsiveGrid xs={2} sm={4} md={6} gap="sm">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-md h-16 flex items-center justify-center text-sm text-gray-500">
                      项 {i + 1}
                    </div>
                  ))}
                </ResponsiveGrid>
              )}
            </div>
          </SectionContainer>
        </TabsContent>
        
        <TabsContent value="patterns" className="space-y-6">
          {/* 常用布局模式 */}
          <SectionContainer
            title="仪表盘布局"
            description="适用于数据展示和概览页面"
            divider
          >
            <div className="space-y-6">
              <ResponsiveGrid xs={1} sm={2} md={4} gap="md">
                {['用户总数', '活跃用户', '今日新增', '转化率'].map((title, i) => (
                  <CardContainer
                    key={i}
                    elevated
                    padding="relaxed"
                  >
                    <div className="flex flex-col items-center text-center">
                      <p className="text-gray-500 text-sm">{title}</p>
                      <p className="text-3xl font-semibold mt-2">{Math.floor(Math.random() * 1000)}</p>
                      <p className="text-xs text-green-600 mt-1">+{Math.floor(Math.random() * 10)}% 增长</p>
                    </div>
                  </CardContainer>
                ))}
              </ResponsiveGrid>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CardContainer
                  title="详细数据"
                  description="最近30天的统计信息"
                  className="lg:col-span-2"
                >
                  <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center">
                    图表区域
                  </div>
                </CardContainer>
                
                <CardContainer
                  title="活动记录"
                  description="最近的系统活动"
                >
                  <div className="space-y-3 py-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex-shrink-0"></div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">活动 #{i + 1}</p>
                          <p className="text-xs text-gray-500">2小时前</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContainer>
              </div>
            </div>
          </SectionContainer>
          
          <SectionContainer
            title="管理界面布局"
            description="适用于数据管理和CRUD操作"
            divider
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Select defaultValue="name">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="排序方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">名称</SelectItem>
                      <SelectItem value="date">日期</SelectItem>
                      <SelectItem value="status">状态</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="筛选" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="active">活跃</SelectItem>
                      <SelectItem value="inactive">非活跃</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  新建
                </Button>
              </div>
              
              <div className="border rounded-lg divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-md bg-gray-100 flex-shrink-0"></div>
                      <div className="ml-4">
                        <p className="font-medium">项目 #{i + 1}</p>
                        <p className="text-sm text-gray-500">项目描述信息</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">编辑</Button>
                      <Button variant="outline" size="sm">查看</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionContainer>
        </TabsContent>
        
        <TabsContent value="responsive" className="space-y-6">
          {/* 响应式行为展示 */}
          <SectionContainer
            title="响应式断点"
            description="项目使用的响应式断点设计"
            divider
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CardContainer title="移动设备 (<640px)">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">断点名称</span>
                    <span className="text-sm">默认 (xs)</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">CSS媒体查询</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">@media (max-width: 639px)</code>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">侧边栏行为</span>
                    <span className="text-sm">抽屉模式</span>
                  </div>
                </CardContainer>
                
                <CardContainer title="平板设备 (≥640px)">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">断点名称</span>
                    <span className="text-sm">sm</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">CSS媒体查询</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">@media (min-width: 640px)</code>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">侧边栏行为</span>
                    <span className="text-sm">图标模式/抽屉模式</span>
                  </div>
                </CardContainer>
                
                <CardContainer title="中等设备 (≥768px)">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">断点名称</span>
                    <span className="text-sm">md</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">CSS媒体查询</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">@media (min-width: 768px)</code>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">侧边栏行为</span>
                    <span className="text-sm">展开模式/图标模式</span>
                  </div>
                </CardContainer>
                
                <CardContainer title="桌面设备 (≥1024px)">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">断点名称</span>
                    <span className="text-sm">lg</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">CSS媒体查询</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">@media (min-width: 1024px)</code>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">内容区域</span>
                    <span className="text-sm">可展示更多列</span>
                  </div>
                </CardContainer>
                
                <CardContainer title="大屏设备 (≥1280px)">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">断点名称</span>
                    <span className="text-sm">xl</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">CSS媒体查询</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">@media (min-width: 1280px)</code>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">内容最大宽度</span>
                    <span className="text-sm">1536px</span>
                  </div>
                </CardContainer>
                
                <CardContainer title="超大屏幕 (≥1536px)">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">断点名称</span>
                    <span className="text-sm">2xl</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">CSS媒体查询</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">@media (min-width: 1536px)</code>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">内容最大宽度</span>
                    <span className="text-sm">1840px</span>
                  </div>
                </CardContainer>
              </div>
            </div>
          </SectionContainer>
          
          <SectionContainer
            title="自适应布局"
            description="布局组件的响应式表现"
            divider
          >
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded text-sm text-yellow-800 mb-6">
              <div className="flex">
                <Info className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>调整浏览器窗口大小，观察以下组件在不同断点下的布局变化</p>
              </div>
            </div>
            
            <ResponsiveGrid xs={1} md={2} gap="lg">
              <CardContainer title="ResponsiveGrid 组件">
                <div className="space-y-3 py-2">
                  <p className="text-sm">不同断点下的列数设置:</p>
                  <ul className="text-xs space-y-2">
                    <li><strong>xs: </strong>1列 (默认移动设备)</li>
                    <li><strong>sm: </strong>2列 (≥640px)</li>
                    <li><strong>md: </strong>3列 (≥768px)</li>
                    <li><strong>lg: </strong>4列 (≥1024px)</li>
                    <li><strong>xl: </strong>6列 (≥1280px)</li>
                  </ul>
                </div>
              </CardContainer>
              
              <CardContainer title="CardContainer 组件">
                <div className="space-y-3 py-2">
                  <p className="text-sm">响应式行为:</p>
                  <ul className="text-xs space-y-2">
                    <li>标题区域在移动设备上会垂直排列</li>
                    <li>标题和操作按钮在平板及以上会水平排列</li>
                    <li>内边距会在更大屏幕上适当增加</li>
                  </ul>
                </div>
              </CardContainer>
            </ResponsiveGrid>
          </SectionContainer>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
} 