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
  AlertTriangle, BarChart3, Loader2, Shield,
  School, MapPin, CheckCircle, XCircle,
  ArrowRight, ArrowUpRight,
  ShieldCheck,
  Webhook,
  Bell,
  Trophy,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { PageContainer } from '@/components/ui/page-container';
import { SectionContainer } from '@/components/ui/section-container';
import { CardContainer } from '@/components/ui/card-container';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

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
  trend?: 'up' | 'down' | 'neutral';
}

function StatsCard({ title, value, description, icon, change, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {change && (
          <div className="mt-2 flex items-center text-xs">
            {trend === 'up' && <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />}
            {trend === 'down' && <ArrowUpRight className="mr-1 h-3 w-3 text-red-500 rotate-180" />}
            <span className={trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}>
              {change}
            </span>
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
      name: '用户管理',
      description: '管理系统用户、角色和账号设置',
      icon: 'users',
      url: '/superadmin/users'
    },
    {
      id: '2',
      name: '学校管理',
      description: '创建和管理学校，设置学校级别的配置',
      icon: 'building',
      url: '/superadmin/schools'
    },
    {
      id: '3',
      name: '区域管理',
      description: '管理系统地区划分和区域设置',
      icon: 'mapPin',
      url: '/superadmin/regions'
    },
    {
      id: '4',
      name: '权限管理',
      description: '设置系统权限和访问控制策略',
      icon: 'lock',
      url: '/superadmin/permissions'
    }
  ];
  
  // 图标映射
  const iconComponents: Record<string, React.ElementType> = {
    'users': Users,
    'building': School,
    'mapPin': MapPin,
    'lock': Lock
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
  
  // 管理模块列表
  const adminModules = [
    {
      title: '用户管理',
      description: '管理系统用户、角色和权限',
      icon: <Users className="h-5 w-5" />,
      href: '/superadmin/users'
    },
    {
      title: '权限管理',
      description: '管理路由和应用的访问权限',
      icon: <ShieldCheck className="h-5 w-5" />,
      href: '/superadmin/permissions'
    },
    {
      title: 'API 管理',
      description: '管理系统 API 和集成',
      icon: <Webhook className="h-5 w-5" />,
      href: '#'
    },
    {
      title: '通知管理',
      description: '管理系统通知和消息',
      icon: <Bell className="h-5 w-5" />,
      href: '#'
    },
    {
      title: '数据统计',
      description: '查看系统使用数据和分析',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '#'
    },
    {
      title: '积分规则',
      description: '管理学生积分和奖励机制',
      icon: <Trophy className="h-5 w-5" />,
      href: '#'
    },
    {
      title: '课程管理',
      description: '管理系统课程和学习资源',
      icon: <BookOpen className="h-5 w-5" />,
      href: '#'
    },
    {
      title: '学业标准',
      description: '管理学业标准和评估规则',
      icon: <GraduationCap className="h-5 w-5" />,
      href: '#'
    }
  ];

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
                <h3 className="text-2xl font-bold mt-1">{stats.users.total}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContainer>
          
          <CardContainer elevated className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">区域总数</p>
                <h3 className="text-2xl font-bold mt-1">{stats.regions.total}</h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-full">
                <MapPin className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
          </CardContainer>
          
          <CardContainer elevated className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">学校总数</p>
                <h3 className="text-2xl font-bold mt-1">{stats.schools.total}</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <School className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContainer>
          
          <CardContainer elevated className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">活跃学校</p>
                <h3 className="text-2xl font-bold mt-1">{stats.schools.active}</h3>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContainer>
        </div>
      </SectionContainer>
      
      {/* 管理应用区域 */}
      <SectionContainer className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">系统管理</h2>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="users">用户</TabsTrigger>
            <TabsTrigger value="regions">区域</TabsTrigger>
            <TabsTrigger value="schools">学校</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="总用户数"
                value={stats.users.total.toString()}
                description="系统中的所有用户账户"
                icon={<Users className="h-5 w-5" />}
              />
              <StatsCard
                title="总区域数"
                value={stats.regions.total.toString()}
                description="所有管理区域"
                icon={<MapPin className="h-5 w-5" />}
              />
              <StatsCard
                title="总学校数"
                value={stats.schools.total.toString()}
                description="系统中的所有学校"
                icon={<School className="h-5 w-5" />}
              />
              <StatsCard
                title="活跃学校"
                value={stats.schools.active.toString()}
                description={`占比 ${stats.schools.total > 0 ? Math.round((stats.schools.active / stats.schools.total) * 100) : 0}%`}
                icon={<CheckCircle className="h-5 w-5" />}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>用户分布</CardTitle>
                  <CardDescription>系统各类型用户数量分布</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="flex flex-col space-y-8">
                    <div className="flex items-center space-x-2">
                      <div className="w-full flex items-center">
                        <div className="mr-2 text-sm min-w-[60px]">超级管理员</div>
                        <div className="h-2 w-full rounded-full overflow-hidden bg-primary/10">
                          <div className="h-full bg-primary" style={{ width: '5%' }} />
                        </div>
                        <span className="ml-2 text-sm">1</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-full flex items-center">
                        <div className="mr-2 text-sm min-w-[60px]">管理员</div>
                        <div className="h-2 w-full rounded-full overflow-hidden bg-primary/10">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: stats.users.total > 0 ? `${(stats.users.admin / stats.users.total) * 100}%` : '0%' }} 
                          />
                        </div>
                        <span className="ml-2 text-sm">{stats.users.admin}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-full flex items-center">
                        <div className="mr-2 text-sm min-w-[60px]">教师</div>
                        <div className="h-2 w-full rounded-full overflow-hidden bg-primary/10">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: stats.users.total > 0 ? `${(stats.users.teacher / stats.users.total) * 100}%` : '0%' }} 
                          />
                        </div>
                        <span className="ml-2 text-sm">{stats.users.teacher}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-full flex items-center">
                        <div className="mr-2 text-sm min-w-[60px]">学生</div>
                        <div className="h-2 w-full rounded-full overflow-hidden bg-primary/10">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: stats.users.total > 0 ? `${(stats.users.student / stats.users.total) * 100}%` : '0%' }} 
                          />
                        </div>
                        <span className="ml-2 text-sm">{stats.users.student}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>区域和学校状态</CardTitle>
                  <CardDescription>系统中区域和学校的启用状态</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="flex flex-col space-y-8">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">区域状态</div>
                      <div className="flex items-center">
                        <div className="w-full flex items-center">
                          <div className="mr-2 text-sm flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            启用
                          </div>
                          <div className="h-2 w-full rounded-full overflow-hidden bg-green-100">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: stats.regions.total > 0 ? `${(stats.regions.active / stats.regions.total) * 100}%` : '0%' }} 
                            />
                          </div>
                          <span className="ml-2 text-sm">{stats.regions.active}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full flex items-center">
                          <div className="mr-2 text-sm flex items-center">
                            <XCircle className="h-3 w-3 mr-1 text-red-500" />
                            禁用
                          </div>
                          <div className="h-2 w-full rounded-full overflow-hidden bg-red-100">
                            <div 
                              className="h-full bg-red-500" 
                              style={{ width: stats.regions.total > 0 ? `${(stats.regions.inactive / stats.regions.total) * 100}%` : '0%' }} 
                            />
                          </div>
                          <span className="ml-2 text-sm">{stats.regions.inactive}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">学校状态</div>
                      <div className="flex items-center">
                        <div className="w-full flex items-center">
                          <div className="mr-2 text-sm flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            启用
                          </div>
                          <div className="h-2 w-full rounded-full overflow-hidden bg-green-100">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: stats.schools.total > 0 ? `${(stats.schools.active / stats.schools.total) * 100}%` : '0%' }} 
                            />
                          </div>
                          <span className="ml-2 text-sm">{stats.schools.active}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full flex items-center">
                          <div className="mr-2 text-sm flex items-center">
                            <XCircle className="h-3 w-3 mr-1 text-red-500" />
                            禁用
                          </div>
                          <div className="h-2 w-full rounded-full overflow-hidden bg-red-100">
                            <div 
                              className="h-full bg-red-500" 
                              style={{ width: stats.schools.total > 0 ? `${(stats.schools.inactive / stats.schools.total) * 100}%` : '0%' }} 
                            />
                          </div>
                          <span className="ml-2 text-sm">{stats.schools.inactive}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">快捷入口</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    <Link href="/superadmin/users">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="mr-2 h-4 w-4 text-primary" />
                        用户管理
                        <ArrowRight className="ml-auto h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/superadmin/regions">
                      <Button variant="outline" className="w-full justify-start">
                        <MapPin className="mr-2 h-4 w-4 text-primary" />
                        区域管理
                        <ArrowRight className="ml-auto h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/superadmin/schools">
                      <Button variant="outline" className="w-full justify-start">
                        <School className="mr-2 h-4 w-4 text-primary" />
                        学校管理
                        <ArrowRight className="ml-auto h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>用户管理</CardTitle>
                <CardDescription>管理系统用户</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>用户统计信息：</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>总用户数：{stats.users.total}</li>
                  <li>管理员：{stats.users.admin}</li>
                  <li>教师：{stats.users.teacher}</li>
                  <li>学生：{stats.users.student}</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/superadmin/users">
                  <Button>
                    <Users className="mr-2 h-4 w-4" />
                    查看所有用户
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="regions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>区域管理</CardTitle>
                <CardDescription>管理系统区域</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>区域统计信息：</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>总区域数：{stats.regions.total}</li>
                  <li>启用区域：{stats.regions.active}</li>
                  <li>禁用区域：{stats.regions.inactive}</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/superadmin/regions">
                  <Button>
                    <MapPin className="mr-2 h-4 w-4" />
                    管理区域
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="schools" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>学校管理</CardTitle>
                <CardDescription>管理系统学校</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>学校统计信息：</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>总学校数：{stats.schools.total}</li>
                  <li>启用学校：{stats.schools.active}</li>
                  <li>禁用学校：{stats.schools.inactive}</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/superadmin/schools">
                  <Button>
                    <School className="mr-2 h-4 w-4" />
                    管理学校
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </SectionContainer>
      
      <SectionContainer className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">系统模块</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {adminModules.map((module, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="p-5">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    {module.icon}
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => module.href !== '#' ? router.push(module.href) : toast.info('功能开发中')}
                >
                  进入管理
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionContainer>
    </PageContainer>
  );
} 