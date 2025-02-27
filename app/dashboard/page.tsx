'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, BookOpen, Users, Clipboard, FileText, Calendar, Settings, LogOut,
  Home, Bell, Search, Menu, X, ChevronRight, LayoutDashboard, TrendingUp,
  Activity, Clock, Check, Star, Zap, Sparkles
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// 应用类型定义
interface Application {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  roles: string[];
}

// 图标映射 - 使用类型断言避免TypeScript错误
const iconComponents: Record<string, any> = {
  'book': BookOpen,
  'users': Users,
  'clipboard': Clipboard,
  'file': FileText,
  'calendar': Calendar,
  'settings': Settings,
};

// 卡片颜色映射 - 使用更多生动的渐变色
const colorMap: Record<string, string> = {
  'book': 'from-blue-500 to-indigo-600',
  'users': 'from-emerald-400 to-teal-600',
  'clipboard': 'from-amber-400 to-orange-600',
  'file': 'from-purple-400 to-violet-600',
  'calendar': 'from-rose-400 to-pink-600',
  'settings': 'from-slate-400 to-slate-600',
};

// 动画延迟类
const animationDelays = [
  'animate-delay-0',
  'animate-delay-75',
  'animate-delay-150',
  'animate-delay-300',
  'animate-delay-500',
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [currentDate] = useState(new Date());
  
  // 统计数据 - 模拟数据
  const [stats] = useState({
    tasksCompleted: 12,
    upcomingEvents: 3,
    messagesUnread: 5,
    activeStudents: 87
  });
  
  // 简化的应用获取逻辑
  useEffect(() => {
    // 使用模拟数据，简化身份验证逻辑
    const mockApplications = [
      {
        id: '1',
        name: '师生信息管理',
        description: '管理教师和学生的基本信息',
        icon: 'users',
        url: '/admin/users',
        roles: ['管理员']
      },
      {
        id: '2',
        name: '课堂时光机',
        description: '记录和回放课堂教学过程，辅助教学分析',
        icon: 'book',
        url: '/classroom-timemachine',
        roles: ['教师']
      },
      {
        id: '3',
        name: '单元教学设计',
        description: '创建和管理单元教学设计方案',
        icon: 'file',
        url: '/unit-teaching-design',
        roles: ['教师']
      },
      {
        id: '4',
        name: '全员导师制',
        description: '浏览、管理和分配导师资源，促进师生共同成长',
        icon: 'users',
        url: '/mentor-hub',
        roles: ['教师', '管理员']
      }
    ];
    
    // 模拟加载时间为了展示动画效果
    setTimeout(() => {
      setApplications(mockApplications);
      setIsLoading(false);
    }, 500);
    
  }, []);
  
  const handleAppClick = (url: string) => {
    router.push(url);
  };
  
  // 格式化日期函数
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    };
    return currentDate.toLocaleDateString('zh-CN', options);
  };

  // 获取问候语
  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 6) return '凌晨好';
    if (hour < 11) return '早上好';
    if (hour < 13) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };
  
  // 应用加载骨架屏
  const ApplicationSkeleton = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full animate-pulse">
      <div className="h-3 w-full bg-gray-200"></div>
      <div className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0 p-3 rounded-lg bg-gray-200 h-12 w-12"></div>
          <div className="ml-4 flex-1">
            <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex flex-col space-y-8">
          {/* 顶部欢迎区域骨架屏 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded-full w-64"></div>
                <div className="h-5 bg-gray-200 rounded-full w-48"></div>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-200"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 应用列表骨架屏 */}
          <div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <ApplicationSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex flex-col space-y-8">
        {/* 欢迎和数据卡片区域 */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden relative animate-fadeIn">
          {/* 装饰性背景元素 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/5 to-transparent rounded-full -ml-32 -mb-32"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 mr-2">{getGreeting()}</span>
                {user?.name || '同学'}
              </h2>
              <p className="text-gray-500 mt-1">{formatDate()} · 欢迎回到工作台</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="px-3 py-1.5 bg-white border-primary/20">
                <Sparkles className="h-3.5 w-3.5 text-primary mr-1" />
                <span className="text-primary">教师</span>
              </Badge>
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={user?.avatar || "/avatars/default.png"} alt={user?.name || '用户'} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          {/* 统计数据卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur border-0 shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn animate-delay-75">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">今日任务完成</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats.tasksCompleted}</h3>
                  </div>
                  <div className="p-2 rounded-full bg-emerald-50 text-emerald-500">
                    <Check className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-emerald-500 font-medium flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>较昨日+2</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur border-0 shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn animate-delay-150">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">即将到来的日程</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats.upcomingEvents}</h3>
                  </div>
                  <div className="p-2 rounded-full bg-blue-50 text-blue-500">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-blue-500 font-medium flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>最近一次: 今日15:30</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur border-0 shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn animate-delay-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">未读消息</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats.messagesUnread}</h3>
                  </div>
                  <div className="p-2 rounded-full bg-amber-50 text-amber-500">
                    <Bell className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-amber-500 font-medium flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  <span>3分钟前更新</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur border-0 shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn animate-delay-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">活跃学生</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats.activeStudents}%</h3>
                  </div>
                  <div className="p-2 rounded-full bg-purple-50 text-purple-500">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-purple-500 font-medium flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  <span>班级平均: 82%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* 快速访问 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 col-span-1 animate-fadeIn">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
                <Zap className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">快速访问</h3>
                <p className="text-sm text-gray-500">常用功能入口</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex flex-col items-center justify-center h-20 p-2 border-dashed hover:border-primary hover:text-primary transition-colors">
                <Settings className="h-6 w-6 mb-2" />
                <span className="text-xs">个人设置</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center justify-center h-20 p-2 border-dashed hover:border-primary hover:text-primary transition-colors">
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-xs">文档中心</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center justify-center h-20 p-2 border-dashed hover:border-primary hover:text-primary transition-colors">
                <Calendar className="h-6 w-6 mb-2" />
                <span className="text-xs">我的日历</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center justify-center h-20 p-2 border-dashed hover:border-primary hover:text-primary transition-colors">
                <Activity className="h-6 w-6 mb-2" />
                <span className="text-xs">数据分析</span>
              </Button>
            </div>
          </div>
          
          {/* 最近活动列表 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 md:col-span-2 animate-fadeIn animate-delay-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-500">
                  <Activity className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">最近活动</h3>
                  <p className="text-sm text-gray-500">系统活动记录</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-500">
                查看全部
              </Button>
            </div>
            <Separator className="mb-4" />
            
            <div className="space-y-4">
              {[
                { icon: FileText, color: 'text-blue-500 bg-blue-50', title: '更新了教学设计文档', time: '10分钟前', badge: '单元教学设计' },
                { icon: Users, color: 'text-green-500 bg-green-50', title: '添加了新学生到班级', time: '2小时前', badge: '师生信息管理' },
                { icon: BookOpen, color: 'text-amber-500 bg-amber-50', title: '上传了课堂录像', time: '昨天 15:30', badge: '课堂时光机' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${activity.color} flex-shrink-0`}>
                    {React.createElement(activity.icon, { className: 'h-4 w-4' })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                    <Badge variant="secondary" className="mt-1 text-xs">{activity.badge}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8 animate-fadeIn">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6 animate-fadeIn">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-gray-900">我的应用</h3>
            <div className="ml-3 h-px w-10 bg-gradient-to-r from-primary to-transparent"></div>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {applications.length} 个应用
          </Badge>
        </div>
        
        {/* 应用列表 */}
        {applications.length === 0 && !isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-dashed border-gray-300 animate-fadeIn">
            <div className="mx-auto w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">暂无可用应用</h3>
            <p className="text-gray-500 max-w-md mx-auto">您当前没有可用的应用程序。请联系管理员为您分配权限。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app, index) => (
              <div 
                key={app.id} 
                onClick={() => handleAppClick(app.url)}
                className={`group cursor-pointer transition-all duration-300 transform hover:-translate-y-2 animate-fadeIn ${animationDelays[index % animationDelays.length]}`}
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 h-full flex flex-col">
                  <div className={`h-3 w-full bg-gradient-to-r ${colorMap[app.icon] || 'from-gray-500 to-gray-600'}`}></div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 p-3.5 rounded-xl bg-gradient-to-br ${colorMap[app.icon] || 'from-gray-500 to-gray-600'} text-white shadow-sm group-hover:shadow-md transition-all`}>
                        {app.icon && iconComponents[app.icon as keyof typeof iconComponents] ? 
                          React.createElement(iconComponents[app.icon as keyof typeof iconComponents], { size: 24 })
                        : 
                          <span className="h-10 w-10 flex items-center justify-center text-2xl font-bold">
                            {app.name.charAt(0)}
                          </span>
                        }
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">{app.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{app.description}</p>
                        {app.roles && app.roles.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {app.roles.map((role, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 flex justify-end">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors flex items-center overflow-hidden"
                      >
                        <span className="relative inline-flex items-center">
                          进入应用
                          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 