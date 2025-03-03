"use client"

import * as React from "react"
import {
  SquareTerminal,
  Calendar,
  Bot,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects, ProjectItem } from "@/components/nav-projects"
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
import { useEffect, useState } from "react"

// 智能体接口定义
interface AIAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
}

// 静态导航数据
const navMainData = [
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
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 获取用户添加的智能体
  const fetchUserAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-library/user-agents');
      
      if (response.ok) {
        const userAgents: AIAgent[] = await response.json();
        console.log('获取到的用户智能体:', userAgents); // 调试信息
        
        // 将API返回的智能体转换为项目格式
        const agentProjects: ProjectItem[] = userAgents.map(agent => ({
          name: agent.name,
          url: `/ai-teaching-assistant?agentId=${agent.id}`,
          icon: Bot,
          id: agent.id,
          description: agent.description
        }));
        
        // 更新项目列表
        setProjects(agentProjects);
      } else {
        console.error('获取用户智能体失败，状态码:', response.status);
      }
    } catch (error) {
      console.error('获取用户智能体失败:', error);
      // 错误时保留默认智能体
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载和定期刷新
  useEffect(() => {
    // 初始加载
    fetchUserAgents();
    
    // 设置定期刷新 (每10秒刷新一次)
    const intervalId = setInterval(fetchUserAgents, 10000);
    
    // 清理函数
    return () => clearInterval(intervalId);
  }, []);
  
  // 页面获得焦点时也刷新
  useEffect(() => {
    const handleFocus = () => {
      fetchUserAgents();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
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
        <NavMain items={navMainData} />
        <NavProjects projects={projects} isLoading={loading} />
      </SidebarContent>
      <SidebarFooter>
        <NavUserAuth 
          user={user || undefined} 
          onLogout={handleLogout} 
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
