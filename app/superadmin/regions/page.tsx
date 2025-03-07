"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Metadata } from 'next';
import { Region, ApiResponseDetail } from '@/features/superadmin/types';
import { superadminApi } from '@/shared/api';
import { SuperAdminHero } from '@/components/superadmin/hero-section';
import { MapPin, Plus } from 'lucide-react';

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
import { Loader2, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';

// 对话框组件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

// 区域表单验证模式
const regionFormSchema = z.object({
  id: z.string()
    .min(6, '区域ID必须是6位数字')
    .max(6, '区域ID必须是6位数字')
    .regex(/^\d+$/, '区域ID必须是数字'),
  name: z.string().min(1, '区域名称不能为空'),
  status: z.boolean().default(true),
});

type RegionFormValues = z.infer<typeof regionFormSchema>;

// 默认表单值
const defaultValues: Partial<RegionFormValues> = {
  status: true,
};

export default function RegionsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  
  // 对话框状态
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<Region | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 创建表单
  const form = useForm<RegionFormValues>({
    resolver: zodResolver(regionFormSchema),
    defaultValues,
  });

  // 获取区域数据
  const fetchRegions = async (page = currentPage) => {
    try {
      setIsLoading(true);
      console.log(`正在获取区域数据，页码: ${page}, 每页数量: ${pageSize}`);
      
      const response = await superadminApi.getRegions(page, pageSize);
      console.log('区域数据API响应:', response);
      
      if (!response) {
        throw new Error('获取区域数据失败: 服务器返回空响应');
      }
      
      // 后端API返回格式: { code: 0, msg: "成功", data: { list: [], pageNumber, pageSize, totalPage, totalCount } }
      if (response.code === 0) {
        // 这里的响应不是标准的ApiResponse，而是后端直接返回的格式
        if (response.data && response.data.list) {
          // API返回数据中，id和name是反的，需要交换
          const mappedRegions = response.data.list.map((region: any) => ({
            id: region.name, // API返回中id和name是反的，需要交换
            name: region.id, // API返回中id和name是反的，需要交换
            status: region.status
          }));
          
          setRegions(mappedRegions);
          setTotalItems(response.data.totalCount || 0);
          setCurrentPage(page);
          console.log(`成功加载 ${mappedRegions.length} 个区域，总计 ${response.data.totalCount} 个`);
        } else {
          console.warn('区域API返回的数据格式不符合预期:', response.data);
          setRegions([]);
          setTotalItems(0);
        }
      } else {
        const errorMsg = response.msg || '获取区域数据失败: 服务器返回错误代码';
        console.error(errorMsg);
        toast.error(errorMsg);
        setRegions([]);
      }
    } catch (error: any) {
      console.error('获取区域数据出错:', error);
      let errorMessage = '获取区域数据失败';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      toast.error(errorMessage);
      setRegions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 过滤区域
  const filteredRegions = regions.filter(region => 
    region.id.includes(searchQuery) || 
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        console.log('更新区域:', currentRegion.id, values);
        const { id, status, name } = values;
        const response = await superadminApi.updateRegion(currentRegion.id, { status, name });
        
        if (response && response.code === 0) {
          toast.success('区域更新成功');
          setIsDialogOpen(false);
          fetchRegions(currentPage); // 重新获取当前页数据
        } else {
          const errorMsg = response?.msg || '更新区域失败: 服务器返回错误';
          console.error(errorMsg);
          toast.error(errorMsg);
        }
      } else {
        // 创建区域
        console.log('创建区域:', values);
        const response = await superadminApi.createRegion(values);
        
        if (response && response.code === 0) {
          toast.success('区域创建成功');
          setIsDialogOpen(false);
          fetchRegions(1); // 重新获取第一页数据
        } else {
          const errorMsg = response?.msg || '创建区域失败: 服务器返回错误';
          console.error(errorMsg);
          toast.error(errorMsg);
        }
      }
    } catch (error: any) {
      console.error('提交区域数据出错:', error);
      let errorMessage = isEditMode ? '更新区域失败' : '创建区域失败';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      toast.error(errorMessage);
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
  const deleteRegion = async () => {
    if (!regionToDelete) return;
    
    try {
      setIsDeleting(true);
      console.log('删除区域:', regionToDelete.id);
      
      const response = await superadminApi.deleteRegion(regionToDelete.id);
      
      if (response && response.code === 0) {
        toast.success('区域删除成功');
        setIsDeleteDialogOpen(false);
        fetchRegions(currentPage); // 重新获取当前页数据
      } else {
        const errorMsg = response?.msg || '删除区域失败: 服务器返回错误';
        console.error(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('删除区域出错:', error);
      let errorMessage = '删除区域失败';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // 处理分页变化
  const handlePageChange = (page: number) => {
    fetchRegions(page);
  };

  // 检查权限并加载数据
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      router.push('/login');
      return;
    }
    
    if (user?.role !== 'superadmin') {
      toast.error('您没有权限访问此页面');
      router.push('/workbench');
      return;
    }

    fetchRegions(1);
  }, [isAuthenticated, user, router]);

  // 显示加载状态
  if (!isAuthenticated || user?.role !== 'superadmin') {
    return null;
  }

  return (
    <div className="container py-6">
      <SuperAdminHero
        title="区域管理"
        description="管理学校所属的区域、县市和城市。每个区域可以包含多个学校，便于按地理位置组织和管理教育资源。"
        icon={MapPin}
        actions={
          <Button onClick={openAddDialog} className="gap-1">
            <Plus className="h-4 w-4" />
            添加区域
          </Button>
        }
      />
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">区域列表</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="搜索区域..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">加载中...</span>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[100px]">区域ID</TableHead>
                      <TableHead>区域名称</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          {searchQuery ? '没有找到匹配的区域数据' : '没有区域数据'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRegions.map((region) => (
                        <TableRow key={region.id}>
                          <TableCell className="font-medium">{region.id}</TableCell>
                          <TableCell>{region.name}</TableCell>
                          <TableCell>
                            {region.status ? (
                              <Badge className="bg-green-500">启用</Badge>
                            ) : (
                              <Badge variant="destructive">停用</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(region)}>
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                编辑
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(region)}>
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                删除
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {totalItems > 0 && (
                <div className="flex items-center justify-center mt-6">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      上一页
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentPage} / {Math.ceil(totalItems / pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(totalItems / pageSize)}
                    >
                      下一页
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
              {isEditMode ? '修改区域信息' : '创建一个新的区域并添加到系统中'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>区域ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入6位数字ID"
                        {...field}
                        disabled={isEditMode} // 编辑模式下不允许修改ID
                      />
                    </FormControl>
                    <FormDescription>
                      请输入6位数字作为区域唯一标识
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
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
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditMode ? '保存更改' : '创建区域'}
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
              您确定要删除区域 "{regionToDelete?.name}" 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-destructive text-sm">
              删除区域可能会影响到与该区域相关联的所有数据，请谨慎操作。
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={deleteRegion}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                确认删除
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 