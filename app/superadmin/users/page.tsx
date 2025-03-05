'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { PageContainer } from '@/components/ui/page-container';
import { SectionContainer } from '@/components/ui/section-container';
import { 
  Search, 
  UserPlus,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// 模拟用户数据
const mockUsers = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'admin',
    tenant: '北京第一中学',
    createdAt: '2023-06-15T00:00:00.000Z'
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    role: 'teacher',
    tenant: '通用平台',
    createdAt: '2023-07-20T00:00:00.000Z'
  },
  {
    id: '3',
    name: '王超',
    email: 'wangchao@example.com',
    role: 'superadmin',
    tenant: '教育部',
    createdAt: '2023-05-10T00:00:00.000Z'
  }
];

// 角色映射
const roleMap: Record<string, {label: string, color: string}> = {
  'superadmin': {label: '超级管理员', color: 'bg-red-100 text-red-800 border-red-200'},
  'admin': {label: '管理员', color: 'bg-blue-100 text-blue-800 border-blue-200'},
  'teacher': {label: '教师', color: 'bg-green-100 text-green-800 border-green-200'},
  'student': {label: '学生', color: 'bg-purple-100 text-purple-800 border-purple-200'}
};

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // 检查认证状态和权限
  useEffect(() => {
    if (!authLoading) {
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
      
      // 模拟加载效果
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  }, [authLoading, isAuthenticated, user, router]);
  
  // 搜索过滤
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    roleMap[user.role]?.label.includes(searchQuery)
  );
  
  // 如果认证状态仍在加载，显示加载状态
  if (authLoading || isLoading) {
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
    <PageContainer>
      <SectionContainer className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户和权限管理</h1>
            <p className="text-gray-500 mt-1">管理系统用户、角色和权限设置</p>
          </div>
          
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            添加用户
          </Button>
        </div>
        
        {/* 搜索过滤 */}
        <div className="flex mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="搜索用户..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* 用户表格 */}
        <Card>
          <CardHeader className="bg-gray-50 py-4">
            <CardTitle className="text-lg text-gray-700">系统用户</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>租户</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      没有找到匹配的用户
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const roleInfo = roleMap[user.role] || {label: user.role, color: 'bg-gray-100 text-gray-800 border-gray-200'};
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={`font-normal ${roleInfo.color}`}>
                            {user.role === 'superadmin' && <ShieldAlert className="h-3 w-3 mr-1" />}
                            {roleInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.tenant}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            编辑
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </SectionContainer>
    </PageContainer>
  );
} 