"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  GraduationCap,
  Users,
  FileText,
  BarChart,
  Calendar,
  Building,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUserAuth } from "@/components/nav-user-auth"
import { SchoolSwitcher } from "@/components/school-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

// This is sample data.
const data = {
  navMain: [
    {
      title: "工作台",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
      items: [],
    },
    {
      title: "我的日历",
      url: "/calendar",
      icon: Calendar,
      items: [],
    },
    {
      title: "教学管理",
      url: "#",
      icon: GraduationCap,
      items: [
        {
          title: "课程管理",
          url: "#",
        },
        {
          title: "班级管理",
          url: "#",
        },
        {
          title: "学生管理",
          url: "#",
        },
      ],
    },
    {
      title: "资源中心",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "教学资源",
          url: "#",
        },
        {
          title: "试题库",
          url: "#",
        },
        {
          title: "教案库",
          url: "#",
        },
        {
          title: "资源共享",
          url: "#",
        },
      ],
    },
    {
      title: "系统设置",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "基础设置",
          url: "#",
        },
        {
          title: "用户管理",
          url: "#",
        },
        {
          title: "权限配置",
          url: "#",
        },
        {
          title: "日志查询",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "教师空间",
      url: "#",
      icon: Users,
    },
    {
      name: "数据分析",
      url: "#",
      icon: BarChart,
    },
    {
      name: "校园设施",
      url: "#",
      icon: Building,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SchoolSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <NavUserAuth 
            user={{
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              role: user.role
            }}
            onLogout={handleLogout}
          />
        ) : null}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
