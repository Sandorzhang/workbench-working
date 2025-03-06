"use client"

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  Settings,
  User,
  Loader2,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function NavUserAuth({
  user,
  onLogout,
}: {
  user?: {
    name: string
    email: string
    avatar: string
    role: string
  }
  onLogout?: () => Promise<void>
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // 确保组件在客户端挂载后才执行渲染逻辑
  useEffect(() => {
    setIsMounted(true);
    
    // 检查用户状态并记录日志
    if (user) {
      console.log('侧边栏用户信息已加载:', user.name);
    } else {
      console.log('用户未登录或信息未加载');
    }
  }, [user]);
  
  // 用户角色显示文本
  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      'superadmin': '超级管理员',
      'admin': '管理员',
      'teacher': '教师',
    };
    
    return roleMap[role] || role;
  };
  
  // 登出处理函数
  const handleLogout = async () => {
    if (isLoggingOut) return; // 防止重复点击
    
    try {
      setIsLoggingOut(true);
      console.log('开始登出流程...');
      
      if (onLogout) {
        // 调用上下文中的登出函数，让它处理token清除
        await onLogout();
        console.log('登出成功，由auth上下文处理token清除');
        
        // 使用setTimeout确保状态更新完成后再导航
        setTimeout(() => {
          router.push('/login');
        }, 200);
      } else {
        console.log('登出功能已禁用');
        toast.info('当前处于演示模式，登出功能已禁用');
      }
    } catch (error) {
      console.error('登出失败:', error);
      toast.error('登出失败，请稍后再试');
      // 失败时也要重置登出状态
      setIsLoggingOut(false);
    }
  };

  // 如果组件尚未挂载，返回空内容
  if (!isMounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center p-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="ml-3 space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // 如果没有用户，显示登录按钮
  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => {
              console.log('点击登录按钮，导航到登录页面');
              router.push('/login');
            }}
          >
            <User className="mr-2 h-4 w-4" />
            登录
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{user.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{user.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                  <Badge variant="outline" className="mt-1 text-[10px] py-0 w-fit">
                    {getRoleDisplay(user.role)}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              个人设置
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              disabled={isLoggingOut}
              className="text-red-500 cursor-pointer hover:bg-red-50 focus:bg-red-50"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  退出中...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

// 骨架屏组件
function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
} 