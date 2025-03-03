"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, School, Building, BookOpen } from "lucide-react"
import { useAuth } from "@/lib/auth"

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

// 默认租户数据
const defaultSchoolTenant = {
  id: "default",
  name: "通用平台",
  logo: Building,
  type: "完全中学",
  region: "全国"
}

export function SchoolSwitcher() {
  const { isMobile } = useSidebar()
  const { user } = useAuth()
  
  // 获取学制对应的图标
  const getSchoolLogo = (type?: string) => {
    if (!type) return Building;
    if (type.includes('小学')) return BookOpen;
    if (type.includes('九年一贯制')) return School;
    if (type.includes('完全中学')) return Building;
    return Building;
  };
  
  // 根据用户信息创建租户对象
  const userTenant = user?.tenant 
    ? {
        id: "user-tenant",
        name: user.tenant,
        logo: getSchoolLogo(user.tenantType),
        type: user.tenantType || "完全中学",
        region: "全国"
      }
    : defaultSchoolTenant
  
  // 只显示用户自己的租户
  const schoolTenants = [userTenant];
  const [activeSchool, setActiveSchool] = React.useState(userTenant)

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
                {typeof activeSchool.logo === 'function' ? (
                  <activeSchool.logo className="size-4" />
                ) : (
                  <Building className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeSchool.name}</span>
                <span className="truncate text-xs">{activeSchool.type}</span>
              </div>
              {/* 隐藏下拉箭头，因为只有一个选项 */}
              {schoolTenants.length > 1 && (
                <ChevronsUpDown className="ml-auto size-4" />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {schoolTenants.length > 1 && (
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
                    {typeof school.logo === 'function' ? (
                      <school.logo className="size-4 shrink-0 text-primary" />
                    ) : (
                      <Building className="size-4 shrink-0 text-primary" />
                    )}
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
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
} 