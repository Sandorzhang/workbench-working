'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  Trash2, 
  Shield, 
  User, 
  Users, 
  School,
  Upload,
  DownloadCloud,
  CheckCircle2,
  Lock,
  Unlock,
  MoreHorizontal,
  FileEdit,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserFormModal } from './user-form-modal';

// 用户类型定义
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  status: 'active' | 'inactive' | 'locked';
  schoolId?: string;
  schoolName?: string;
  lastLogin?: string;
  createdAt: string;
}

// 角色映射
const roleMap: Record<string, string> = {
  'superadmin': '超级管理员',
  'admin': '管理员',
  'teacher': '教师',
  'student': '学生'
};

// 状态映射
const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
  'active': { label: '已激活', variant: 'default' },
  'inactive': { label: '未激活', variant: 'secondary' },
  'locked': { label: '已锁定', variant: 'destructive' }
};

// 角色图标映射
const roleIconMap: Record<string, React.ReactNode> = {
  'superadmin': <Shield className="h-4 w-4 text-red-500" />,
  'admin': <Users className="h-4 w-4 text-blue-500" />,
  'teacher': <School className="h-4 w-4 text-emerald-500" />,
  'student': <User className="h-4 w-4 text-amber-500" />
};

export default function SuperAdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');

  // 用户表单模态窗口状态
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  
  // 检查认证状态并加载数据
  useEffect(() => {
    // 验证是否是超级管理员
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (currentUser?.role !== 'superadmin') {
      toast.error('您没有权限访问此页面');
      router.push('/workbench');
      return;
    }
    
    fetchUsers();
  }, [isAuthenticated, currentUser, router]);
  
  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // 从API获取数据
      const response = await fetch('/api/superadmin/users');
      const data = await response.json();
      
      // 模拟延迟
      setTimeout(() => {
        setUsers(data);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      setIsLoading(false);
      toast.error('获取用户列表失败');
    }
  };
  
  // 过滤用户
  const filteredUsers = users.filter(user => {
    // 搜索过滤
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.schoolName && user.schoolName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // 角色过滤
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    // 状态过滤
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    // 标签页过滤
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) ||
      (activeTab === 'teacher' && user.role === 'teacher') ||
      (activeTab === 'student' && user.role === 'student');
    
    return matchesSearch && matchesRole && matchesStatus && matchesTab;
  });
  
  // 删除用户处理函数
  const handleDeleteUser = async (userId: string, userName: string) => {
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          // 调用删除API
          const response = await fetch(`/api/superadmin/users/${userId}`, { 
            method: 'DELETE' 
          });
          
          if (response.ok) {
            setUsers(users.filter(user => user.id !== userId));
            resolve(true);
          } else {
            const errorData = await response.json();
            reject(new Error(errorData.message || '删除用户失败'));
          }
        } catch (error) {
          console.error('删除用户出错:', error);
          reject(error);
        }
      }),
      {
        loading: '正在删除用户...',
        success: '用户已成功删除',
        error: (err) => `删除用户失败: ${err.message}`,
      }
    );
  };
  
  // 锁定/解锁用户处理函数
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'locked' ? 'active' : 'locked';
      
      // 调用API更新用户状态
      const response = await fetch(`/api/superadmin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // 更新本地状态
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: newStatus as 'active' | 'inactive' | 'locked' } : user
        ));
        
        toast.success(`用户已${newStatus === 'locked' ? '锁定' : '解锁'}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || '更新用户状态失败');
      }
    } catch (error) {
      console.error('更新用户状态失败:', error);
      toast.error('更新用户状态失败');
    }
  };
  
  // 更改标签页
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // 打开添加用户模态窗口
  const handleOpenAddUserModal = () => {
    setIsAddUserModalOpen(true);
  };

  // 打开编辑用户模态窗口
  const handleOpenEditUserModal = (user: User) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  // 关闭添加用户模态窗口
  const handleCloseAddUserModal = () => {
    setIsAddUserModalOpen(false);
  };

  // 关闭编辑用户模态窗口
  const handleCloseEditUserModal = () => {
    setIsEditUserModalOpen(false);
    setSelectedUser(undefined);
  };

  // 用户操作成功后的回调
  const handleUserFormSuccess = () => {
    fetchUsers();
  };
  
  return (
    <div className="space-y-6 p-6 pt-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">用户管理</h2>
          <p className="text-muted-foreground text-sm">管理系统中的所有用户账户与权限</p>
        </div>
        <Button onClick={handleOpenAddUserModal} className="shadow-md transition-all hover:shadow-lg">
          <Plus className="mr-2 h-4 w-4" />
          添加用户
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="shadow-sm hover:shadow transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">总用户数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">活跃用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">非活跃用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{users.filter(u => u.status !== 'active').length}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* 筛选工具栏 */}
      <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/20 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">筛选条件</CardTitle>
            <CardDescription className="text-xs mt-0.5">筛选用户数据</CardDescription>
          </div>
          
          {/* 搜索框 */}
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索用户名、邮箱或学校..."
              className="pl-9 h-9 w-full text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">角色</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择角色" />
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
            
            <div>
              <label className="text-sm font-medium block mb-2">状态</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="active">已激活</SelectItem>
                  <SelectItem value="inactive">未激活</SelectItem>
                  <SelectItem value="locked">已锁定</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">标签</label>
              <Select value={activeTab} onValueChange={handleTabChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择标签" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有用户</SelectItem>
                  <SelectItem value="superadmin">超级管理员</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="teacher">教师</SelectItem>
                  <SelectItem value="student">学生</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-between items-center mt-6">
            <div className="flex flex-wrap gap-2 items-center">
              {(roleFilter !== 'all' || statusFilter !== 'all' || activeTab !== 'all') && (
                <>
                  <span className="text-xs text-muted-foreground">已选择:</span>
                  {roleFilter !== 'all' && (
                    <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal flex items-center gap-1.5">
                      角色: {roleMap[roleFilter] || roleFilter}
                    </Badge>
                  )}
                  {statusFilter !== 'all' && (
                    <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal flex items-center gap-1.5">
                      状态: {statusMap[statusFilter]?.label || statusFilter}
                    </Badge>
                  )}
                  {activeTab !== 'all' && activeTab !== roleFilter && (
                    <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal flex items-center gap-1.5">
                      标签: {roleMap[activeTab] || activeTab}
                    </Badge>
                  )}
                </>
              )}
            </div>
            
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button onClick={fetchUsers} className="px-4">
                应用筛选
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setActiveTab('all');
                  setSearchQuery('');
                  setTimeout(() => fetchUsers(), 0);
                }}
                className="px-4"
              >
                清除
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 用户列表 */}
      <Card className="overflow-hidden shadow-md border-0 rounded-xl">
        <CardHeader className="bg-muted/20 px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle>用户列表</CardTitle>
              <CardDescription>管理系统中的所有用户</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                导入
              </Button>
              <Button variant="outline" size="sm">
                <DownloadCloud className="mr-2 h-4 w-4" />
                导出
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 py-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/5">
                  <TableRow>
                    <TableHead className="font-semibold px-6 py-4">用户</TableHead>
                    <TableHead className="font-semibold px-6">角色</TableHead>
                    <TableHead className="font-semibold px-6">状态</TableHead>
                    <TableHead className="font-semibold px-6">学校</TableHead>
                    <TableHead className="font-semibold px-6">最近登录</TableHead>
                    <TableHead className="text-right font-semibold px-6">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-1 py-4">
                          <Users className="h-10 w-10 text-muted-foreground/40" />
                          <p className="text-sm text-muted-foreground">无匹配用户</p>
                          {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || activeTab !== 'all') && (
                            <Button 
                              variant="link" 
                              size="sm"
                              onClick={() => {
                                setSearchQuery('');
                                setRoleFilter('all');
                                setStatusFilter('all');
                                setActiveTab('all');
                              }}
                            >
                              清除所有筛选条件
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map(user => (
                      <TableRow key={user.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-primary/10 p-1.5">
                              {roleIconMap[user.role]}
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={user.role === 'superadmin' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                            variant={user.role === 'superadmin' ? 'outline' : 'secondary'}
                          >
                            {roleMap[user.role] || user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.status === 'active' ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-700">{statusMap[user.status].label}</span>
                            </div>
                          ) : user.status === 'locked' ? (
                            <div className="flex items-center gap-1">
                              <Lock className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-700">{statusMap[user.status].label}</span>
                            </div>
                          ) : (
                            <Badge variant={statusMap[user.status].variant}>
                              {statusMap[user.status].label}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.schoolName || '—'}
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '未登录'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">打开菜单</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem 
                                onClick={() => handleOpenEditUserModal(user)}
                                className="cursor-pointer"
                              >
                                <FileEdit className="h-4 w-4 mr-2" />
                                编辑用户
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => handleToggleUserStatus(user.id, user.status)}
                                className={`cursor-pointer ${user.status === 'locked' ? 'text-green-600' : 'text-amber-600'}`}
                              >
                                {user.status === 'locked' ? (
                                  <>
                                    <Unlock className="h-4 w-4 mr-2" />
                                    解锁用户
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    锁定用户
                                  </>
                                )}
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                className="cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => {
                                  toast.custom((t) => (
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border max-w-md mx-auto">
                                      <h2 className="text-xl font-semibold mb-2">确认删除用户</h2>
                                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        您确定要删除用户 "{user.name}" 吗？此操作不可撤销。
                                      </p>
                                      <div className="flex justify-end gap-2">
                                        <Button 
                                          variant="outline" 
                                          onClick={() => toast.dismiss(t)}
                                        >
                                          取消
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => {
                                            handleDeleteUser(user.id, user.name);
                                            toast.dismiss(t);
                                          }}
                                        >
                                          删除
                                        </Button>
                                      </div>
                                    </div>
                                  ), {
                                    duration: Infinity,
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                删除用户
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加用户模态窗口 */}
      <UserFormModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseAddUserModal}
        onSuccess={handleUserFormSuccess}
      />

      {/* 编辑用户模态窗口 */}
      <UserFormModal
        isOpen={isEditUserModalOpen}
        onClose={handleCloseEditUserModal}
        user={selectedUser}
        onSuccess={handleUserFormSuccess}
      />
    </div>
  );
} 