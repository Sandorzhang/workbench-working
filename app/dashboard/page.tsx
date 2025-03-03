'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, Users, FileText, Calendar, 
  Sparkles, TrendingUp, Activity, Clock,
  Database
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

// 图标映射 - 使用类型断言避免TypeScript错误
const iconComponents: Record<string, any> = {
  'book': BookOpen,
  'users': Users,
  'file': FileText,
  'calendar': Calendar,
  'database': Database,
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
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
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
      },
      {
        id: '5',
        name: '数据资产管理',
        description: '管理和浏览教学相关的各类数据资源',
        icon: 'database',
        url: '/data-assets',
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
                <div className="flex flex-col h-full">
                  <div className="flex items-start mb-4">
                    <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${gradientColor} text-white`}>
                      {IconComponent && <IconComponent className="h-6 w-6" />}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-lg text-gray-900">{app.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">{app.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex justify-end">
                    <Button 
                      variant="ghost" 
                      className="text-primary hover:text-primary/80 hover:bg-primary/5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAppClick(app.url);
                      }}
                    >
                      进入应用
                    </Button>
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