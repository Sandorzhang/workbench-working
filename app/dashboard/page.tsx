'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, BookOpen, Users, Clipboard, FileText, Calendar, Settings, LogOut,
  Home, Bell, Search, Menu, X, ChevronRight, LayoutDashboard
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// 应用类型定义
interface Application {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  roles: string[];
}

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  'book': <BookOpen className="h-10 w-10" />,
  'users': <Users className="h-10 w-10" />,
  'clipboard': <Clipboard className="h-10 w-10" />,
  'file': <FileText className="h-10 w-10" />,
  'calendar': <Calendar className="h-10 w-10" />,
  'settings': <Settings className="h-10 w-10" />,
};

// 卡片颜色映射
const colorMap: Record<string, string> = {
  'book': 'from-blue-500 to-blue-600',
  'users': 'from-green-500 to-green-600',
  'clipboard': 'from-amber-500 to-amber-600',
  'file': 'from-purple-500 to-purple-600',
  'calendar': 'from-rose-500 to-rose-600',
  'settings': 'from-gray-500 to-gray-600',
};

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  
  const router = useRouter();
  const { user, token, isAuthenticated, logout } = useAuth();
  
  useEffect(() => {
    // 如果未认证，重定向到登录页
    if (!isAuthenticated && !user) {
      router.push('/login');
      return;
    }
    
    // 获取用户可访问的应用
    const fetchApplications = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/applications', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('获取应用列表失败');
        }
        
        const data = await response.json();
        setApplications(data);
      } catch (err: any) {
        setError(err.message || '获取应用列表时出错');
        console.error('获取应用列表错误:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();
  }, [isAuthenticated, token, user, router]);
  
  const handleAppClick = (url: string) => {
    router.push(url);
  };
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  // 用户角色显示文本
  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      'admin': '管理员',
      'teacher': '教师',
    };
    
    return roleMap[role] || role;
  };
  
  // 响应式控制
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-lg">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-6 text-lg font-medium text-gray-700">正在加载工作台...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar} 
              className="p-2 mr-4 rounded-md hover:bg-gray-100 lg:hidden transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center">
              <LayoutDashboard className="h-6 w-6 text-primary mr-2" />
              <h1 className="text-xl font-bold text-gray-800">教育管理平台</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell size={20} />
            </button>
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-1 hover:bg-gray-100">
                    <Avatar className="h-8 w-8 border-2 border-gray-200">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">{user.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-gray-500">{getRoleDisplay(user.role)}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <div className="flex items-center space-x-3 p-3 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">{user.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <Badge variant="outline" className="mt-1 text-[10px] py-0">
                        {getRoleDisplay(user.role)}
                      </Badge>
                    </div>
                  </div>
                  <div className="py-2">
                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                      <Settings className="h-4 w-4 mr-2" />
                      个人设置
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer hover:bg-red-50 focus:bg-red-50">
                      <LogOut className="h-4 w-4 mr-2" />
                      退出登录
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        <aside 
          className={cn(
            "bg-white border-r border-gray-200 w-64 transition-all duration-300 ease-in-out lg:relative fixed top-0 bottom-0 left-0 z-40 pt-16 lg:pt-0 lg:translate-x-0 shadow-lg lg:shadow-none",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索..." 
                className="pl-10 pr-4 py-2 w-full rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>
          </div>
          
          <nav className="mt-2 px-2">
            <div className="mb-2 px-3 py-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">主菜单</p>
            </div>
            
            <ul className="space-y-1">
              <li>
                <a href="#" className="flex items-center px-3 py-2 text-sm rounded-md bg-primary/10 text-primary font-medium">
                  <Home className="h-5 w-5 mr-3" />
                  <span>概览</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100">
                  <Users className="h-5 w-5 mr-3" />
                  <span>用户管理</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100">
                  <Settings className="h-5 w-5 mr-3" />
                  <span>系统设置</span>
                </a>
              </li>
            </ul>
            
            <div className="mt-6 mb-2 px-3 py-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">应用列表</p>
            </div>
            
            <ul className="space-y-1">
              {applications.map((app) => (
                <li key={app.id}>
                  <a 
                    href={app.url}
                    className="flex items-center px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    {iconMap[app.icon] ? (
                      <span className="h-5 w-5 mr-3 text-gray-500">
                        {React.cloneElement(iconMap[app.icon] as React.ReactElement, { 
                          className: 'h-5 w-5' 
                        })}
                      </span>
                    ) : (
                      <span className="h-5 w-5 mr-3 flex items-center justify-center bg-gray-200 text-gray-700 rounded-md font-medium text-xs">
                        {app.name.charAt(0)}
                      </span>
                    )}
                    <span>{app.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        
        {/* 黑色遮罩层，当侧边栏打开时显示在移动设备上 */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" 
            onClick={toggleSidebar}
          />
        )}
        
        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">工作台</h2>
                <p className="mt-1 text-sm text-gray-500">欢迎回来，{user?.name}。这是您的应用列表。</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-2">今日日期:</span>
                <span className="text-sm font-medium">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">最近动态</h3>
                    <p className="text-sm text-gray-500">查看您的最近活动和系统公告</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <p className="text-sm text-gray-500 italic">暂无新动态</p>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8">
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
            
            <h3 className="text-lg font-medium text-gray-900 mb-4">我的应用</h3>
            
            {applications.length === 0 && !isLoading ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-dashed border-gray-300">
                <div className="mx-auto w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">暂无可用应用</h3>
                <p className="text-gray-500 max-w-md mx-auto">您当前没有可用的应用程序。请联系管理员为您分配权限。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map((app) => (
                  <div 
                    key={app.id} 
                    onClick={() => handleAppClick(app.url)}
                    className="group cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300">
                      <div className={`h-3 w-full bg-gradient-to-r ${colorMap[app.icon] || 'from-gray-500 to-gray-600'}`}></div>
                      <div className="p-5">
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-br ${colorMap[app.icon] || 'from-gray-500 to-gray-600'} text-white`}>
                            {iconMap[app.icon] || 
                            <span className="h-10 w-10 flex items-center justify-center text-2xl font-bold">
                              {app.name.charAt(0)}
                            </span>}
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">{app.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{app.description}</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                          <Button 
                            size="sm" 
                            className="group-hover:bg-primary group-hover:text-white transition-colors flex items-center"
                          >
                            进入应用
                            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 