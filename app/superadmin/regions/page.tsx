"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Region, RegionPageRequest } from '@/types/models/region';
import { 
  getRegionsByPage, 
  createRegion, 
  updateRegion, 
  deleteRegion as deleteRegionApi
} from '@/api/regions';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Plus, Edit, Trash2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

// 对话框组件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 表单验证模式
const regionFormSchema = z.object({
  id: z
    .string()
    .min(6, { message: '区域编码必须为6位数字' })
    .max(6, { message: '区域编码必须为6位数字' })
    .regex(/^\d+$/, { message: '区域编码只能包含数字' }),
  name: z
    .string()
    .min(2, { message: '区域名称至少需要2个字符' })
    .max(50, { message: '区域名称不能超过50个字符' }),
  status: z.boolean().default(true),
});

type RegionFormValues = z.infer<typeof regionFormSchema>;

// 默认表单值
const defaultValues: RegionFormValues = {
  id: '',
  name: '',
  status: true,
};

// 每页条数选项
const pageSizeOptions = [10, 20, 50, 100];

export default function RegionsPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const [regions, setRegions] = useState<Region[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [regionToDelete, setRegionToDelete] = useState<Region | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const form = useForm<RegionFormValues>({
    resolver: zodResolver(regionFormSchema),
    defaultValues,
  });

  // 身份验证检查
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
    
    if (!authLoading && isAuthenticated && user?.role !== 'superadmin') {
      router.push('/workbench');
    }
  }, [authLoading, isAuthenticated, router, user]);

  // 初始数据加载
  useEffect(() => {
    if (isAuthenticated && user?.role === 'superadmin') {
      fetchRegions();
    }
  }, [isAuthenticated, user, pageNumber, pageSize]);

  // 搜索或状态筛选时重置页码并获取数据
  useEffect(() => {
    if (isAuthenticated && user?.role === 'superadmin') {
      setPageNumber(1);
      const timeoutId = setTimeout(() => {
        fetchRegions();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, statusFilter]);

  // 获取区域数据
  const fetchRegions = async () => {
    try {
      setIsLoading(true);
      
      const params: RegionPageRequest = {
        pageNumber,
        pageSize
      };
      
      // 添加可选的筛选条件
      if (searchQuery) {
        params.name = searchQuery;
      }
      
      if (statusFilter !== undefined) {
        params.status = statusFilter;
      }
      
      console.log('获取区域数据参数:', params);
      // 使用更新后的API调用，已经整合了request模块
      const response = await getRegionsByPage(params);
      console.log('获取区域数据响应:', response);
      
      // Request模块会自动解析并提取响应数据，处理错误情况
      if (response && response.code === "0" && response.data) {
        // 正确获取数据
        setRegions(response.data.list || []);
        setTotalCount(response.data.totalCount || 0);
        setTotalPage(response.data.totalPage || 1);
      } else {
        // 处理错误响应
        setRegions([]);
        setTotalCount(0);
        setTotalPage(0);
        console.error('获取区域数据失败:', response?.msg || '未知错误');
        toast.error(response?.msg || '获取区域数据失败');
      }
    } catch (error: unknown) {
      // 处理请求异常
      console.error('获取区域数据异常:', error);
      setRegions([]);
      setTotalCount(0);
      setTotalPage(0);
      
      // 安全地获取错误消息
      let errorMessage = '获取区域数据失败';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String((error as { message: unknown }).message);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 打开添加区域对话框
  const openAddDialog = () => {
    setIsEditMode(false);
    setCurrentRegion(null);
    form.reset(defaultValues);
    setIsDialogOpen(true);
  };

  // 打开编辑区域对话框
  const openEditDialog = (region: Region) => {
    setIsEditMode(true);
    setCurrentRegion(region);
    form.reset({
      id: region.id,
      name: region.name,
      status: region.status,
    });
    setIsDialogOpen(true);
  };

  // 提交表单
  const onSubmit = async (values: RegionFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditMode && currentRegion) {
        // 更新区域
        const { name, status } = values;
        await updateRegion(currentRegion.id, { name, status });
        toast.success('区域更新成功');
      } else {
        // 创建区域
        const response = await createRegion(values);
        
        if (response.code === "0") {
          toast.success('区域创建成功');
        } else {
          toast.error(response.msg || '创建区域失败');
          // 创建失败时不关闭对话框，让用户有机会修改
          setIsSubmitting(false);
          return;
        }
      }
      
      setIsDialogOpen(false);
      fetchRegions(); // 重新获取数据
    } catch (error: unknown) {
      console.error('Error submitting region:', error);
      toast.error(error instanceof Error ? error.message : '操作失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 打开删除确认对话框
  const openDeleteDialog = (region: Region) => {
    setRegionToDelete(region);
    setIsDeleteDialogOpen(true);
  };

  // 删除区域
  const handleDeleteRegion = async () => {
    if (!regionToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteRegionApi(regionToDelete.id);
      toast.success('区域删除成功');
      setIsDeleteDialogOpen(false);
      fetchRegions(); // 重新获取数据
    } catch (error) {
      console.error('Error deleting region:', error);
      toast.error(error instanceof Error ? error.message : '删除失败');
    } finally {
      setIsDeleting(false);
    }
  };

  // 翻页处理
  const handlePageChange = (newPageNumber: number) => {
    if (newPageNumber >= 1 && newPageNumber <= totalPage) {
      setPageNumber(newPageNumber);
    }
  };

  // 改变每页显示条数
  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize));
    setPageNumber(1); // 重置到第一页
  };

  // 设置状态过滤
  const handleStatusFilterChange = (status: boolean | undefined) => {
    setStatusFilter(status);
    setIsFilterMenuOpen(false);
  };

  // 清除所有筛选
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter(undefined);
    setIsFilterMenuOpen(false);
  };

  // 格式化日期时间
  const formatDateTime = (dateTimeStr: string) => {
    return dateTimeStr ? new Date(dateTimeStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) : '-';
  };

  // 如果正在加载身份验证状态，显示加载中
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-xl">正在加载...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col gap-y-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">区域管理</h1>
          <p className="text-muted-foreground">
            管理教育区域信息，包括区域编码、名称和状态
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> 添加区域
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>区域列表</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索区域名称..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <DropdownMenu open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    筛选
                    {statusFilter !== undefined && <Badge className="ml-2 px-1 py-0">1</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>筛选条件</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="p-2">
                    <p className="mb-2 text-sm font-medium">状态</p>
                    <div className="grid gap-2">
                      <Button 
                        variant={statusFilter === true ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleStatusFilterChange(statusFilter === true ? undefined : true)}
                        className="justify-start h-8"
                      >
                        <Badge variant="outline" className={`mr-2 ${statusFilter === true ? "bg-primary text-primary-foreground" : ""}`}>
                          启用
                        </Badge>
                        <span>已启用</span>
                      </Button>
                      
                      <Button 
                        variant={statusFilter === false ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleStatusFilterChange(statusFilter === false ? undefined : false)}
                        className="justify-start h-8"
                      >
                        <Badge variant="outline" className={`mr-2 ${statusFilter === false ? "bg-primary text-primary-foreground" : ""}`}>
                          禁用
                        </Badge>
                        <span>已禁用</span>
                      </Button>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearFilters}>
                    清除所有筛选条件
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription>
            共 {totalCount} 个区域，当前显示第 {pageNumber} 页，每页 {pageSize} 条
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">加载中...</span>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">区域ID</TableHead>
                      <TableHead>区域名称</TableHead>
                      <TableHead className="w-[100px]">状态</TableHead>
                      <TableHead className="w-[160px]">创建时间</TableHead>
                      <TableHead className="w-[160px]">修改时间</TableHead>
                      <TableHead className="w-[120px] text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          没有找到区域数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      regions.map((region) => (
                        <TableRow key={region.id}>
                          <TableCell className="font-medium">{region.id}</TableCell>
                          <TableCell>{region.name}</TableCell>
                          <TableCell>
                            <Badge variant={region.status ? "default" : "secondary"}>
                              {region.status ? '启用' : '禁用'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDateTime(region.createdAt)}</TableCell>
                          <TableCell>{formatDateTime(region.modifiedAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openEditDialog(region)}
                                aria-label="编辑区域"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => openDeleteDialog(region)}
                                aria-label="删除区域"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* 分页控件 */}
              {totalPage > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Select
                      value={pageSize.toString()}
                      onValueChange={handlePageSizeChange}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {pageSizeOptions.map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">条/页</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(pageNumber - 1)}
                      disabled={pageNumber <= 1}
                      aria-label="上一页"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{pageNumber}</span>
                      <span className="text-sm text-muted-foreground">/ {totalPage}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(pageNumber + 1)}
                      disabled={pageNumber >= totalPage}
                      aria-label="下一页"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 添加/编辑区域对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? '编辑区域' : '添加区域'}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? '修改区域信息。请填写以下信息，然后点击保存。'
                : '添加新的区域。请填写以下信息，然后点击添加。'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>区域编码</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="请输入6位数字编码" 
                        {...field} 
                        disabled={isEditMode}
                      />
                    </FormControl>
                    <FormDescription>
                      区域编码必须是6位数字
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>区域名称</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入区域名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>状态</FormLabel>
                      <FormDescription>
                        设置区域是否启用
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? '保存' : '添加'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除区域 &quot;{regionToDelete?.name}&quot; 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button" 
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteRegion}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 