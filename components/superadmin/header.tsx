"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { 
  Bell, 
  Search, 
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function SuperAdminHeader() {
  const { logout } = useAuth();
  const pathname = usePathname();

  // 面包屑路径映射
  const getBreadcrumbItems = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) {
      return null;
    }
    
    const items = [];
    
    // 添加根路径
    if (pathSegments[0] === 'superadmin') {
      items.push({
        label: '超级管理控制台',
        href: '/superadmin',
        current: pathSegments.length === 1
      });
    }
    
    // 添加中间路径
    if (pathSegments.length > 1) {
      const segmentMap: {[key: string]: string} = {
        'users': '用户管理',
        'schools': '学校管理',
        'regions': '区域管理',
        'permissions': '权限管理'
      };
      
      const segment = pathSegments[1];
      const label = segmentMap[segment] || segment;
      
      items.push({
        label,
        href: `/${pathSegments[0]}/${segment}`,
        current: pathSegments.length === 2
      });
    }
    
    // 添加详情页
    if (pathSegments.length > 2) {
      items.push({
        label: '详情',
        href: pathname,
        current: true
      });
    }
    
    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <header className="flex h-16 shrink-0 items-center bg-white border-b border-gray-100/80 px-6 shadow-sm w-full">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-gray-500 hover:text-gray-700 transition-colors" />
        <Separator orientation="vertical" className="mx-4 h-5" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard" className="text-gray-500 hover:text-gray-900 font-medium">
                工作台
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block text-gray-400" />
            {breadcrumbItems && breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <BreadcrumbSeparator className="text-gray-400" />}
                <BreadcrumbItem>
                  {item.current ? (
                    <BreadcrumbPage className="text-gray-900 font-semibold">{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href} className="text-gray-500 hover:text-gray-900 font-medium">
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden lg:flex w-full max-w-sm items-center">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="全局搜索..."
            className="w-full bg-background pl-8 md:w-[260px] lg:w-[320px]"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600"></span>
        </Button>
      </div>
    </header>
  );
} 