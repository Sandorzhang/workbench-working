import { useState, useEffect } from 'react';
import { School, Region } from '@/features/superadmin/types';
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
  regionId: z.string().min(1, '必须选择所属区域'),
  periodId: z.string().min(1, '必须选择学校类型'),
  status: z.boolean().default(true),
});

export type SchoolFormValues = z.infer<typeof schoolFormSchema>;

// 默认表单值
const defaultValues: Partial<SchoolFormValues> = {
  name: '',
  regionId: '',
  periodId: '',
  status: true,
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
    defaultValues: {
      name: '',
      regionId: '',
      periodId: '',
      status: true
    }
  });

  // 监听学校类型变化，加载对应的年级选项
  useEffect(() => {
    const schoolType = form.watch('periodId');
    if (schoolType) {
      loadGradesForType(schoolType);
    }
  }, [form.watch('periodId')]);

  // 重置表单
  useEffect(() => {
    if (!open) return; // 如果对话框未打开，不重置表单
    
    if (isEditMode && currentSchool) {
      form.reset({
        name: currentSchool.name,
        regionId: currentSchool.regionId,
        periodId: currentSchool.periodId || '',
        status: currentSchool.status
      });
      
      if (currentSchool.periodId) {
        loadGradesForType(currentSchool.periodId);
      }
    } else {
      form.reset({
        name: '',
        regionId: '',
        periodId: '',
        status: true
      });
      setAllGrades([]);
    }
  }, [open, isEditMode, currentSchool, form]);

  // 根据学校类型加载年级选项
  const loadGradesForType = async (type: string) => {
    try {
      setIsLoadingGrades(true);
      console.log(`加载学校类型 ${type} 的年级选项`);
      
      // 这里可以根据学校类型从API获取对应的年级选项
      // 目前使用模拟数据
      const gradesMap: Record<string, string[]> = {
        'PRIMARY_FIVE': ['一年级', '二年级', '三年级', '四年级', '五年级'],
        'PRIMARY_SIX': ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
        'MIDDLE_THREE': ['初一', '初二', '初三'],
        'MIDDLE_FOUR': ['初一', '初二', '初三', '初四'],
        'HIGH_THREE': ['高一', '高二', '高三'],
        'NINE_YEAR': ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三'],
        'COMPLETE_SIX': ['初一', '初二', '初三', '高一', '高二', '高三'],
        'COMPLETE_SEVEN': ['初一', '初二', '初三', '初四', '高一', '高二', '高三'],
        'TWELVE_YEAR': ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三'],
      };
      
      // 延迟模拟API请求
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const grades = gradesMap[type] || [];
      setAllGrades(grades);
      
      // 如果当前没有选择年级，默认选择全部
      // const currentGrades = form.getValues('grades');
      // if (currentGrades.length === 0 && grades.length > 0) {
      //   form.setValue('grades', grades);
      // }
    } catch (error) {
      console.error('加载年级选项失败:', error);
      toast.error('加载年级选项失败');
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
                    name="periodId"
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
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>启用状态</FormLabel>
                          <FormDescription>
                            启用后学校将在系统中可见并可使用
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
                </div>
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