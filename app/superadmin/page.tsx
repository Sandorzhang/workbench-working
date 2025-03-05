'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from "sonner";
import { 
  ShieldAlert, Settings, Database, Users, Server,
  Lock, FileText, Sparkles, Activity, Globe,
  AlertTriangle, BarChart3, Loader2, Shield
} from 'lucide-react';
import { PageContainer } from '@/components/ui/page-container';
import { SectionContainer } from '@/components/ui/section-container';
import { CardContainer } from '@/components/ui/card-container';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';

// 管理系统应用类型定义
interface AdminApplication {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true); 
  const [currentDate] = useState(new Date());
  const [authChecked, setAuthChecked] = useState(false);
  
  // 系统摘要数据 - 模拟数据
  const [stats] = useState({
    activeUsers: 152,
    totalTenants: 8,
    systemAlerts: 3,
    systemHealth: 98
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
        return;
      }
      
      if (user?.role !== 'superadmin') {
        console.log('非超级管理员，重定向到工作台');
        toast.error('您没有权限访问此页面');
        router.push('/dashboard');
        return;
      }
      
      console.log('超级管理员已登录:', user?.name, user?.id);
      
      // 验证token是否存在，确保用户真的登录了
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('登录状态异常：用户已认证但没有token');
        toast.error('登录状态异常，请重新登录');
        router.push('/login');
      }
      
      // 模拟加载时间为了展示动画效果
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [authLoading, isAuthenticated, user, router]);
  
  // 管理应用数据
  const adminApplications: AdminApplication[] = [
    {
      id: '1',
      name: '用户和权限管理',
      description: '管理系统用户、角色和权限设置',
      icon: 'users',
      url: '/superadmin/users'
    },
    {
      id: '2',
      name: '租户管理',
      description: '创建和管理系统租户，设置租户级别的配置和权限',
      icon: 'building',
      url: '/superadmin/tenants'
    },
    {
      id: '3',
      name: '系统配置',
      description: '管理系统全局设置和参数配置',
      icon: 'settings',
      url: '/superadmin/settings'
    },
    {
      id: '4',
      name: '日志与审计',
      description: '查看系统日志和用户操作记录',
      icon: 'fileText',
      url: '/superadmin/logs'
    },
    {
      id: '5',
      name: '系统监控',
      description: '监控系统性能和资源使用情况',
      icon: 'activity',
      url: '/superadmin/monitor'
    },
    {
      id: '6',
      name: '数据备份与恢复',
      description: '管理系统数据备份和恢复任务',
      icon: 'database',
      url: '/superadmin/backup'
    },
    {
      id: '7',
      name: '模块管理',
      description: '启用/禁用系统功能模块，管理模块配置',
      icon: 'layers',
      url: '/superadmin/modules'
    },
    {
      id: '8',
      name: '安全中心',
      description: '查看和管理系统安全策略及异常情况',
      icon: 'shield',
      url: '/superadmin/security'
    }
  ];
  
  // 图标映射
  const iconComponents: Record<string, React.ElementType> = {
    'users': Users,
    'building': Server,
    'settings': Settings,
    'fileText': FileText,
    'activity': Activity,
    'database': Database,
    'layers': Globe,
    'shield': Shield
  };
  
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
    
    if (user.role !== 'superadmin') {
      console.warn('非超级管理员，取消导航');
      toast.error('您没有权限访问此页面');
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
  
  // 如果用户未登录或不是超级管理员，页面将被重定向，显示空内容
  if (!isAuthenticated || user?.role !== 'superadmin') {
    return null;
  }
  
  return (
    <PageContainer
      loading={isLoading}
    >
      {/* 欢迎和统计卡片区域 */}
      <SectionContainer
        backgroundClassName="bg-gradient-to-br from-slate-50 to-gray-50"
        className="relative overflow-hidden border border-gray-100/80 shadow-sm"
        padding="relaxed"
      >
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-red-50 to-transparent rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-red-50 to-transparent rounded-full -ml-32 -mb-32"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-500 mr-2">{getGreeting()}</span>
              {user?.name || '管理员'}
            </h2>
            <p className="text-gray-500 mt-1">{formatDate()} · 超级管理员控制台</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1.5 bg-white border-red-200">
              <ShieldAlert className="h-3.5 w-3.5 text-red-500 mr-1" />
              <span className="text-red-500">超级管理员</span>
            </Badge>
            <Avatar className="h-12 w-12 border-2 border-red-200">
              <AvatarImage src={user?.avatar || "/avatars/default.png"} alt={user?.name || '用户'} />
              <AvatarFallback className="bg-red-50 text-red-500">
                {user?.name?.charAt(0) || 'S'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* 系统摘要统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <CardContainer elevated className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">活跃用户</p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeUsers}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContainer>
          
          <CardContainer elevated className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">租户总数</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalTenants}</h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-full">
                <Server className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
          </CardContainer>
          
          <CardContainer elevated className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">系统告警</p>
                <h3 className="text-2xl font-bold mt-1">{stats.systemAlerts}</h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContainer>
          
          <CardContainer elevated className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">系统健康度</p>
                <h3 className="text-2xl font-bold mt-1">{stats.systemHealth}%</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <BarChart3 className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContainer>
        </div>
      </SectionContainer>
      
      {/* 管理应用区域 */}
      <SectionContainer className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">系统管理</h2>
        
        <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
          {adminApplications.map((app) => {
            const IconComponent = iconComponents[app.icon];
            
            // 为不同类型的应用分配不同的渐变色背景
            let gradientColor = 'from-slate-500 to-slate-600';
            
            if (app.icon === 'users') gradientColor = 'from-blue-500 to-blue-600';
            if (app.icon === 'building') gradientColor = 'from-indigo-500 to-indigo-600';
            if (app.icon === 'settings') gradientColor = 'from-gray-500 to-gray-600';
            if (app.icon === 'fileText') gradientColor = 'from-purple-500 to-purple-600';
            if (app.icon === 'activity') gradientColor = 'from-green-500 to-green-600';
            if (app.icon === 'database') gradientColor = 'from-amber-500 to-amber-600';
            if (app.icon === 'layers') gradientColor = 'from-cyan-500 to-cyan-600';
            if (app.icon === 'shield') gradientColor = 'from-red-500 to-red-600';
            
            return (
              <CardContainer
                key={app.id}
                elevated
                clickable
                onClick={() => handleAppClick(app.url)}
                className="h-full transform transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex items-start p-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${gradientColor} mr-4 shadow-md`}>
                    {IconComponent && <IconComponent className="h-6 w-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{app.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{app.description}</p>
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