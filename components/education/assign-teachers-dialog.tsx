"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// 定义类型
interface Teacher {
  id: string;
  name: string;
  gender: string;
  age: number;
  subject: string;
  title: string;
  phone: string;
  email: string;
  status: string;
}

const formSchema = z.object({
  teacherIds: z.array(z.string()).min(1, "请至少选择一位教师"),
  headTeacherId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AssignTeachersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className?: string;
  onAssignSuccess?: () => void;
}

export function AssignTeachersDialog({
  open,
  onOpenChange,
  classId,
  className,
  onAssignSuccess,
}: AssignTeachersDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherIds: [],
      headTeacherId: undefined,
    },
  });

  // 重置表单
  const resetForm = () => {
    setSelectedTeacherIds([]);
    form.reset({
      teacherIds: [],
      headTeacherId: undefined,
    });
  };

  // 加载教师和班级数据
  useEffect(() => {
    if (open && classId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // 获取所有教师
          const teachersResponse = await fetch("/api/teachers");
          if (!teachersResponse.ok) {
            throw new Error("获取教师数据失败");
          }
          const teachersData = await teachersResponse.json();
          setAllTeachers(teachersData);

          // 获取班级信息
          const classResponse = await fetch(`/api/classes/${classId}`);
          if (!classResponse.ok) {
            throw new Error("获取班级数据失败");
          }
          const classData = await classResponse.json();
          
          // 设置已选教师
          setSelectedTeacherIds(classData.teacherIds || []);
          form.setValue("teacherIds", classData.teacherIds || []);
          form.setValue("headTeacherId", classData.headTeacherId || undefined);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("获取数据失败");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else {
      resetForm();
    }
  }, [open, classId, form]);

  const onSubmit = async (values: FormValues) => {
    if (!classId) {
      toast.error("班级ID不能为空");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/classes/${classId}/teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherIds: values.teacherIds,
          isHeadTeacher: values.headTeacherId,
        }),
      });

      if (!response.ok) {
        throw new Error("分配教师失败");
      }

      toast.success("教师分配成功");
      onOpenChange(false);
      onAssignSuccess?.();
    } catch (error) {
      console.error("Error assigning teachers:", error);
      toast.error("分配教师失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理教师勾选/取消勾选
  const handleTeacherSelection = (teacherId: string, isChecked: boolean | "indeterminate") => {
    if (isChecked === true) {
      const newSelected = [...selectedTeacherIds, teacherId];
      setSelectedTeacherIds(newSelected);
      form.setValue("teacherIds", newSelected);
    } else {
      const newSelected = selectedTeacherIds.filter(id => id !== teacherId);
      setSelectedTeacherIds(newSelected);
      form.setValue("teacherIds", newSelected);
      
      // 如果取消选中的是班主任，也清除班主任设置
      if (form.getValues("headTeacherId") === teacherId) {
        form.setValue("headTeacherId", undefined);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>分配教师到班级</DialogTitle>
          {className && (
            <DialogDescription>
              为 {className} 分配教师和班主任
            </DialogDescription>
          )}
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">加载中...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader className="bg-gray-50/30 sticky top-0">
                    <TableRow>
                      <TableHead className="w-[50px]">选择</TableHead>
                      <TableHead className="w-[100px]">姓名</TableHead>
                      <TableHead className="w-[80px]">性别</TableHead>
                      <TableHead className="w-[80px]">年龄</TableHead>
                      <TableHead className="w-[100px]">科目</TableHead>
                      <TableHead className="w-[100px]">职称</TableHead>
                      <TableHead className="w-[80px]">班主任</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTeachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          暂无教师数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      allTeachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedTeacherIds.includes(teacher.id)}
                              onCheckedChange={(checked: boolean | "indeterminate") => 
                                handleTeacherSelection(teacher.id, checked)
                              }
                            />
                          </TableCell>
                          <TableCell>{teacher.name}</TableCell>
                          <TableCell>{teacher.gender}</TableCell>
                          <TableCell>{teacher.age}</TableCell>
                          <TableCell>{teacher.subject}</TableCell>
                          <TableCell>{teacher.title}</TableCell>
                          <TableCell>
                            <input 
                              type="radio" 
                              name="headTeacher"
                              disabled={!selectedTeacherIds.includes(teacher.id)}
                              checked={form.getValues("headTeacherId") === teacher.id}
                              onChange={() => form.setValue("headTeacherId", teacher.id)}
                              className="h-4 w-4 text-primary rounded-full focus:ring-primary"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <FormField
                control={form.control}
                name="teacherIds"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting || form.getValues("teacherIds").length === 0}>
                  {isSubmitting ? "保存中..." : "确认分配"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
} 