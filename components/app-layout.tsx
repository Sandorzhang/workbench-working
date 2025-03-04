'use client';

import React, { useEffect, useState } from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from '@/components/ui/separator';
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
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

// 定义页面信息接口
interface PageInfo {
  title: string;
  parent?: {
    title: string;
    path: string;
  };
}

// 页面标题映射
const pageTitleMap: Record<string, PageInfo> = {
  '/dashboard': { title: '工作台' },
  '/classroom-timemachine': { 
    title: '课堂时光机',
    parent: { title: '工作台', path: '/dashboard' }
  },
  '/unit-teaching-design': {
    title: '单元教学设计',
    parent: { title: '工作台', path: '/dashboard' }
  },
  '/mentor-hub': {
    title: '全员导师',
    parent: { title: '工作台', path: '/dashboard' }
  },
  '/ai-library': {
    title: '智能体库',
    parent: { title: '工作台', path: '/dashboard' }
  },
  '/concept-map': {
    title: '大概念地图',
    parent: { title: '工作台', path: '/dashboard' }
  },
  '/calendar': {
    title: '我的日历'
  },
  '/admin/users': {
    title: '师生信息管理',
    parent: { title: '工作台', path: '/dashboard' }
  },
  '/academic-standards': {
    title: '学业标准',
    parent: { title: '工作台', path: '/dashboard' }
  },
  '/exam-management': {
    title: '考试管理',
    parent: { title: '工作台', path: '/dashboard' }
  },
  '/exam-management/create': {
    title: '创建考试',
    parent: { title: '考试管理', path: '/exam-management' }
  },
  '/data-assets': {
    title: '数据资产管理',
    parent: { title: '工作台', path: '/dashboard' }
  },
  '/academic-journey': {
    title: '学业旅程',
    parent: { title: '工作台', path: '/dashboard' }
  },
  '/academic-journey/overview': {
    title: '班级学业概览',
    parent: { title: '学业旅程', path: '/academic-journey' }
  },
  '/academic-journey/students': {
    title: '学生学业进度',
    parent: { title: '学业旅程', path: '/academic-journey' }
  }
};

