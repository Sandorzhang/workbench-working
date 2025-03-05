"use client";

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { 
  Home, Users, School,
  MapPin, LayoutDashboard 
} from "lucide-react";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  // 在服务器端验证用户是否是超级管理员
  const { user, isAuthenticated } = useAuth();

  // 如果未登录，重定向到登录页面
  if (isAuthenticated === false) {
    redirect("/login");
  }

  // 如果不是超级管理员，重定向到仪表盘
  if (user?.role !== "superadmin") {
    redirect("/dashboard");
  }

  // 侧边栏导航项
  const sidebarNavItems = [
    {
      title: "仪表盘",
      href: "/superadmin",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      title: "用户管理",
      href: "/superadmin/users",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "租户管理",
      href: "/superadmin/schools",
      icon: <School className="mr-2 h-4 w-4" />,
    },
    {
      title: "区域管理",
      href: "/superadmin/regions",
      icon: <MapPin className="mr-2 h-4 w-4" />,
    },
    {
      title: "返回主页",
      href: "/",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <div className="flex h-screen flex-col">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold tracking-tight">超级管理控制台</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-8 items-center justify-center rounded-full bg-primary/10 px-3">
              <span className="text-xs font-medium text-primary">超级管理员</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        <aside className="w-64 border-r bg-background hidden md:block overflow-y-auto">
          <div className="flex h-full flex-col">
            <div className="flex-1">
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                  系统管理
                </h2>
                <div className="space-y-1">
                  {sidebarNavItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 内容区域 */}
        <main className="flex-1 overflow-y-auto bg-muted/10">{children}</main>
      </div>
    </div>
  );
} 