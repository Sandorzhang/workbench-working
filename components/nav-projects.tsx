"use client"

import { useState } from "react"
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

// 定义项目类型
export interface ProjectItem {
  name: string;
  url: string;
  icon: LucideIcon;
  id?: string;
  description?: string;
}

export function NavProjects({
  projects,
  isLoading = false,
}: {
  projects: ProjectItem[];
  isLoading?: boolean;
}) {
  const { isMobile } = useSidebar()
  const { toast } = useToast()
  const [selectedAgent, setSelectedAgent] = useState<{id: string, name: string, description?: string} | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // 移除智能体
  const handleRemoveAgent = async (agentId: string) => {
    try {
      const response = await fetch(`/api/ai-library/user-agents/${agentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "已移除智能体",
          description: "智能体已从您的列表中移除",
        });
      }
    } catch (error) {
      console.error('移除智能体失败:', error);
      toast({
        title: "移除失败",
        description: "无法移除智能体，请稍后再试",
        variant: "destructive"
      });
    }
  };

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
            // 显示项目列表
            projects.length > 0 ? (
              projects.map((item) => (
                <SidebarMenuItem key={item.id || item.name}>
                  <SidebarMenuButton
                    onClick={() => {
                      if (item.id) {
                        setSelectedAgent({
                          id: item.id,
                          name: item.name,
                          description: item.description
                        });
                        setDialogOpen(true);
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
                            setSelectedAgent({
                              id: item.id,
                              name: item.name,
                              description: item.description
                            });
                            setDialogOpen(true);
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
                        onClick={() => item.id && handleRemoveAgent(item.id)}
                      >
                        <Trash2 className="text-destructive" />
                        <span>移除</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
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
}
