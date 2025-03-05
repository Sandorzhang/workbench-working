"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Users, School,
  MapPin, LayoutDashboard, 
  Settings, Shield, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { 
  SidebarContent, 
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// 侧边栏导航项类型
interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  color?: string;
}

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // 侧边栏导航项
  const sidebarNavItems: SidebarItem[] = [
    {
      title: "仪表盘",
      href: "/superadmin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "用户管理",
      href: "/superadmin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "租户管理",
      href: "/superadmin/schools",
      icon: <School className="h-5 w-5" />,
    },
    {
      title: "区域管理",
      href: "/superadmin/regions",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      title: "系统设置",
      href: "/superadmin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: "返回主页",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
  ];

  // 处理登出
  const handleLogout = async () => {
    try {
      console.log('开始退出登录流程');
      
      // 调用登出函数
      await logout();
      
      // 导航到登录页
      console.log('退出成功，重定向到登录页');
      router.push('/login');
    } catch (error) {
      console.error('登出处理失败:', error);
      // 即使失败也尝试跳转到登录页
      router.push('/login');
    }
  };

  return (
    <>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">超级管理员</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarMenu>
            {sidebarNavItems.map((item, index) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <SidebarMenuItem key={index} className="px-3">
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3"
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t px-3 py-4">
        <div className="flex items-center space-x-3 p-3 rounded-md bg-muted/50 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholders/user.svg" alt={user?.name || "用户"} />
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || "超级管理员"}</p>
            <p className="text-xs text-muted-foreground">系统最高管理员</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
      </SidebarFooter>
    </>
  );
} 