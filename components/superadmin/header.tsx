"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { 
  Bell, 
  Search, 
  Settings, 
  User,
  LogOut,
  Shield,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Badge } from "@/components/ui/badge";

export default function SuperAdminHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // 简单的面包屑路径映射
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
        'schools': '租户管理',
        'regions': '区域管理',
        'settings': '系统设置'
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  return (
    <header className="flex flex-col h-auto shrink-0 bg-white border-b border-gray-100 w-full shadow-sm">
      {/* 主要标题栏 */}
      <div className="flex items-center px-6 h-16">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-gray-500 hover:text-gray-700 transition-colors" />
          <Separator orientation="vertical" className="mx-4 h-5" />
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            <span className="font-semibold text-lg text-red-500 hidden md:inline-block">
              超级管理控制台
            </span>
            <Badge variant="destructive" className="ml-2 hidden md:flex">受限区域</Badge>
          </div>
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2 border border-transparent hover:border-gray-200 hover:bg-gray-50">
                <Avatar className="h-8 w-8 border-2 border-red-100">
                  <AvatarImage src="/placeholders/user.svg" alt={user?.name || "用户"} />
                  <AvatarFallback className="bg-red-50 text-red-500">SA</AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium">{user?.name || "管理员"}</p>
                  <p className="text-xs text-muted-foreground">超级管理员</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>我的账户</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>个人资料</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>系统设置</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* 面包屑导航 */}
      {breadcrumbItems && (
        <div className="px-6 py-2 border-t border-gray-100 bg-gray-50">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {item.current ? (
                      <BreadcrumbPage className="font-medium text-red-500">{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
    </header>
  );
} 