// 从cookie中获取侧边栏状态
function getSidebarStateFromCookie() {
  if (typeof document === 'undefined') return undefined;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith('sidebar_state=')) {
      const value = cookie.substring('sidebar_state='.length);
      return value === 'true';
    }
  }
  return undefined;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [sidebarState, setSidebarState] = useState<boolean | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [dynamicPageTitle, setDynamicPageTitle] = useState<string | null>(null);
  
  // 在客户端加载时读取cookie
  useEffect(() => {
    setSidebarState(getSidebarStateFromCookie());
    setMounted(true);
  }, []);

  // 处理动态路由的页面标题
  useEffect(() => {
    // 检查是否是学业标准详情页
    if (pathname.startsWith('/academic-standards/') && pathname !== '/academic-standards') {
      // 获取标准详情以获取标题
      const fetchStandardDetail = async () => {
        try {
          const standardId = pathname.split('/').pop();
          const response = await fetch(`/api/academic-standards/${standardId}`);
          if (response.ok) {
            const data = await response.json();
            setDynamicPageTitle(data.title);
          }
        } catch (error) {
          console.error('获取标准详情失败:', error);
        }
      };
      
      fetchStandardDetail();
    } 
    // 检查是否是考试编辑页
    else if (pathname.startsWith('/exam-management/edit/')) {
      const fetchExamDetail = async () => {
        try {
          const examId = pathname.split('/').pop();
          const response = await fetch(`/api/exams/${examId}`);
          if (response.ok) {
            const data = await response.json();
            setDynamicPageTitle(`编辑: ${data.name || '考试'}`);
          }
        } catch (error) {
          console.error('获取考试详情失败:', error);
        }
      };
      
      fetchExamDetail();
    }
    // 检查是否是考试详情页
    else if (pathname.startsWith('/exam-management/detail/')) {
      const fetchExamDetail = async () => {
        try {
          const examId = pathname.split('/').pop();
          const response = await fetch(`/api/exams/${examId}`);
          if (response.ok) {
            const data = await response.json();
            setDynamicPageTitle(`${data.name || '考试'}详情`);
          }
        } catch (error) {
          console.error('获取考试详情失败:', error);
        }
      };
      
      fetchExamDetail();
    }
    // 检查是否是数据资产详情页
    else if (pathname.startsWith('/data-assets/') && pathname !== '/data-assets') {
      const fetchDataAssetDetail = async () => {
        try {
          const assetId = pathname.split('/').pop();
          const response = await fetch(`/api/data-assets/${assetId}`);
          if (response.ok) {
            const data = await response.json();
            setDynamicPageTitle(data.name || '资产详情');
          }
        } catch (error) {
          console.error('获取数据资产详情失败:', error);
        }
      };
      
      fetchDataAssetDetail();
    }
    // 对于学术旅程学生详情页
    else if (pathname.startsWith('/academic-journey/students/') && pathname !== '/academic-journey/students') {
      const fetchStudentDetail = async () => {
        try {
          const studentId = pathname.split('/').pop();
          const response = await fetch(`/api/academic-journey/students/${studentId}`);
          if (response.ok) {
            const data = await response.json();
            setDynamicPageTitle(data.title || '学生学业热力图');
          }
        } catch (error) {
          console.error('获取学生详情失败:', error);
        }
      };
      
      fetchStudentDetail();
    }
    else {
      setDynamicPageTitle(null);
    }
  }, [pathname]);
  
  // 登录页不使用此布局
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // 处理动态路由的面包屑
  let pageInfo: PageInfo = { title: '页面' };
  let dynamicParent: { title: string; path: string } | null = null;
  
  // 对于学业标准详情页
  if (pathname.startsWith('/academic-standards/') && pathname !== '/academic-standards') {
    pageInfo = { 
      title: dynamicPageTitle || '标准详情',
      parent: { title: '学业标准', path: '/academic-standards' }
    };
    dynamicParent = { title: '工作台', path: '/dashboard' };
  } 
  // 对于考试编辑页
  else if (pathname.startsWith('/exam-management/edit/')) {
    pageInfo = { 
      title: dynamicPageTitle || '编辑考试',
      parent: { title: '考试管理', path: '/exam-management' }
    };
    dynamicParent = { title: '工作台', path: '/dashboard' };
  }
  // 对于考试详情页
  else if (pathname.startsWith('/exam-management/detail/')) {
    pageInfo = { 
      title: dynamicPageTitle || '考试详情',
      parent: { title: '考试管理', path: '/exam-management' }
    };
    dynamicParent = { title: '工作台', path: '/dashboard' };
  }
  // 对于数据资产详情页
  else if (pathname.startsWith('/data-assets/') && pathname !== '/data-assets') {
    pageInfo = { 
      title: dynamicPageTitle || '资产详情',
      parent: { title: '数据资产管理', path: '/data-assets' }
    };
    dynamicParent = { title: '工作台', path: '/dashboard' };
  }
  // 对于学业旅程学生详情页
  else if (pathname.startsWith('/academic-journey/students/') && pathname !== '/academic-journey/students') {
    pageInfo = { 
      title: dynamicPageTitle || '学生学业热力图',
      parent: { title: '学生学业进度', path: '/academic-journey/students' }
    };
    dynamicParent = { title: '学业旅程', path: '/academic-journey' };
  }
  else {
    // 普通静态路由
    pageInfo = pageTitleMap[pathname] || { title: '页面' };
  }

  return (
    <SidebarProvider defaultOpen={sidebarState === undefined ? true : sidebarState}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-screen w-full overflow-hidden">
          {/* 顶部面包屑栏 - 保持不变 */}
          <header className="flex h-16 shrink-0 items-center bg-white border-b border-gray-100/80 px-6 shadow-sm w-full">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-gray-500 hover:text-gray-700 transition-colors" />
              <Separator orientation="vertical" className="mx-4 h-5" />
              <Breadcrumb>
                <BreadcrumbList>
                  {dynamicParent && (
                    <>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href={dynamicParent.path} className="text-gray-500 hover:text-gray-900 font-medium">
                          {dynamicParent.title}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block text-gray-400" />
                    </>
                  )}
                  {pageInfo.parent && (
                    <>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href={pageInfo.parent.path} className="text-gray-500 hover:text-gray-900 font-medium">
                          {pageInfo.parent.title}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block text-gray-400" />
                    </>
                  )}
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-gray-900 font-semibold">{pageInfo.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          
          {/* 优化后的主内容区域 */}
          <main 
            className={cn(
              "flex-1 w-full overflow-auto", 
              !mounted && "opacity-0", // 在客户端挂载前隐藏内容，避免闪烁
              mounted && "animate-fadeIn"
            )}
            style={{ 
              height: 'calc(100vh - 64px)',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0,0,0,0.1) transparent'
            }}
          >
            <div className="min-h-full w-full bg-gradient-to-b from-[#f8f9fc] to-[#f3f5fa]">
              {/* 自适应容器 */}
              <div 
                className={cn(
                  "mx-auto w-full transition-all duration-300 ease-in-out px-4 sm:px-6 md:px-8 py-6",
                  // 在不同断点下调整max-width
                  "max-w-full lg:max-w-[1280px] xl:max-w-[1536px] 2xl:max-w-[1840px]",
                )}
              >
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 