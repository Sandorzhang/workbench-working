'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { PageContainer } from '@/components/ui/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SuperAdminHero } from '@/components/superadmin/hero-section';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Shield, 
  User, 
  Users, 
  School,
  RefreshCw,
  Download,
  Upload,
  Filter,
  CheckCircle2,
  XCircle,
  DownloadCloud,
  Lock,
  Unlock,
  MoreHorizontal,
  FileEdit,
  UserCog
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserFormModal } from './user-form-modal';
import { superadminApi } from '@/shared/api';

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
  const { isAuthenticated, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // 模态窗口状态
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  
  // 检查认证状态并加载数据
  useEffect(() => {
    // 验证是否是超级管理员
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (user?.role !== 'superadmin') {
      toast.error('您没有权限访问此页面');
      router.push('/workbench');
      return;
    }
    
    // 加载用户数据
    fetchUsers();
  }, [isAuthenticated, user, router]);
  
  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // 使用superadminApi获取用户列表
      const response = await superadminApi.getUsers();
      
      // 模拟延迟
      setTimeout(() => {
        // 检查API响应结构并正确提取用户数据
        if (response && response.data) {
          setUsers(response.data as User[]);
        } else if (Array.isArray(response)) {
          // 如果直接返回数组
          setUsers(response as User[]);
        } else {
          console.warn('API返回的用户数据格式不符合预期:', response);
          setUsers([]);
        }
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      setIsLoading(false);
      toast.error('获取用户列表失败');
    }
  };
  
  // 过滤用户
  useEffect(() => {
    // 应用搜索和过滤器
    let result = users;
    
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.name?.toLowerCase().includes(query) || 
        user.username?.toLowerCase().includes(query) || 
        user.email?.toLowerCase().includes(query) ||
        user.schoolName?.toLowerCase().includes(query)
      );
    }
    
    // 状态过滤
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    // 角色过滤
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [users, searchQuery, roleFilter, statusFilter]);
  
  // 删除用户处理函数
  const handleDeleteUser = async (userId: string, userName: string) => {
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          // 使用userApi删除用户
          await superadminApi.deleteUser(userId);
          setUsers(users.filter(user => user.id !== userId));
          resolve(true);
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
      
      // 使用superadminApi更新用户状态
      await superadminApi.updateUserStatus(userId, newStatus as 'active' | 'inactive' | 'locked');
      
      // 更新本地状态
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus as 'active' | 'inactive' | 'locked' } : user
      ));
      
      toast.success(`用户已${newStatus === 'locked' ? '锁定' : '解锁'}`);
    } catch (error) {
      console.error('更新用户状态失败:', error);
      toast.error('更新用户状态失败');
    }
  };
  
  // 打开添加用户模态窗口
  const handleOpenAddUserModal = () => {
    setIsAddUserModalOpen(true);
  };

  // 打开编辑用户模态窗口
  const handleOpenEditUserModal = (user: User) => {
    setCurrentUser(user);
    setIsEditUserModalOpen(true);
  };

  // 关闭添加用户模态窗口
  const handleCloseAddUserModal = () => {
    setIsAddUserModalOpen(false);
  };

  // 关闭编辑用户模态窗口
  const handleCloseEditUserModal = () => {
    setIsEditUserModalOpen(false);
    setCurrentUser(undefined);
  };

  // 用户操作成功后的回调
  const handleUserFormSuccess = () => {
    fetchUsers();
  };
  
  return (
    <div className="container py-6">
      <SuperAdminHero
        title="用户管理"
        description="管理平台所有用户，包括系统管理员、教师和学生账号，控制用户访问权限和状态。"
        icon={Users}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenAddUserModal}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              添加用户
            </Button>
            <Button
              onClick={fetchUsers}
              variant="outline"
              className="gap-1"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              刷新数据
            </Button>
          </div>
        }
      />

      {/* 用户管理卡片 */}
      <Card className="overflow-hidden border-border/40 shadow-sm">
        <CardHeader className="bg-muted/50 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>用户列表</CardTitle>
              <CardDescription>管理系统中的所有用户</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* 搜索框 */}
              <div className="relative w-full sm:w-[280px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索姓名、用户名或邮箱..."
                  className="pl-9 h-9 text-sm w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* 状态下拉框 */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-sm w-[130px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                  <SelectItem value="locked">锁定</SelectItem>
                </SelectContent>
              </Select>
              
              {/* 角色下拉框 */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9 text-sm w-[130px]">
                  <SelectValue placeholder="角色" />
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
              
        {/* 用户列表 */}
        <CardContent className="px-6">
          <div className="rounded-md border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>用户名</TableHead>
                  <TableHead>联系方式</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>学校</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-1 py-4">
                        <Users className="h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">无匹配用户</p>
                        {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
                          <Button 
                            variant="link" 
                            size="sm"
                            onClick={() => {
                              setSearchQuery('');
                              setRoleFilter('all');
                              setStatusFilter('all');
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
                        <div className="text-sm">
                          <div>{user.email}</div>
                          <div className="text-muted-foreground">{user.phone || '未设置'}</div>
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
                        {user.schoolName || '—'}
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
        user={currentUser}
        onSuccess={handleUserFormSuccess}
      />
    </div>
  );
} 