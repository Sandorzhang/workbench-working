"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, School, Building, BookOpen } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

// 学校租户数据
const schoolTenants = [
  {
    id: "1",
    name: "通用平台",
    logo: Building,
    type: "教育系统",
    region: "全国"
  }
]

export function SchoolSwitcher() {
  const { isMobile } = useSidebar()
  const [activeSchool, setActiveSchool] = React.useState(schoolTenants[0])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-primary/10 text-primary flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeSchool.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeSchool.name}</span>
                <span className="truncate text-xs">{activeSchool.type}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              学校租户
            </DropdownMenuLabel>
            {schoolTenants.map((school, index) => (
              <DropdownMenuItem
                key={school.id}
                onClick={() => setActiveSchool(school)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-xs border bg-primary/5">
                  <school.logo className="size-4 shrink-0 text-primary" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium">{school.name}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="px-1 py-0 text-[10px]">
                      {school.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{school.region}</span>
                  </div>
                </div>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">添加学校</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
} 