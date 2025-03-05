"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { School, SchoolType, Region } from '@/lib/api-types';

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
import { 
  Loader2, Search, Plus, Edit, Trash2, 
  School as SchoolIcon, CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';

// 对话框和表单组件
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// 学校表单验证模式
const schoolFormSchema = z.object({
  name: z.string().min(1, '学校名称不能为空'),
  code: z.string()
    .min(3, '学校代码必须是3位数字')
    .max(3, '学校代码必须是3位数字')
    .regex(/^\d+$/, '学校代码必须是数字'),
  regionId: z.string().min(1, '必须选择所属区域'),
  type: z.string().min(1, '必须选择学校类型'),
  grades: z.array(z.string()).min(1, '至少选择一个年级'),
  status: z.boolean().default(true),
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

// 默认表单值
const defaultValues: Partial<SchoolFormValues> = {
  status: true,
  grades: [],
};

export default function SchoolsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [schoolTypes, setSchoolTypes] = useState<string[]>([]);
  const [allGrades, setAllGrades] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 筛选状态
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // 对话框状态
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // 年级加载状态
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);

  // 创建表单
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues,
  });
  
  // 监听学校类型变化，加载对应的年级选项
  useEffect(() => {
    const schoolType = form.watch('type');
    if (schoolType) {
      loadGradesForType(schoolType);
    }
  }, [form.watch('type')]);

  // 获取学校数据
  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      
      // 构建查询参数
      const params = new URLSearchParams();
      if (filterRegion && filterRegion !== 'all') params.append('regionId', filterRegion);
      if (filterType && filterType !== 'all') params.append('type', filterType);
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/schools${queryString}`);
      
      if (!response.ok) {
        throw new Error('获取学校数据失败');
      }
      
      const data = await response.json();
      setSchools(data.schools);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast.error('获取学校数据失败');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 获取区域数据
  const fetchRegions = async () => {
    try {
      const response = await fetch('/api/regions');
      
      if (!response.ok) {
        throw new Error('获取区域数据失败');
      }
      
      const data = await response.json();
      setRegions(data.regions.filter((region: Region) => region.status));
    } catch (error) {
      console.error('Error fetching regions:', error);
      toast.error('获取区域数据失败');
    }
  };
  
  // 获取学校类型
  const fetchSchoolTypes = async () => {
    try {
      const response = await fetch('/api/school-types');
      
      if (!response.ok) {
        throw new Error('获取学校类型失败');
      }
      
      const data = await response.json();
      setSchoolTypes(data);
    } catch (error) {
      console.error('Error fetching school types:', error);
      toast.error('获取学校类型失败');
    }
  };
  
  // 根据学校类型加载年级选项
  const loadGradesForType = async (type: string) => {
    try {
      setIsLoadingGrades(true);
      const response = await fetch(`/api/school-grades?type=${encodeURIComponent(type)}`);
      
      if (!response.ok) {
        throw new Error('获取年级列表失败');
      }
      
      const grades = await response.json();
      setAllGrades(grades);
      
      // 如果是编辑模式，保留已选年级；如果是新建模式，清除所有年级选择
      if (!isEditMode) {
        form.setValue('grades', []);
      }
    } catch (error) {
      console.error('Error loading grades:', error);
      toast.error('获取年级列表失败');
    } finally {
      setIsLoadingGrades(false);
    }
  };

  // 过滤学校
  const filteredSchools = schools.filter(school => 
    (school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     school.code.includes(searchQuery) ||
     (school.regionName && school.regionName.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // 打开添加学校对话框
  const openAddDialog = () => {
    setIsEditMode(false);
    setCurrentSchool(null);
    form.reset(defaultValues);
    setIsDialogOpen(true);
  };

  // 打开编辑学校对话框
  const openEditDialog = (school: School) => {
    setIsEditMode(true);
    setCurrentSchool(school);
    
    // 预加载年级选项
    loadGradesForType(school.type);
    
    form.reset({
      name: school.name,
      code: school.code,
      regionId: school.regionId,
      type: school.type,
      grades: school.grades,
      status: school.status,
    });
    
    setIsDialogOpen(true);
  };

  // 提交表单
  const onSubmit = async (values: SchoolFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditMode && currentSchool) {
        // 更新学校
        const response = await fetch(`/api/schools/${currentSchool.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '更新学校失败');
        }
        
        toast.success('学校更新成功');
      } else {
        // 创建学校
        const response = await fetch('/api/schools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '创建学校失败');
        }
        
        toast.success('学校创建成功');
      }
      
      setIsDialogOpen(false);
      fetchSchools(); // 重新获取数据
    } catch (error: any) {
      console.error('Error submitting school:', error);
      toast.error(error.message || '操作失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 打开删除确认对话框
  const openDeleteDialog = (school: School) => {
    setSchoolToDelete(school);
    setIsDeleteDialogOpen(true);
  };

  // 删除学校
  const deleteSchool = async () => {
    if (!schoolToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/schools/${schoolToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '删除学校失败');
      }
      
      toast.success('学校删除成功');
      setIsDeleteDialogOpen(false);
      fetchSchools(); // 重新获取数据
    } catch (error: any) {
      console.error('Error deleting school:', error);
      toast.error(error.message || '删除学校失败');
    } finally {
      setIsDeleting(false);
    }
  };

  // 应用筛选条件
  const applyFilters = () => {
    fetchSchools();
  };

  // 清除筛选条件
  const clearFilters = () => {
    setFilterRegion('all');
    setFilterType('all');
    setFilterStatus('all');
    
    // 延迟一下再重新获取数据，确保状态已更新
    setTimeout(() => {
      fetchSchools();
    }, 0);
  };

  // 检查权限并加载数据
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'superadmin') {
      toast.error('您没有权限访问此页面');
      router.push('/workbench');
      return;
    }

    // 加载所有必要数据
    fetchRegions();
    fetchSchoolTypes();
    fetchSchools();
  }, [isAuthenticated, user, router]);

  // 显示加载状态
  if (!isAuthenticated || user?.role !== 'superadmin') {
    return null;
  }

  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">学校管理</h2>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          添加学校
        </Button>
      </div>
      
      {/* 筛选工具栏 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm font-medium">区域</span>
              <Select value={filterRegion} onValueChange={setFilterRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="选择区域" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部区域</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <span className="text-sm font-medium">学校类型</span>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {schoolTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <span className="text-sm font-medium">状态</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="true">启用</SelectItem>
                  <SelectItem value="false">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end gap-2">
              <Button onClick={applyFilters} className="flex-1">
                应用筛选
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                清除
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 搜索栏 */}
      <div className="flex items-center py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索学校、代码或区域..."
            className="pl-8 md:w-[300px] lg:w-[400px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* 学校列表 */}
      <Card>
        <CardHeader>
          <CardTitle>学校</CardTitle>
          <CardDescription>管理系统中的所有学校</CardDescription>
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
                  <TableHead>学校</TableHead>
                  <TableHead>代码</TableHead>
                  <TableHead>区域</TableHead>
                  <TableHead>学校类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      没有找到学校
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <SchoolIcon className="h-4 w-4 mr-2 text-primary" />
                          {school.name}
                        </div>
                      </TableCell>
                      <TableCell>{school.code}</TableCell>
                      <TableCell>{school.regionName || '-'}</TableCell>
                      <TableCell>{school.type}</TableCell>
                      <TableCell>
                        {school.status ? (
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
                          <Button variant="outline" size="icon" onClick={() => openEditDialog(school)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="text-red-500" onClick={() => openDeleteDialog(school)}>
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
      
      {/* 添加/编辑学校对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? '编辑学校' : '添加学校'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? '修改学校信息' : '添加一个新的学校到系统中'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>学校名称</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入学校名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>学校代码</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="请输入3位数字代码" 
                          {...field} 
                          disabled={isEditMode} // 编辑模式下不允许修改代码
                        />
                      </FormControl>
                      <FormDescription>
                        学校代码必须是3位数字
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="regionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>所属区域</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择区域" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {regions.map(region => (
                            <SelectItem key={region.id} value={region.id}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>学校类型</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择学校类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {schoolTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="grades"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>年级设置</FormLabel>
                      <FormDescription>
                        请选择学校包含的年级
                      </FormDescription>
                    </div>
                    
                    {isLoadingGrades ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {allGrades.map((grade) => (
                          <FormField
                            key={grade}
                            control={form.control}
                            name="grades"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={grade}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(grade)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, grade])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== grade
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {grade}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                    )}
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
                        启用或禁用该学校
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
                  {isEditMode ? '保存更改' : '创建学校'}
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
              您确定要删除学校 "{schoolToDelete?.name}" 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" variant="destructive" onClick={deleteSchool} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 