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
import { Badge } from "@/components/ui/badge";

// 侧边栏导航项类型
interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  color?: string;
  badge?: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
}

// 导航分组类型
interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // 侧边栏导航分组
  const sidebarNavGroups: SidebarGroup[] = [
    {
      title: "核心功能",
      items: [
        {
          title: "控制台",
          href: "/superadmin",
          icon: <LayoutDashboard className="h-5 w-5 text-indigo-500" />,
        },
        {
          title: "用户管理",
          href: "/superadmin/users",
          icon: <Users className="h-5 w-5 text-blue-500" />,
          badge: "8",
          variant: "default"
        }
      ]
    },
    {
      title: "租户管理",
      items: [
        {
          title: "学校管理",
          href: "/superadmin/schools",
          icon: <School className="h-5 w-5 text-emerald-500" />,
          badge: "3",
          variant: "secondary"
        },
        {
          title: "区域管理",
          href: "/superadmin/regions",
          icon: <MapPin className="h-5 w-5 text-amber-500" />,
          badge: "2",
          variant: "outline"
        }
      ]
    },
    {
      title: "系统",
      items: [
        {
          title: "系统设置",
          href: "/superadmin/settings",
          icon: <Settings className="h-5 w-5 text-slate-500" />,
        },
        {
          title: "返回主页",
          href: "/",
          icon: <Home className="h-5 w-5 text-purple-500" />,
        }
      ]
    }
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
      <SidebarHeader className="border-b px-4 py-3 bg-gradient-to-r from-red-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-500" />
          <span className="text-lg font-bold text-red-600">超级管理员</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="py-2">
        {sidebarNavGroups.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex} className="px-3 mb-2">
            <SidebarGroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {group.title}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item, index) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                  <SidebarMenuItem key={index} className="px-1">
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={item.href}
                        className="flex items-center justify-between w-full"
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <Badge variant={item.variant} className="ml-auto text-[10px] h-5">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="border-t px-3 py-4 mt-auto bg-gray-50/50">
        <div className="flex items-center space-x-3 p-3 rounded-md bg-white shadow-sm border border-gray-100 mb-3">
          <Avatar className="h-10 w-10 border-2 border-red-100">
            <AvatarImage src="/placeholders/user.svg" alt={user?.name || "用户"} />
            <AvatarFallback className="bg-red-50 text-red-500">SA</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || "超级管理员"}</p>
            <p className="text-xs text-muted-foreground">系统最高管理员</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-start bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
      </SidebarFooter>
    </>
  );
} 