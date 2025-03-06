import { useState, useEffect } from 'react';
import { School, Region } from '@/lib/api-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, School as SchoolIcon } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

export type SchoolFormValues = z.infer<typeof schoolFormSchema>;

// 默认表单值
const defaultValues: Partial<SchoolFormValues> = {
  name: '',
  code: '',
  regionId: '',
  type: '',
  status: true,
  grades: [],
};

interface SchoolFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SchoolFormValues) => Promise<void>;
  isEditMode: boolean;
  currentSchool: School | null;
  regions: Region[];
  schoolTypes: string[];
}

export function SchoolForm({
  open,
  onOpenChange,
  onSubmit,
  isEditMode,
  currentSchool,
  regions,
  schoolTypes
}: SchoolFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [allGrades, setAllGrades] = useState<string[]>([]);

  // 创建表单
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: isEditMode && currentSchool ? {
      name: currentSchool.name || '',
      code: currentSchool.code || '',
      regionId: currentSchool.regionId || '',
      type: currentSchool.type || '',
      grades: currentSchool.grades || [],
      status: currentSchool.status ?? true,
    } : defaultValues,
    mode: 'onChange',
  });

  // 监听学校类型变化，加载对应的年级选项
  useEffect(() => {
    const schoolType = form.watch('type');
    if (schoolType) {
      loadGradesForType(schoolType);
    }
  }, [form.watch('type')]);

  // 重置表单
  useEffect(() => {
    if (!open) return; // 如果对话框未打开，不重置表单
    
    if (isEditMode && currentSchool) {
      // 确保所有字段都有有效的默认值
      const formValues = {
        name: currentSchool.name || '',
        code: currentSchool.code || '',
        regionId: currentSchool.regionId || '',
        type: currentSchool.type || '',
        grades: currentSchool.grades || [],
        status: currentSchool.status ?? true,
      };
      form.reset(formValues);
      
      if (currentSchool.type) {
        loadGradesForType(currentSchool.type);
      }
    } else {
      form.reset(defaultValues);
      setAllGrades([]);
    }
  }, [open, isEditMode, currentSchool, form]);

  // 根据学校类型加载年级选项
  const loadGradesForType = async (type: string) => {
    try {
      setIsLoadingGrades(true);
      console.log('获取年级列表，学校类型:', type);
      const response = await fetch(`/api/school-grades?type=${encodeURIComponent(type)}`, {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin',
        cache: 'no-store'
      });
      
      if (response.status === 307) {
        console.error('年级请求被重定向:', response.headers.get('Location'));
        throw new Error('请求被重定向，这可能是由于没有权限或会话已过期');
      }
      
      if (!response.ok) {
        throw new Error(`获取年级列表失败: ${response.status} ${response.statusText}`);
      }
      
      const grades = await response.json();
      console.log('获取年级列表成功:', grades);
      setAllGrades(grades);
      
      // 自动选择所有年级，不需要用户手动选择
      form.setValue('grades', grades);
    } catch (error) {
      console.error('Error loading grades:', error);
      toast.error('获取年级列表失败，请稍后再试');
      setAllGrades([]);
    } finally {
      setIsLoadingGrades(false);
    }
  };

  // 表单提交处理
  const handleSubmit = async (values: SchoolFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <SchoolIcon className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle className="text-lg font-medium">
                {isEditMode ? '编辑学校' : '添加学校'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              {isEditMode ? '修改学校的基本信息和配置' : '添加一个新的学校到系统中并进行基本配置'}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="px-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              {/* 基本信息 */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                  • 基本信息
                </h3>
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
                            disabled={isEditMode} 
                            maxLength={3}
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
              </div>
              
              {/* 所属与分类 */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                  • 所属与分类
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="regionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>所属区域</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
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
                          value={field.value}
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
                        <FormDescription>
                          选择学校类型后将自动设置对应的年级
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* 年级设置 */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                  • 年级设置
                </h3>
                <div className="border rounded p-4">
                  <p className="text-sm mb-3">
                    根据所选学校类型自动配置的年级
                  </p>
                  
                  {isLoadingGrades ? (
                    <div className="flex justify-center py-3">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          {allGrades.length === 0 ? '暂无年级数据' : '包含以下年级'}
                        </span>
                        <Badge variant="outline">共 {allGrades.length} 个年级</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allGrades.map(grade => (
                          <Badge key={grade} variant="secondary">
                            {grade}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 状态设置 */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                  • 状态设置
                </h3>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-center space-y-0 border rounded p-4">
                      <div>
                        <FormLabel>学校状态</FormLabel>
                        <FormDescription>
                          启用后该学校将可正常使用，禁用后学校将不可用
                        </FormDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={field.value ? "text-sm text-green-600" : "text-sm text-red-600"}>
                          {field.value ? "启用" : "禁用"}
                        </span>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="flex gap-2 pt-4 border-t mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      处理中...
                    </div>
                  ) : (
                    isEditMode ? '保存更改' : '创建学校'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 