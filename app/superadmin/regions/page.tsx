"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Metadata } from 'next';
import { Region } from '@/lib/api-types';

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
import { Loader2, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// 对话框组件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
  
  // 对话框状态
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<Region | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 创建表单
  const form = useForm<RegionFormValues>({
    resolver: zodResolver(regionFormSchema),
    defaultValues,
  });

  // 获取区域数据
  const fetchRegions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/regions');
      
      if (!response.ok) {
        throw new Error('获取区域数据失败');
      }
      
      const data = await response.json();
      setRegions(data.regions);
    } catch (error) {
      console.error('Error fetching regions:', error);
      toast.error('获取区域数据失败');
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
        const response = await fetch(`/api/regions/${currentRegion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '更新区域失败');
        }
        
        toast.success('区域更新成功');
      } else {
        // 创建区域
        const response = await fetch('/api/regions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '创建区域失败');
        }
        
        toast.success('区域创建成功');
      }
      
      setIsDialogOpen(false);
      fetchRegions(); // 重新获取数据
    } catch (error: any) {
      console.error('Error submitting region:', error);
      toast.error(error.message || '操作失败');
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
      const response = await fetch(`/api/regions/${regionToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '删除区域失败');
      }
      
      toast.success('区域删除成功');
      setIsDeleteDialogOpen(false);
      fetchRegions(); // 重新获取数据
    } catch (error: any) {
      console.error('Error deleting region:', error);
      toast.error(error.message || '删除区域失败');
    } finally {
      setIsDeleting(false);
    }
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

    fetchRegions();
  }, [isAuthenticated, user, router]);

  // 显示加载状态
  if (!isAuthenticated || user?.role !== 'superadmin') {
    return null;
  }

  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">区域管理</h2>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          添加区域
        </Button>
      </div>
      
      <div className="flex items-center py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索区域..."
            className="pl-8 md:w-[300px] lg:w-[400px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>区域列表</CardTitle>
          <CardDescription>管理系统中的所有区域</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>区域ID</TableHead>
                  <TableHead>区域名称</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      没有找到区域数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegions.map((region) => (
                    <TableRow key={region.id}>
                      <TableCell className="font-medium">{region.id}</TableCell>
                      <TableCell>{region.name}</TableCell>
                      <TableCell>
                        {region.status ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                            启用
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-800 hover:bg-red-50 border-red-200">
                            禁用
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => openEditDialog(region)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="text-red-500" onClick={() => openDeleteDialog(region)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* 添加/编辑区域对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? '编辑区域' : '添加区域'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? '修改区域信息' : '添加一个新的区域到系统中'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      区域ID必须是6位数字
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
                    <FormDescription>
                      区域的名称，如"海淀区"、"朝阳区"等
                    </FormDescription>
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
                        启用或禁用该区域
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" variant="destructive" onClick={deleteRegion} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 