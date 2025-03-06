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
    <div className="space-y-6 p-6 pt-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">区域管理</h2>
          <p className="text-muted-foreground text-sm">管理系统中的所有区域数据与配置</p>
        </div>
        <Button onClick={openAddDialog} className="shadow-md transition-all hover:shadow-lg">
          <Plus className="mr-2 h-4 w-4" />
          添加区域
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="shadow-sm hover:shadow transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">总区域数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regions.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">启用区域</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{regions.filter(r => r.status).length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">禁用区域</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{regions.filter(r => !r.status).length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow transition-all bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">上次更新</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{new Date().toLocaleDateString()}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
        <div className="relative max-w-sm w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索区域..."
            className="pl-8 md:w-[300px] lg:w-[400px] rounded-md shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>总计: {filteredRegions.length} 个区域</span>
          {searchQuery && (
            <Badge variant="outline" className="ml-2">
              筛选中: {searchQuery}
            </Badge>
          )}
        </div>
      </div>
      
      <Card className="overflow-hidden shadow-md border-0 rounded-xl">
        <CardHeader className="bg-muted/20 px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle>区域列表</CardTitle>
              <CardDescription>管理系统中的所有区域</CardDescription>
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
                    <TableHead className="font-semibold px-6 py-4">区域ID</TableHead>
                    <TableHead className="font-semibold px-6">区域名称</TableHead>
                    <TableHead className="font-semibold px-6">状态</TableHead>
                    <TableHead className="text-right font-semibold px-6">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-10 w-10 text-muted-foreground/60" />
                          没有找到区域数据
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegions.map((region) => (
                      <TableRow key={region.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="font-medium px-6 py-4">{region.id}</TableCell>
                        <TableCell className="px-6">{region.name}</TableCell>
                        <TableCell className="px-6">
                          {region.status ? (
                            <Badge className="bg-green-50 text-green-800 hover:bg-green-100 border-green-200 font-medium">
                              启用
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-800 hover:bg-red-50 border-red-200 font-medium">
                              禁用
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(region)} className="h-8 px-3 rounded-md hover:bg-primary/10 transition-colors">
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              编辑
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 h-8 px-3 rounded-md hover:bg-red-50 transition-colors" onClick={() => openDeleteDialog(region)}>
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
          )}
        </CardContent>
      </Card>
      
      {/* 添加/编辑区域对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-xl shadow-lg border-0">
          <DialogHeader>
            <DialogTitle className="text-xl">{isEditMode ? '编辑区域' : '添加区域'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? '修改区域信息' : '添加一个新的区域到系统中'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">区域ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入6位数字ID"
                        className="rounded-md"
                        {...field}
                        disabled={isEditMode} // 编辑模式下不允许修改ID
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
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
                    <FormLabel className="font-medium">区域名称</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入区域名称" className="rounded-md" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="font-medium">状态</FormLabel>
                      <FormDescription className="text-xs">
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
              
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" className="rounded-md" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-md shadow-sm">
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
        <DialogContent className="sm:max-w-[425px] rounded-xl shadow-lg border-0">
          <DialogHeader>
            <DialogTitle className="text-xl">确认删除</DialogTitle>
            <DialogDescription className="pt-2">
              您确定要删除区域 <span className="font-semibold">"{regionToDelete?.name}"</span> 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-4 rounded-lg my-2 text-sm text-red-700">
            <p>删除后将无法恢复，请确认此操作。</p>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" className="rounded-md" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" variant="destructive" className="rounded-md shadow-sm" onClick={deleteRegion} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 