'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Users, Clipboard, FileText, Calendar, Settings, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  'book': <BookOpen className="h-12 w-12 text-blue-500" />,
  'users': <Users className="h-12 w-12 text-green-500" />,
  'clipboard': <Clipboard className="h-12 w-12 text-amber-500" />,
  'file': <FileText className="h-12 w-12 text-purple-500" />,
  'calendar': <Calendar className="h-12 w-12 text-rose-500" />,
  'settings': <Settings className="h-12 w-12 text-gray-500" />,
};

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-lg">加载工作台...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">工作台</h1>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{getRoleDisplay(user.role)}</p>
                  </div>
                </div>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      
      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">可用应用</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {applications.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无可用应用</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <Card key={app.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{app.name}</CardTitle>
                  <CardDescription>{app.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {iconMap[app.icon] || <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-500">{app.name.charAt(0)}</span>
                  </div>}
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleAppClick(app.url)} className="w-full">
                    进入应用
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 