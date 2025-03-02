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

// 页面标题映射
const pageTitleMap: Record<string, { title: string, parent?: { title: string, path: string } }> = {
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
    title: '全员导师制',
    parent: { title: '工作台', path: '/dashboard' }
  },
  '/calendar': {
    title: '我的日历'
  },
  '/admin/users': {
    title: '师生信息管理',
    parent: { title: '工作台', path: '/dashboard' }
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
  
  // 在客户端加载时读取cookie
  useEffect(() => {
    setSidebarState(getSidebarStateFromCookie());
    setMounted(true);
  }, []);
  
  // 登录页不使用此布局
  if (pathname === '/login') {
    return <>{children}</>;
  }
  
  const pageInfo = pageTitleMap[pathname] || { title: '页面' };
  
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