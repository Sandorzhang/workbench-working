"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

// 类型导入
import { School, Region, SchoolType, ApiResponseDetail } from '@/features/superadmin/types';
import { SchoolForm, SchoolFormValues } from '@/components/superadmin/school-form';
import { superadminApi } from '@/shared/api';
import { SuperAdminHero } from '@/components/superadmin/hero-section';
import { School as SchoolIcon, Plus } from 'lucide-react';

// UI 组件导入
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2, Search, Pencil, Trash2,
} from 'lucide-react';

// UI Components
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
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // 年级加载状态
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);

  // 获取学校数据
  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      
      // 构建查询参数
      const query: Record<string, any> = {};
      if (filterRegion && filterRegion !== 'all') query.regionId = filterRegion;
      if (filterType && filterType !== 'all') query.type = filterType;
      if (filterStatus && filterStatus !== 'all') query.status = filterStatus === 'active';
      
      // 添加页面和大小参数
      const page = 1;
      const size = 50; // 获取较多学校数据展示
      
      console.log('请求学校数据参数:', { page, size, ...query });
      
      const response = await superadminApi.getSchools(page, size, query);
      console.log('学校API响应:', response);
      
      if (!response) {
        throw new Error('获取学校数据失败: 服务器返回空响应');
      }
      
      // 后端API返回格式: { code: 0, msg: "成功", data: { list: [], pageNumber, pageSize, totalPage, totalCount } }
      if (response.code === 0) {
        if (response.data && response.data.list) {
          setSchools(response.data.list);
          console.log(`成功加载 ${response.data.list.length} 所学校，总计 ${response.data.totalCount} 所`);
        } else {
          console.warn('学校API返回的数据格式不符合预期:', response.data);
          setSchools([]);
        }
      } else {
        const errorMsg = response.msg || '获取学校数据失败: 服务器返回错误代码';
        console.error(errorMsg);
        toast.error(errorMsg);
        setSchools([]);
      }
    } catch (error: any) {
      console.error('获取学校数据出错:', error);
      let errorMessage = '获取学校数据失败';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      toast.error(errorMessage);
      setSchools([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 获取区域数据
  const fetchRegions = async () => {
    try {
      console.log('获取区域数据...');
      const response = await superadminApi.getRegions(1, 100); // 获取较多区域数据
      console.log('区域API响应:', response);
      
      if (!response) {
        throw new Error('获取区域数据失败: 服务器返回空响应');
      }
      
      // 后端API返回格式: { code: 0, msg: "成功", data: { list: [], pageNumber, pageSize, totalPage, totalCount } }
      if (response.code === 0) {
        if (response.data && response.data.list) {
          // 过滤出启用状态的区域，注意API返回中id和name是反的，需要交换
          const activeRegions = response.data.list
            .filter((region: any) => region.status)
            .map((region: any) => ({
              id: region.name, // API返回中id和name是反的，需要交换
              name: region.id, // API返回中id和name是反的，需要交换
              status: region.status
            }));
          
          setRegions(activeRegions);
          console.log(`成功加载 ${activeRegions.length} 个启用的区域`);
        } else {
          console.warn('区域API返回的数据格式不符合预期:', response.data);
          setRegions([]);
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
    }
  };
  
  // 获取学校类型
  const fetchSchoolTypes = async () => {
    try {
      console.log('获取学校类型...');
      const response = await superadminApi.getSchoolTypes();
      console.log('学校类型API响应:', response);
      
      if (!response) {
        throw new Error('获取学校类型失败: 服务器返回空响应');
      }
      
      // 后端API返回格式: { code: 0, msg: "成功", data: [] }
      if (response.code === 0) {
        if (Array.isArray(response.data)) {
          setSchoolTypes(response.data);
          console.log(`成功加载 ${response.data.length} 种学校类型`);
        } else {
          console.warn('学校类型API返回的数据格式不符合预期:', response.data);
          setSchoolTypes([]);
        }
      } else {
        const errorMsg = response.msg || '获取学校类型失败: 服务器返回错误代码';
        console.error(errorMsg);
        toast.error(errorMsg);
        setSchoolTypes([]);
      }
    } catch (error: any) {
      console.error('获取学校类型出错:', error);
      let errorMessage = '获取学校类型失败';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      toast.error(errorMessage);
      setSchoolTypes([]);
    }
  };

  // 过滤学校
  const filteredSchools = schools.filter(school => {
    // 搜索关键字
    const matchesSearch = searchQuery === '' || (
      (school.name && school.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (school.id && school.id.includes(searchQuery)) ||
      (school.regionName && school.regionName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (school.periodName && school.periodName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    return matchesSearch;
  });

  // 打开添加学校对话框
  const openAddDialog = () => {
    setIsEditMode(false);
    setCurrentSchool(null);
    setIsDialogOpen(true);
  };

  // 打开编辑学校对话框
  const openEditDialog = (school: School) => {
    setIsEditMode(true);
    setCurrentSchool(school);
    setIsDialogOpen(true);
  };

  // 提交表单
  const onSubmit = async (values: SchoolFormValues) => {
    try {
      setIsSubmitting(true);
      
      // 转换表单数据
      const formattedValues = {
        ...values,
        // 使用periodId替代type
      };

      if (isEditMode && currentSchool) {
        // 更新学校
        console.log('更新学校:', currentSchool.id, formattedValues);
        const response = await superadminApi.updateSchool(currentSchool.id, formattedValues);
        
        if (response && response.code === 0) {
          toast.success('学校更新成功');
          setIsDialogOpen(false);
          fetchSchools(); // 重新获取数据
        } else {
          const errorMsg = response?.msg || '更新学校失败: 服务器返回错误';
          console.error(errorMsg);
          toast.error(errorMsg);
        }
      } else {
        // 创建学校
        console.log('创建学校:', formattedValues);
        const response = await superadminApi.createSchool(formattedValues);
        
        if (response && response.code === 0) {
          toast.success('学校创建成功');
          setIsDialogOpen(false);
          fetchSchools(); // 重新获取数据
        } else {
          const errorMsg = response?.msg || '创建学校失败: 服务器返回错误';
          console.error(errorMsg);
          toast.error(errorMsg);
        }
      }
    } catch (error: any) {
      console.error('提交学校数据出错:', error);
      let errorMessage = isEditMode ? '更新学校失败' : '创建学校失败';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 打开删除对话框
  const openDeleteDialog = (school: School) => {
    setSchoolToDelete(school);
    setIsDeleteDialogOpen(true);
  };

  // 删除学校
  const deleteSchool = async () => {
    if (!schoolToDelete) return;
    
    try {
      setIsDeleting(true);
      console.log('删除学校:', schoolToDelete.id);
      
      const response = await superadminApi.deleteSchool(schoolToDelete.id);
      
      if (response && response.code === 0) {
        toast.success('学校删除成功');
        setIsDeleteDialogOpen(false);
        fetchSchools(); // 重新获取数据
      } else {
        const errorMsg = response?.msg || '删除学校失败: 服务器返回错误';
        console.error(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('删除学校出错:', error);
      let errorMessage = '删除学校失败';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      toast.error(errorMessage);
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
    setSearchQuery('');
    
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
    <div className="container py-6">
      <SuperAdminHero
        title="学校管理"
        description="管理系统中所有学校信息。您可以添加、编辑和删除学校，并关联到相应的区域。"
        icon={SchoolIcon}
        actions={
          <Button onClick={openAddDialog} className="gap-1">
            <Plus className="h-4 w-4" />
            添加学校
          </Button>
        }
      />
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">学校列表</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="搜索学校..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                className="w-[250px]"
              />
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
                    <TableHead className="font-semibold px-6 py-4">学校</TableHead>
                    <TableHead className="font-semibold px-6">编号</TableHead>
                    <TableHead className="font-semibold px-6">区域</TableHead>
                    <TableHead className="font-semibold px-6">学校类型</TableHead>
                    <TableHead className="font-semibold px-6">状态</TableHead>
                    <TableHead className="text-right font-semibold px-6">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        没有找到符合条件的学校
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchools.map(school => (
                      <TableRow key={school.id}>
                        <TableCell className="px-6">
                          <div className="flex items-center">
                            <div className="p-1.5 bg-primary/10 rounded-md mr-2.5">
                              <SchoolIcon className="h-4 w-4 text-primary" />
                            </div>
                            {school.name}
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <Badge variant="outline" className="bg-muted/50">
                            {school.id}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6">{school.regionName || '-'}</TableCell>
                        <TableCell className="px-6">
                          <div className="flex items-center">
                            <SchoolIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            {school.periodName}
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          {school.status ? (
                            <Badge className="bg-green-50 text-green-800 hover:bg-green-100 border-green-200 font-medium">
                              启用
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              停用
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(school)} className="h-8 px-3 rounded-md hover:bg-primary/10 transition-colors">
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              编辑
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 h-8 px-3 rounded-md hover:bg-red-50 transition-colors" onClick={() => openDeleteDialog(school)}>
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
      
      {/* 学校表单对话框 */}
      <SchoolForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onSubmit}
        isEditMode={isEditMode}
        currentSchool={currentSchool}
        regions={regions}
        schoolTypes={schoolTypes}
      />
      
      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>确认删除学校</DialogTitle>
            <DialogDescription>
              您确定要删除学校 "{schoolToDelete?.name}" 吗？此操作不可撤销，删除后所有相关数据将无法恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button 
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                deleteSchool();
              }}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  删除中...
                </div>
              ) : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 