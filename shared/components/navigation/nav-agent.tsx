"use client"

import { useState, useCallback, memo, useEffect } from "react"
import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  Plus,
  Bot,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { AIChatDialog } from "@/components/ai-chat-dialog"
import { useToast } from "@/components/ui/use-toast"

// 定义智能体项目类型
export interface AgentItem {
  name: string;
  url: string;
  icon: LucideIcon;
  id?: string;
  description?: string;
}

// 单个智能体菜单项组件
const AgentMenuItem = memo(({ 
  item, 
  onSelect, 
  onRemove 
}: { 
  item: AgentItem, 
  onSelect: (agent: {id: string, name: string, description?: string}) => void,
  onRemove: (id: string) => void
}) => {
  const { isMobile } = useSidebar();
  
  return (
    <SidebarMenuItem key={item.id || item.name}>
      <SidebarMenuButton
        onClick={() => {
          if (item.id) {
            onSelect({
              id: item.id,
              name: item.name,
              description: item.description
            });
          }
        }}
      >
        <item.icon />
        <span>{item.name}</span>
      </SidebarMenuButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction showOnHover>
            <MoreHorizontal />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-48 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "end" : "start"}
        >
          <DropdownMenuItem
            onClick={() => {
              if (item.id) {
                onSelect({
                  id: item.id,
                  name: item.name,
                  description: item.description
                });
              }
            }}
          >
            <Folder className="text-muted-foreground" />
            <span>对话</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Forward className="text-muted-foreground" />
            <span>分享</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive" 
            onClick={() => item.id && onRemove(item.id)}
          >
            <Trash2 className="text-destructive" />
            <span>移除</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
});

AgentMenuItem.displayName = "AgentMenuItem";

// 主导航组件，使用memo避免不必要的重渲染
export const NavAgent = memo(({
  agents,
  isLoading = false,
}: {
  agents: AgentItem[];
  isLoading?: boolean;
}) => {
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<{id: string, name: string, description?: string} | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [removingAgent, setRemovingAgent] = useState<string | null>(null);
  const [localAgents, setLocalAgents] = useState<AgentItem[]>([]);
  
  // 当props中的agents变化时更新本地状态
  useEffect(() => {
    setLocalAgents(agents);
  }, [agents]);
  
  // 处理智能体选择
  const handleSelectAgent = useCallback((agent: {id: string, name: string, description?: string}) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
  }, []);
  
  // 移除智能体
  const handleRemoveAgent = useCallback(async (agentId: string) => {
    try {
      // 设置正在移除的状态
      setRemovingAgent(agentId);
      
      // 在API调用前获取要移除的智能体信息
      const agentToRemove = localAgents.find(agent => agent.id === agentId);
      
      // 立即从本地状态中移除，实现即时UI反馈
      setLocalAgents(prev => prev.filter(agent => agent.id !== agentId));
      
      const response = await fetch(`/api/ai-library/user-agents/${agentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "已移除智能体",
          description: "智能体已从您的列表中移除",
        });
        
        // 触发带有详细数据的自定义事件
        const eventData = {
          action: 'remove',
          agent: agentToRemove,
          timestamp: new Date().getTime()
        };
        
        const event = new CustomEvent('agent-list-updated', {
          detail: eventData
        });
        
        window.dispatchEvent(event);
        console.log('已触发智能体列表更新事件（从NavAgent移除）:', eventData);
      } else {
        // 如果API失败，恢复本地状态
        if (agentToRemove) {
          setLocalAgents(prev => [...prev, agentToRemove]);
        }
        toast({
          title: "移除失败",
          description: "服务器拒绝了移除请求，请稍后再试",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('移除智能体失败:', error);
      // 恢复之前移除的智能体
      setLocalAgents(agents);
      toast({
        title: "移除失败",
        description: "无法移除智能体，请稍后再试",
        variant: "destructive"
      });
    } finally {
      setRemovingAgent(null);
    }
  }, [toast, localAgents, agents]);

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between pr-2">
          <SidebarGroupLabel>智能体</SidebarGroupLabel>
          <Link href="/ai-library" className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-hover">
            <Plus className="h-4 w-4" />
            <span className="sr-only">添加智能体</span>
          </Link>
        </div>
        <SidebarMenu>
          {isLoading ? (
            // 加载状态下显示骨架屏
            Array(2).fill(0).map((_, i) => (
              <SidebarMenuItem key={`skeleton-${i}`}>
                <SidebarMenuButton className="opacity-70">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          ) : (
            // 显示智能体列表，使用本地状态而非props
            localAgents.length > 0 ? (
              localAgents.map((item) => (
                <AgentMenuItem 
                  key={item.id || item.name}
                  item={item}
                  onSelect={handleSelectAgent}
                  onRemove={handleRemoveAgent}
                />
              ))
            ) : (
              <div className="py-2 px-3 text-sm text-muted-foreground">
                暂无智能体，点击"+"添加
              </div>
            )
          )}
        </SidebarMenu>
      </SidebarGroup>
      
      {selectedAgent && (
        <AIChatDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          agentId={selectedAgent.id}
          agentName={selectedAgent.name}
          agentDescription={selectedAgent.description}
        />
      )}
    </>
  )
});

NavAgent.displayName = "NavAgent"; 