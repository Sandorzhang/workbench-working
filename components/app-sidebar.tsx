"use client"

import * as React from "react"
import {
  SquareTerminal,
  Calendar,
  Bot,
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
    }
  ],
  projects: [
    {
      name: "智能教学助手",
      url: "/ai-teaching-assistant",
      icon: Bot,
    }
  ]
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
        <NavUserAuth />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
