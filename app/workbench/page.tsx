'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from "sonner";
import { 
  Sparkles, TrendingUp, Activity, 
  Loader2, Calendar, School, Users,
  AlertCircle, ChevronRight
} from 'lucide-react';
import { PageContainer } from '@/components/ui/page-container';
import { SectionContainer } from '@/components/ui/section-container';
import { CardContainer } from '@/components/ui/card-container';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { WorkbenchSkeleton } from '@/components/ui/workbench-skeleton';
import { ApplicationsSkeleton } from '@/components/ui/applications-skeleton';
import { ApplicationCard } from '@/components/application-card';

// 应用类型定义
interface Application {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
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

export default function WorkbenchPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
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
      console.log("认证检查完成，状态:", { 
        isAuthenticated, 
        userId: user?.id, 
        userName: user?.name, 
        userRole: user?.role 
      });
      
      setAuthChecked(true);
      
      if (!isAuthenticated) {
        console.log('未登录状态，重定向到登录页');
        toast.error('请先登录');
        router.push('/login');
      } else {
        console.log('用户已登录:', user?.name, user?.id);
        
        // 检查localStorage中是否有token
        const token = localStorage.getItem("token");
        console.log("Token检查:", token ? "存在" : "不存在");
        
        if (!token) {
          console.warn("Token不存在，重定向到登录页面");
          toast.warning("会话已过期，请重新登录");
          router.push("/login");
        }
      }
    }
  }, [authLoading, isAuthenticated, user, router]);
  
  // 应用获取逻辑
  useEffect(() => {
    // 只有在用户认证后才加载应用
    if (!authChecked || !isAuthenticated || !user) {
      console.log("不满足加载应用条件:", { authChecked, isAuthenticated, userExists: !!user });
      return;
    }
    
    console.log('开始获取应用数据, 用户ID:', user.id);
    
    const fetchApplications = async () => {
      try {
        console.log("开始获取应用数据...");
        setLoading(true);
        
        // 构建API请求URL
        const apiUrl = '/api/applications';
        console.log("API请求URL:", apiUrl);
        
        // 发送请求获取应用列表
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log("API响应状态:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("获取应用列表失败:", errorData);
          toast.error("获取应用列表失败");
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log(`获取到 ${data.length} 个应用`);
        
        // 打印应用详情
        data.forEach((app: Application, index: number) => {
          console.log(`应用 ${index + 1}:`, app.id, app.name, app.url);
        });
        
        setApplications(data);
        setLoading(false);
      } catch (error) {
        console.error("获取应用列表时出错:", error);
        toast.error("获取应用列表失败");
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [authChecked, isAuthenticated, user]);
  
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="flex flex-col items-center space-y-4 p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border border-gray-100/60 dark:border-gray-800/40">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">系统加载中...</p>
        </div>
      </div>
    );
  }
  
  // 如果用户未登录，页面将被重定向，显示空内容
  if (!isAuthenticated) {
    return <WorkbenchSkeleton />;
  }
  
  console.log("准备渲染Workbench页面，应用数量:", applications.length);
  
  return (
    <PageContainer
      loading={loading}
      spacing="relaxed"
      backgroundClassName="bg-gradient-to-b from-gray-50/80 to-white/80 dark:from-gray-950/80 dark:to-gray-900/80"
    >
      {/* 欢迎和统计卡片区域 */}
      <SectionContainer
        backgroundClassName="bg-gradient-to-br from-white/70 to-gray-50/80 dark:from-gray-900/70 dark:to-gray-800/80"
        className="relative overflow-hidden shadow-lg border-0"
        padding="relaxed"
      >
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -mr-32 -mt-32 blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/10 to-transparent rounded-full -ml-32 -mb-32 blur-3xl opacity-70"></div>
        <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-[2px] backdrop-filter z-0"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-8 relative z-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mr-2">{getGreeting()},</span>
              <span className="text-gray-900 dark:text-gray-100">{user?.name || '同学'}</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">{formatDate()} · 欢迎回到工作台</p>
            {user?.school && (
              <p className="text-primary/90 dark:text-primary/80 flex items-center text-base">
                <School className="inline-block h-4 w-4 mr-1.5" />
                {user.school} · {user.schoolType || '学校'}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm border-primary/20 dark:border-primary/30">
              <Sparkles className="h-4 w-4 text-primary mr-2" />
              <span className="text-primary font-medium">{getRoleDisplay(user?.role)}</span>
            </Badge>
            <Avatar className="h-14 w-14 border-2 border-primary/20 dark:border-primary/30 shadow-sm">
              <AvatarImage src={user?.avatar || "/avatars/default.png"} alt={user?.name || '用户'} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* 统计卡片 */}
        <ResponsiveGrid xs={1} sm={2} md={4} gap="lg">
          <CardContainer elevated backgroundClassName="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-5 p-1">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 rounded-xl shadow-sm">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">完成任务</p>
                <h4 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-500">{stats.tasksCompleted}</h4>
              </div>
            </div>
          </CardContainer>
          
          <CardContainer elevated backgroundClassName="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-5 p-1">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4 rounded-xl shadow-sm">
                <Calendar className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">即将到来</p>
                <h4 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-500">{stats.upcomingEvents}</h4>
              </div>
            </div>
          </CardContainer>
          
          <CardContainer elevated backgroundClassName="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-5 p-1">
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4 rounded-xl shadow-sm">
                <Activity className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">未读消息</p>
                <h4 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-500">{stats.messagesUnread}</h4>
              </div>
            </div>
          </CardContainer>
          
          <CardContainer elevated backgroundClassName="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-5 p-1">
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4 rounded-xl shadow-sm">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">活跃学生</p>
                <h4 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-500">{stats.activeStudents}</h4>
              </div>
            </div>
          </CardContainer>
        </ResponsiveGrid>
      </SectionContainer>
      
      {/* 应用列表区域 */}
      <SectionContainer
        title={`应用列表 (${applications.length}个)`}
        description="点击卡片进入相应的应用模块"
        className="mt-8 shadow-md"
        divider
        actions={
          <Button variant="ghost" className="text-primary hover:text-primary/90 hover:bg-primary/5">
            查看全部
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        }
      >
        {loading ? (
          <ApplicationsSkeleton />
        ) : applications.length === 0 ? (
          <div className="p-12 text-center border border-gray-100/60 dark:border-gray-800/40 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
            <div className="mb-5 bg-gray-50/80 dark:bg-gray-800/80 p-5 rounded-full inline-flex">
              <AlertCircle className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-medium mb-3 text-gray-800 dark:text-gray-200">没有可用的应用</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              您当前没有权限访问任何应用。
              {user && <span> 用户角色: {user.role}</span>}
            </p>
            <Button variant="outline" className="bg-white/80 dark:bg-gray-800/80">
              刷新
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {applications.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </div>
        )}
      </SectionContainer>
    </PageContainer>
  );
} 