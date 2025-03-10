"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SquareTerminal, Calendar, Bot } from "lucide-react";

import { useAuth } from "@/lib/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SchoolSwitcher } from "@/components/school-switcher";
import { NavMain } from "@/components/nav-main";
import { NavAgent, type AgentItem } from "@/components/nav-agent";
import { NavUserAuth } from "@/components/nav-user-auth";

// 智能体类型
// interface AIAgent {
//   id: string;
//   name: string;
//   description: string;
//   icon: string;
//   category?: string;
//   tags?: string[];
// }

// 导航数据
const navMainData = [
  {
    title: "工作台",
    url: "/workbench",
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
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 当用户认证状态变更时重新获取数据
  useEffect(() => {
    if (isAuthenticated && user) {
      // console.log('认证状态改变，用户已登录:', user.name);
      fetchUserAgents();
    } else {
      // console.log('用户未登录或认证状态已改变');
      // 清空用户相关数据
      setAgents([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // 获取用户AI助手列表
  const fetchUserAgents = async () => {
    try {
      if (!isAuthenticated) {
        // console.log('用户未登录，取消数据获取');
        setIsLoading(false);
        return;
      }

      // 仅在第一次加载时显示加载状态
      const firstLoad = agents.length === 0;
      if (firstLoad) {
        setIsLoading(true);
      }

      const response = await fetch("/api/ai-library/user-agents");

      if (!response.ok) {
        throw new Error("获取AI助手列表失败");
      }

      const data = await response.json();

      // 转换为智能体格式 - 确保符合AgentItem接口
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedAgents: AgentItem[] = data.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description || "",
        url: `/ai-chat/${agent.id}`,
        icon: Bot, // 使用LucideIcon类型
      }));

      // 比较新旧数据，只在数据真正变化时更新状态
      const hasChanged =
        JSON.stringify(formattedAgents) !== JSON.stringify(agents);
      if (hasChanged || firstLoad) {
        // console.log('智能体数据有变化或首次加载，更新状态');
        setAgents(formattedAgents);
      } else {
        // console.log('智能体数据无变化，跳过更新');
      }
    } catch (_error) {
      // console.error('获取用户AI助手失败:', error);
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

    // 定期刷新数据 - 降低频率到30秒
    const interval = setInterval(() => {
      if (isAuthenticated) {
        fetchUserAgents();
      }
    }, 30000); // 从10秒改为30秒

    // 窗口获得焦点时刷新数据
    const handleFocus = () => {
      if (isAuthenticated) {
        fetchUserAgents();
      }
    };

    // 监听智能体列表更新事件
    const handleAgentListUpdate = (event: Event) => {
      // console.log('收到智能体列表更新事件，处理数据');

      if (isAuthenticated) {
        // 检查事件是否包含详细数据
        const customEvent = event as CustomEvent;
        if (customEvent.detail) {
          const { action, agent } = customEvent.detail;
          // console.log(`收到${action}操作的数据:`, agent);

          // 直接基于事件数据更新状态，避免额外的API调用
          if (action === "add" && agent) {
            // 检查是否已经存在此智能体
            const exists = agents.some((a) => a.id === agent.id);
            if (!exists) {
              // 格式化并添加新智能体
              const newAgent: AgentItem = {
                id: agent.id,
                name: agent.name,
                description: agent.description || "",
                url: `/ai-chat/${agent.id}`,
                icon: Bot,
              };

              setAgents((prev) => [...prev, newAgent]);
              // console.log('已直接添加智能体到侧边栏:', newAgent.name);
            }
          } else if (action === "remove" && agent) {
            // 从列表中移除智能体
            setAgents((prev) => prev.filter((a) => a.id !== agent.id));
            // console.log('已直接从侧边栏移除智能体:', agent.name);
          } else {
            // 如果没有详细信息或操作不明确，回退到完整刷新
            // console.log('未收到完整数据，执行完整刷新');
            fetchUserAgents();
          }
        } else {
          // 兼容旧版事件格式，执行完整刷新
          // console.log('旧版事件格式，执行完整刷新');
          fetchUserAgents();
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("agent-list-updated", handleAgentListUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("agent-list-updated", handleAgentListUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, agents.length]);

  // 处理登出
  const handleLogout = async () => {
    try {
      // console.log('开始退出登录流程');
      // 登出前清空本地状态
      setAgents([]);

      // 调用登出函数
      await logout();

      // 导航到登录页
      // console.log('退出成功，重定向到登录页');
      router.push("/login");
    } catch (_error) {
      // console.error('登出处理失败:', error);
      // 即使失败也尝试跳转到登录页
      router.push("/login");
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SchoolSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} />
        <NavAgent isLoading={isLoading} agents={agents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUserAuth user={user || undefined} onLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
