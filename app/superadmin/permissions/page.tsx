'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { PageContainer } from '@/components/ui/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Shield, 
  UserCog, 
  Settings, 
  AppWindow, 
  Info, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  User
} from 'lucide-react';

// 资源权限类型
interface ResourcePermission {
  id: string;
  name: string;
  description: string;
  path?: string;
  url?: string;
  icon?: string;
  roles: string[];
  allowedRoles: {
    [key: string]: boolean;
  };
  userOverrides?: {
    userId: string;
    userName: string;
    allowed: boolean;
  }[];
}

// 用户权限类型
interface UserPermission {
  user: {
    id: string;
    name: string;
    role: string;
  };
  applications: {
    id: string;
    name: string;
    description: string;
    url: string;
    icon?: string;
    allowed: boolean;
    hasCustomPermission: boolean;
  }[];
}

// 角色映射
const roleMap: Record<string, string> = {
  'superadmin': '超级管理员',
  'admin': '管理员',
  'teacher': '教师',
  'student': '学生'
};

export default function PermissionsPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('applications');
  const [appPermissions, setAppPermissions] = useState<ResourcePermission[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserPermission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [users, setUsers] = useState<{id: string, name: string, role: string}[]>([]);
  
  // 检查认证状态
  useEffect(() => {
    console.log('权限页面认证状态检查:', { 
      authLoading, 
      isAuthenticated, 
      userRole: currentUser?.role 
    });
    
    // 等待认证状态加载完成
    if (authLoading) {
      console.log('认证状态加载中...');
      return;
    }
    
    if (!isAuthenticated) {
      console.log('未认证，重定向到登录页');
      router.push('/login');
      return;
    }
    
    if (!currentUser) {
      console.log('用户数据未加载，等待...');
      return;
    }
    
    if (currentUser.role !== 'superadmin') {
      console.log('无权限访问，重定向到首页');
      toast.error('您没有权限访问此页面');
      router.push('/workbench');
      return;
    }
    
    console.log('认证通过，开始加载权限数据');
    // 加载初始数据
    fetchAppPermissions();
    fetchUsers();
  }, [isAuthenticated, currentUser, router, authLoading]);
  
  // 当选择的用户ID改变时，获取用户权限
  useEffect(() => {
    if (selectedUserId && selectedUserId !== 'none') {
      fetchUserPermissions(selectedUserId);
    } else {
      setSelectedUser(null);
    }
  }, [selectedUserId]);
  
  // 获取应用权限
  const fetchAppPermissions = async () => {
    try {
      setIsLoading(true);
      console.log('开始获取应用权限...');
      const response = await fetch(`/api/permissions/applications?role=${roleFilter === 'all' ? '' : roleFilter}`);
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`成功获取应用权限: ${data.length}个应用`);
      setAppPermissions(data);
      setIsLoading(false);
    } catch (error) {
      console.error('获取应用权限失败:', error);
      toast.error('获取应用权限失败');
      setAppPermissions([]);
      setIsLoading(false);
    }
  };
  
  // 获取用户列表
  const fetchUsers = async () => {
    try {
      console.log('开始获取用户列表...');
      const response = await fetch('/api/superadmin/users');
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`成功获取${data.length}个用户`);
      setUsers(data.map((user: any) => ({
        id: user.id,
        name: user.name,
        role: user.role
      })));
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast.error('获取用户列表失败');
      setUsers([]);
    }
  };
  
  // 获取用户权限
  const fetchUserPermissions = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/permissions/user/${userId}`);
      const data = await response.json();
      
      // 移除路由权限数据，只保留应用权限
      const userPermission: UserPermission = {
        user: data.user,
        applications: data.applications
      };
      
      setSelectedUser(userPermission);
      setIsLoading(false);
    } catch (error) {
      console.error('获取用户权限失败:', error);
      toast.error('获取用户权限失败');
      setIsLoading(false);
    }
  };
  
  // 更新角色权限
  const updateRolePermission = async (role: string, resourceType: 'application', resourceId: string, allowed: boolean) => {
    try {
      const response = await fetch('/api/permissions/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          resourceType,
          resourceId,
          allowed
        }),
      });
      
      if (!response.ok) {
        throw new Error('更新权限失败');
      }
      
      toast.success(`已${allowed ? '授予' : '移除'} ${roleMap[role]} 的权限`);
      
      // 刷新权限数据
      fetchAppPermissions();
    } catch (error) {
      console.error('更新角色权限失败:', error);
      toast.error('更新角色权限失败');
    }
  };
  
  // 更新用户权限
  const updateUserPermission = async (userId: string, resourceType: 'application', resourceId: string, allowed: boolean) => {
    try {
      const response = await fetch('/api/permissions/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          resourceType,
          resourceId,
          allowed
        }),
      });
      
      if (!response.ok) {
        throw new Error('更新权限失败');
      }
      
      toast.success(`已${allowed ? '授予' : '移除'}用户权限`);
      
      // 刷新用户权限
      fetchUserPermissions(userId);
      
      // 刷新应用权限列表
      fetchAppPermissions();
    } catch (error) {
      console.error('更新用户权限失败:', error);
      toast.error('更新用户权限失败');
    }
  };
  
  // 删除用户特定权限（恢复到角色默认）
  const resetUserPermission = async (userId: string, resourceType: 'application', resourceId: string) => {
    try {
      const response = await fetch(`/api/permissions/user?userId=${userId}&resourceType=${resourceType}&resourceId=${resourceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('重置权限失败');
      }
      
      toast.success('已重置为角色默认权限');
      
      // 刷新用户权限
      fetchUserPermissions(userId);
      
      // 刷新应用权限列表
      fetchAppPermissions();
    } catch (error) {
      console.error('重置用户权限失败:', error);
      toast.error('重置用户权限失败');
    }
  };
  
  // 刷新数据
  const refreshData = () => {
    fetchAppPermissions();
    if (selectedUserId) {
      fetchUserPermissions(selectedUserId);
    }
  };
  
  // 过滤应用权限数据
  const filteredApps = appPermissions.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.url && app.url.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <PageContainer loading={isLoading || authLoading}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">应用权限管理</h1>
            <p className="text-muted-foreground mt-1">
              管理系统应用的访问权限
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新数据
            </Button>
          </div>
        </div>
        
        {/* 主要内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧面板 - 用户选择 */}
          <Card className="lg:col-span-1">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg">用户权限配置</CardTitle>
              <CardDescription>
                选择用户查看或修改其权限
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-select">选择用户</Label>
                  <Select 
                    value={selectedUserId} 
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择用户" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无 (仅查看角色权限)</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({roleMap[user.role] || user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedUser && (
                  <div className="pt-4 space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Badge>{roleMap[selectedUser.user.role] || selectedUser.user.role}</Badge>
                        <h3 className="font-medium">{selectedUser.user.name}</h3>
                      </div>
                      <div className="mt-4 text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>应用权限:</span>
                          <span className="font-semibold">{selectedUser.applications.filter(a => a.allowed).length}/{selectedUser.applications.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>自定义权限:</span>
                          <span className="font-semibold">{selectedUser.applications.filter(a => a.hasCustomPermission).length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>用户权限说明</AlertTitle>
                      <AlertDescription>
                        用户权限首先继承自角色权限，可以通过自定义权限进行覆盖。重置权限将删除自定义权限设置，恢复到角色默认值。
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* 右侧面板 - 权限管理 */}
          <Card className="lg:col-span-3">
            <CardHeader className="px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">权限详情</CardTitle>
                  <CardDescription>
                    管理应用的访问权限
                  </CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="搜索资源..."
                      className="pl-8 bg-background"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select 
                    value={roleFilter} 
                    onValueChange={(value) => {
                      setRoleFilter(value);
                      fetchAppPermissions();
                    }}
                  >
                    <SelectTrigger className="w-[150px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="按角色筛选" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有角色</SelectItem>
                      <SelectItem value="superadmin">超级管理员</SelectItem>
                      <SelectItem value="admin">管理员</SelectItem>
                      <SelectItem value="teacher">教师</SelectItem>
                      <SelectItem value="student">学生</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                <TabsList>
                  <TabsTrigger value="applications" className="flex items-center">
                    <AppWindow className="mr-2 h-4 w-4" />
                    应用权限
                  </TabsTrigger>
                  {selectedUser && (
                    <TabsTrigger value="user" className="flex items-center">
                      <UserCog className="mr-2 h-4 w-4" />
                      用户权限
                    </TabsTrigger>
                  )}
                </TabsList>
                
                {/* 应用权限标签页 */}
                <TabsContent value="applications" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">应用名称</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead className="hidden md:table-cell">超级管理员</TableHead>
                          <TableHead className="hidden md:table-cell">管理员</TableHead>
                          <TableHead className="hidden md:table-cell">教师</TableHead>
                          <TableHead className="hidden md:table-cell">学生</TableHead>
                          <TableHead className="min-w-[100px]">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApps.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              <div className="flex flex-col items-center justify-center gap-1 py-4">
                                <AppWindow className="h-8 w-8 text-muted-foreground/40" />
                                <p className="text-sm text-muted-foreground">无匹配应用</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredApps.map(app => (
                            <TableRow key={app.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{app.name}</div>
                                  <div className="text-sm text-muted-foreground">{app.description}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                                  {app.url}
                                </code>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Switch 
                                  checked={app.allowedRoles.superadmin} 
                                  onCheckedChange={(checked) => {
                                    updateRolePermission('superadmin', 'application', app.id, checked);
                                  }}
                                />
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Switch 
                                  checked={app.allowedRoles.admin} 
                                  onCheckedChange={(checked) => {
                                    updateRolePermission('admin', 'application', app.id, checked);
                                  }}
                                />
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Switch 
                                  checked={app.allowedRoles.teacher} 
                                  onCheckedChange={(checked) => {
                                    updateRolePermission('teacher', 'application', app.id, checked);
                                  }}
                                />
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Switch 
                                  checked={app.allowedRoles.student} 
                                  onCheckedChange={(checked) => {
                                    updateRolePermission('student', 'application', app.id, checked);
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex md:hidden space-x-1 mb-2">
                                  <Badge variant="outline" className={app.allowedRoles.superadmin ? "bg-green-100" : "bg-red-100"}>
                                    超管
                                  </Badge>
                                  <Badge variant="outline" className={app.allowedRoles.admin ? "bg-green-100" : "bg-red-100"}>
                                    管理员
                                  </Badge>
                                  <Badge variant="outline" className={app.allowedRoles.teacher ? "bg-green-100" : "bg-red-100"}>
                                    教师
                                  </Badge>
                                  <Badge variant="outline" className={app.allowedRoles.student ? "bg-green-100" : "bg-red-100"}>
                                    学生
                                  </Badge>
                                </div>
                                
                                {selectedUserId && (
                                  <Button 
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      // 检查用户当前权限状态
                                      const userOverride = app.userOverrides?.find(uo => uo.userId === selectedUserId);
                                      const userRole = users.find(u => u.id === selectedUserId)?.role || '';
                                      const roleAllowed = userRole ? app.allowedRoles[userRole] : false;
                                      
                                      // 如果有自定义权限，则相反；否则根据角色权限相反
                                      const newAllowed = userOverride !== undefined ? !userOverride.allowed : !roleAllowed;
                                      
                                      updateUserPermission(selectedUserId, 'application', app.id, newAllowed);
                                    }}
                                  >
                                    自定义权限
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                {/* 用户权限标签页 */}
                {selectedUser && (
                  <TabsContent value="user" className="space-y-6">
                    {/* 应用权限 */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">应用权限</h3>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[200px]">应用名称</TableHead>
                              <TableHead>URL</TableHead>
                              <TableHead className="w-[100px]">状态</TableHead>
                              <TableHead className="min-w-[100px]">操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedUser.applications.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                  无应用权限数据
                                </TableCell>
                              </TableRow>
                            ) : (
                              selectedUser.applications.map(app => (
                                <TableRow key={app.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{app.name}</div>
                                      <div className="text-sm text-muted-foreground">{app.description}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                                      {app.url}
                                    </code>
                                  </TableCell>
                                  <TableCell>
                                    {app.allowed ? (
                                      <div className="flex items-center text-green-600">
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        <span>允许</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center text-red-600">
                                        <XCircle className="h-4 w-4 mr-1" />
                                        <span>禁止</span>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button 
                                        variant={app.allowed ? "destructive" : "default"}
                                        size="sm"
                                        onClick={() => {
                                          updateUserPermission(selectedUser.user.id, 'application', app.id, !app.allowed);
                                        }}
                                      >
                                        {app.allowed ? '禁止' : '允许'}
                                      </Button>
                                      
                                      {app.hasCustomPermission && (
                                        <Button 
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            resetUserPermission(selectedUser.user.id, 'application', app.id);
                                          }}
                                        >
                                          重置
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
} 