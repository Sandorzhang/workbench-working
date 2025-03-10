"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Users,
  School,
  MapPin,
  LayoutDashboard,
  Shield,
  Key,
  ShieldAlert,
  CheckCircle,
  XCircle,
  BarChart3,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { SectionContainer } from "@/components/ui/section-container";
import { CardContainer } from "@/components/ui/card-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

// 管理系统应用类型定义
interface AdminApplication {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
}

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

function StatsCard({
  title,
  value,
  description,
  icon,
  change,
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {change && (
          <div className="mt-2 flex items-center text-xs">
            {trend === "up" && (
              <span className="text-green-500">{change} ↑</span>
            )}
            {trend === "down" && (
              <span className="text-red-500">{change} ↓</span>
            )}
            {trend === "neutral" && (
              <span className="text-gray-500">{change}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SuperAdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [currentDate] = useState(new Date());
  const [authChecked, setAuthChecked] = useState(false);

  // 系统摘要数据 - 模拟数据
  const [stats] = useState({
    users: { total: 0, admin: 0, teacher: 0, student: 0 },
    regions: { total: 0, active: 0, inactive: 0 },
    schools: { total: 0, active: 0, inactive: 0 },
  });

  // 检查认证状态
  useEffect(() => {
    if (!authLoading) {
      // 认证检查完成
      setAuthChecked(true);

      if (!isAuthenticated) {
        //console.log('未登录状态，重定向到登录页');
        toast.error("请先登录");
        router.push("/login");
        return;
      }

      if (user?.role !== "superadmin") {
        //console.log('非超级管理员，重定向到工作台');
        toast.error("您没有权限访问超级管理员区域");
        router.push("/workbench");
        return;
      }

      //console.log('超级管理员已登录:', user?.name, user?.id);

      // 验证token是否存在，确保用户真的登录了
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("登录状态异常：用户已认证但没有token");
        toast.error("登录状态异常，请重新登录");
        router.push("/login");
      }

      // 模拟加载时间为了展示动画效果
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [authLoading, isAuthenticated, user, router]);

  // 管理应用数据
  const adminApplications: AdminApplication[] = [
    {
      id: "1",
      name: "用户管理",
      description: "管理系统用户、角色和账号设置",
      icon: "users",
      url: "/superadmin/users",
    },
    {
      id: "2",
      name: "学校管理",
      description: "创建和管理学校，设置学校级别的配置",
      icon: "building",
      url: "/superadmin/schools",
    },
    {
      id: "3",
      name: "区域管理",
      description: "管理系统地区划分和区域设置",
      icon: "mapPin",
      url: "/superadmin/regions",
    },
    {
      id: "4",
      name: "权限管理",
      description: "设置系统权限和访问控制策略",
      icon: "lock",
      url: "/superadmin/permissions",
    },
  ];

  // 图标映射
  const iconComponents: Record<string, React.ElementType> = {
    users: Users,
    building: School,
    mapPin: MapPin,
    lock: Key,
  };

  // 格式化日期函数
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    return currentDate.toLocaleDateString("zh-CN", options);
  };

  // 获取问候语
  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 6) return "凌晨好";
    if (hour < 11) return "早上好";
    if (hour < 13) return "中午好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  // 如果认证状态仍在加载，显示加载状态
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果用户未登录或不是超级管理员，页面将被重定向，显示空内容
  if (!isAuthenticated || user?.role !== "superadmin") {
    return null;
  }

  // 管理模块列表 - 精简后只保留有实际链接的模块
  const adminModules = [
    {
      title: "用户管理",
      description: "管理系统用户、角色和权限",
      icon: <Users className="h-5 w-5" />,
      href: "/superadmin/users",
    },
    {
      title: "权限管理",
      description: "管理路由和应用的访问权限",
      icon: <Key className="h-5 w-5" />,
      href: "/superadmin/permissions",
    },
    {
      title: "区域管理",
      description: "管理系统区域和地理位置设置",
      icon: <MapPin className="h-5 w-5" />,
      href: "/superadmin/regions",
    },
    {
      title: "学校管理",
      description: "管理系统中的学校和教育机构",
      icon: <School className="h-5 w-5" />,
      href: "/superadmin/schools",
    },
  ];

  return (
    <PageContainer loading={isLoading}>
      {/* 欢迎和统计卡片区域 */}
      <SectionContainer
        backgroundClassName="bg-gradient-to-br from-slate-50 to-gray-50"
        className="relative overflow-hidden border border-gray-100/80 shadow-sm rounded-lg"
        padding="relaxed"
      >
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-red-50 to-transparent rounded-full -mr-32 -mt-32 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-red-50 to-transparent rounded-full -ml-32 -mb-32 opacity-70"></div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-500 mr-2">
                {getGreeting()}
              </span>
              {user?.name || "管理员"}
            </h2>
            <p className="text-gray-500 mt-1">
              {formatDate()} · 超级管理员控制台
            </p>
          </div>

          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Badge
              variant="outline"
              className="px-3 py-1.5 bg-white border-red-200"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-red-500 mr-1" />
              <span className="text-red-500">超级管理员</span>
            </Badge>
            <Avatar className="h-12 w-12 border-2 border-red-200">
              <AvatarImage
                src={user?.avatar || "/avatars/default.png"}
                alt={user?.name || "用户"}
              />
              <AvatarFallback className="bg-red-50 text-red-500">
                {user?.name?.charAt(0) || "S"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* 系统摘要统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <CardContainer
            elevated
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">活跃用户</p>
                <h3 className="text-2xl font-bold mt-1">{stats.users.total}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContainer>

          <CardContainer
            elevated
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">区域总数</p>
                <h3 className="text-2xl font-bold mt-1">
                  {stats.regions.total}
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-full">
                <MapPin className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
          </CardContainer>

          <CardContainer
            elevated
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">学校总数</p>
                <h3 className="text-2xl font-bold mt-1">
                  {stats.schools.total}
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <School className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContainer>

          <CardContainer
            elevated
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">活跃学校</p>
                <h3 className="text-2xl font-bold mt-1">
                  {stats.schools.active}
                </h3>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContainer>
        </div>
      </SectionContainer>

      {/* 功能快捷入口 */}
      <SectionContainer className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">功能快捷入口</h2>
          <Badge variant="outline" className="px-2">
            管理员专用
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminModules.map((module, index) => (
            <Link href={module.href} key={index}>
              <Card className="h-full hover:shadow-md transition-all hover:border-primary/20 cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      {module.icon}
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="min-h-[40px]">
                    {module.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between mt-2"
                  >
                    <span>进入管理</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </SectionContainer>

      {/* 系统概览 */}
      <SectionContainer className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">系统概览</h2>
        <Card className="overflow-hidden border-gray-200">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">系统数据概览</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  用户分布
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>超级管理员</span>
                      <span className="font-medium">1</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="bg-red-500 h-full rounded-full"
                        style={{ width: "5%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>管理员</span>
                      <span className="font-medium">{stats.users.admin}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{
                          width:
                            stats.users.total > 0
                              ? `${
                                  (stats.users.admin / stats.users.total) * 100
                                }%`
                              : "0%",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>教师</span>
                      <span className="font-medium">{stats.users.teacher}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full"
                        style={{
                          width:
                            stats.users.total > 0
                              ? `${
                                  (stats.users.teacher / stats.users.total) *
                                  100
                                }%`
                              : "0%",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>学生</span>
                      <span className="font-medium">{stats.users.student}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full"
                        style={{
                          width:
                            stats.users.total > 0
                              ? `${
                                  (stats.users.student / stats.users.total) *
                                  100
                                }%`
                              : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  状态统计
                </h3>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-medium uppercase text-gray-500">
                      区域状态
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white border rounded-lg">
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-gray-600">启用区域</span>
                        </div>
                        <p className="text-lg font-semibold mt-1">
                          {stats.regions.active}
                        </p>
                      </div>
                      <div className="p-3 bg-white border rounded-lg">
                        <div className="flex items-center text-sm">
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-gray-600">禁用区域</span>
                        </div>
                        <p className="text-lg font-semibold mt-1">
                          {stats.regions.inactive}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-medium uppercase text-gray-500">
                      学校状态
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white border rounded-lg">
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-gray-600">启用学校</span>
                        </div>
                        <p className="text-lg font-semibold mt-1">
                          {stats.schools.active}
                        </p>
                      </div>
                      <div className="p-3 bg-white border rounded-lg">
                        <div className="flex items-center text-sm">
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-gray-600">禁用学校</span>
                        </div>
                        <p className="text-lg font-semibold mt-1">
                          {stats.schools.inactive}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </SectionContainer>
    </PageContainer>
  );
}
