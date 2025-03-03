"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  SquareTerminal,
  Calendar,
  Bot,
  type LucideIcon
} from "lucide-react"

import { useAuth } from "@/lib/auth"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { SchoolSwitcher } from "@/components/school-switcher"
import { NavMain } from "@/components/nav-main"
import { NavProjects, type ProjectItem } from "@/components/nav-projects"
import { NavUserAuth } from "@/components/nav-user-auth"

// 智能体类型
interface AIAgent {
  id: string
  name: string
  description: string
  icon: string
  category?: string
  tags?: string[]
}

// 导航数据
const navMainData = [
  {
    title: "工作台",
    url: "/dashboard",
    icon: SquareTerminal,
    isActive: true,
  },
  {
    title: "我的日历",
    url: "/calendar",
    icon: Calendar,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 当用户认证状态变更时重新获取数据
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('认证状态改变，用户已登录:', user.name);
      fetchUserAgents();
    } else {
      console.log('用户未登录或认证状态已改变');
      // 清空用户相关数据
      setProjects([]);
    }
  }, [isAuthenticated, user]);
  
  // 获取用户AI助手列表
  const fetchUserAgents = async () => {
    try {
      if (!isAuthenticated) {
        console.log('用户未登录，取消数据获取');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      const response = await fetch('/api/ai-library/user-agents');
      
      if (!response.ok) {
        throw new Error('获取AI助手列表失败');
      }
      
      const data = await response.json();
      
      // 转换为项目格式 - 确保符合ProjectItem接口
      const formattedAgents: ProjectItem[] = data.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description || '',
        url: `/ai-chat/${agent.id}`,
        icon: Bot // 使用LucideIcon类型
      }));
      
      setProjects(formattedAgents);
    } catch (error) {
      console.error('获取用户AI助手失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 页面加载时获取数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserAgents();
    } else {
      setIsLoading(false);
    }
    
    // 定期刷新数据
    const interval = setInterval(() => {
      if (isAuthenticated) {
        fetchUserAgents();
      }
    }, 10000);
    
    // 窗口获得焦点时刷新数据
    const handleFocus = () => {
      if (isAuthenticated) {
        fetchUserAgents();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated]);

  // 处理登出
  const handleLogout = async () => {
    try {
      console.log('开始退出登录流程');
      // 登出前清空本地状态
      setProjects([]);
      
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SchoolSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} />
        <NavProjects 
          isLoading={isLoading} 
          projects={projects} 
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUserAuth 
          user={user || undefined} 
          onLogout={handleLogout} 
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
