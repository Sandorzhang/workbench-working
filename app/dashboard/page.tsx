'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from "sonner";
import { 
  BookOpen, Users, FileText, Calendar, 
  Sparkles, TrendingUp, Activity, Clock,
  Database, Loader2, Network, GraduationCap,
  School, Pencil, UserCheck, FileSpreadsheet
} from 'lucide-react';
import { PageContainer } from '@/components/ui/page-container';
import { SectionContainer } from '@/components/ui/section-container';
import { CardContainer } from '@/components/ui/card-container';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';

// 应用类型定义
interface Application {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  roles: string[];
}

// 角色映射
const roleMap: Record<string, string> = {
  'superadmin': '超级管理员',
  'admin': '管理员',
  'teacher': '教师',
  'student': '学生'
};

// 获取角色中文名称
const getRoleDisplay = (role: string | undefined) => {
  if (!role) return '用户';
  return roleMap[role] || role;
};

// 图标映射 - 使用类型断言避免TypeScript错误
const iconComponents: Record<string, any> = {
  'book': BookOpen,
  'users': Users,
  'file': FileText,
  'calendar': Calendar,
  'database': Database,
  'fileText': FileSpreadsheet, // 考试管理使用电子表格图标
  'network': Network,    // 概念地图使用网络图标
  'graduationCap': GraduationCap, // 学业旅程使用毕业帽图标
  'school': School,      // 课堂时光机使用学校图标
  'pencil': Pencil,      // 单元教学设计使用铅笔图标
  'userCheck': UserCheck, // 全员导师制使用用户检查图标
};

// 卡片颜色映射 - 使用更多生动的渐变色
const colorMap: Record<string, string> = {
  'book': 'from-blue-500 to-indigo-600',
  'users': 'from-emerald-400 to-teal-600',
  'clipboard': 'from-amber-400 to-orange-600',
  'file': 'from-purple-400 to-violet-600',
  'calendar': 'from-rose-400 to-pink-600',
  'settings': 'from-slate-400 to-slate-600',
  'database': 'from-cyan-400 to-blue-600',
  'fileText': 'from-amber-400 to-red-600', // 考试管理使用橙红色渐变
  'graduationCap': 'from-indigo-400 to-blue-600', // 学业旅程使用蓝紫色渐变
  'school': 'from-green-400 to-teal-600',  // 课堂时光机使用绿色渐变
  'pencil': 'from-purple-400 to-pink-600', // 单元教学设计使用紫色渐变
  'userCheck': 'from-blue-400 to-cyan-600', // 全员导师制使用蓝青色渐变
  'network': 'from-violet-400 to-indigo-600', // 概念地图使用紫色渐变
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [currentDate] = useState(new Date());
  const [authChecked, setAuthChecked] = useState(false);
  
  // 统计数据 - 模拟数据
  const [stats] = useState({
    tasksCompleted: 12,
    upcomingEvents: 3,
    messagesUnread: 5,
    activeStudents: 87
  });
  
  // 检查认证状态
  useEffect(() => {
    if (!authLoading) {
      // 认证检查完成
      setAuthChecked(true);
      
      if (!isAuthenticated) {
        console.log('未登录状态，重定向到登录页');
        toast.error('请先登录');
        router.push('/login');
      } else {
        console.log('用户已登录:', user?.name, user?.id);
        
        // 验证token是否存在，确保用户真的登录了
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('登录状态异常：用户已认证但没有token');
          toast.error('登录状态异常，请重新登录');
          router.push('/login');
        }
      }
    }
  }, [authLoading, isAuthenticated, user, router]);
  
  // 应用获取逻辑
  useEffect(() => {
    // 只有在用户认证后才加载应用
    if (!authChecked || !isAuthenticated || !user) return;
    
    console.log('开始获取应用数据');
    
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        // 调用API并传递用户ID
        const response = await fetch(`/api/applications?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('获取应用列表失败');
        }
        
        const data = await response.json();
        console.log('应用数据加载完成', data);
        setApplications(data);
        setIsLoading(false);
      } catch (error) {
        console.error('获取应用列表失败:', error);
        toast.error('获取应用列表失败');
        setIsLoading(false);
      }
    };
    
    fetchApplications();
  }, [authChecked, isAuthenticated, user]);
  
  // 应用点击处理函数
  const handleAppClick = (url: string) => {
    // 记录跳转日志
    console.log('应用点击，准备导航到:', url);
    
    // 确保在客户端路由导航前验证用户状态
    if (!isAuthenticated || !user) {
      console.warn('用户未登录，取消导航并重定向到登录页');
      toast.error('请先登录');
      router.push('/login');
      return;
    }
    
    // 执行导航
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
  
  // 如果用户未登录，页面将被重定向，显示空内容
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <PageContainer
      loading={isLoading}
    >
      {/* 欢迎和统计卡片区域 */}
      <SectionContainer
        backgroundClassName="bg-gradient-to-br from-white to-gray-50"
        className="relative overflow-hidden border border-gray-100/80 shadow-sm"
        padding="relaxed"
      >
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
              <span className="text-primary">{getRoleDisplay(user?.role)}</span>
            </Badge>
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={user?.avatar || "/avatars/default.png"} alt={user?.name || '用户'} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* 统计卡片 */}
        <ResponsiveGrid xs={1} sm={2} md={4} gap="md">
          <CardContainer elevated backgroundClassName="bg-white">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 p-3 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">完成任务</p>
                <h4 className="text-2xl font-semibold">{stats.tasksCompleted}</h4>
              </div>
            </div>
          </CardContainer>
          
          <CardContainer elevated backgroundClassName="bg-white">
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-50 p-3 rounded-full">
                <Calendar className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">即将到来</p>
                <h4 className="text-2xl font-semibold">{stats.upcomingEvents}</h4>
              </div>
            </div>
          </CardContainer>
          
          <CardContainer elevated backgroundClassName="bg-white">
            <div className="flex items-center space-x-4">
              <div className="bg-amber-50 p-3 rounded-full">
                <Activity className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">未读消息</p>
                <h4 className="text-2xl font-semibold">{stats.messagesUnread}</h4>
              </div>
            </div>
          </CardContainer>
          
          <CardContainer elevated backgroundClassName="bg-white">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-50 p-3 rounded-full">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">活跃学生</p>
                <h4 className="text-2xl font-semibold">{stats.activeStudents}</h4>
              </div>
            </div>
          </CardContainer>
        </ResponsiveGrid>
      </SectionContainer>
      
      {/* 应用列表区域 */}
      <SectionContainer
        title="应用列表"
        className="mt-6"
        divider
      >
        <ResponsiveGrid xs={1} sm={2} lg={4} gap="md">
          {applications.map((app) => {
            const IconComponent = iconComponents[app.icon];
            const gradientColor = colorMap[app.icon] || 'from-gray-400 to-gray-600';
            
            return (
              <CardContainer
                key={app.id}
                elevated
                clickable
                onClick={() => handleAppClick(app.url)}
                className="h-full transform transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex items-start p-1">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${gradientColor} mr-4 shadow-md`}>
                    {IconComponent && <IconComponent className="h-6 w-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{app.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{app.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {app.roles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {getRoleDisplay(role)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContainer>
            );
          })}
        </ResponsiveGrid>
      </SectionContainer>
    </PageContainer>
  );
} 