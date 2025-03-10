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
import { Input } from "@/components/ui/input";
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
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

// 定义类型
interface Student {
  id: string;
  name: string;
  gender: string;
  age: number;
  class: string;
  grade: string;
  studentId: string;
  phone: string;
  guardian: string;
  status: string;
}

const formSchema = z.object({
  studentIds: z.array(z.string()).min(1, "请至少选择一位学生"),
});

type FormValues = z.infer<typeof formSchema>;

interface AssignStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className?: string;
  onAssignSuccess?: () => void;
}

export function AssignStudentsDialog({
  open,
  onOpenChange,
  classId,
  className,
  onAssignSuccess,
}: AssignStudentsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentIds: [],
    },
  });

  // 重置表单
  const resetForm = () => {
    setSelectedStudentIds([]);
    setSearchQuery("");
    form.reset({
      studentIds: [],
    });
  };

  // 加载学生数据
  useEffect(() => {
    if (open && classId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // 获取所有学生
          const studentsResponse = await fetch("/api/students");
          if (!studentsResponse.ok) {
            throw new Error("获取学生数据失败");
          }
          const studentsData = await studentsResponse.json();
          
          // 获取已分配该班级的学生
          const classStudentsResponse = await fetch(`/api/students?classId=${classId}`);
          if (!classStudentsResponse.ok) {
            throw new Error("获取班级学生数据失败");
          }
          const classStudents = await classStudentsResponse.json();
          
          // 过滤已经在该班级的学生
          const classStudentIds = classStudents.map((s: Student) => s.id);
          setSelectedStudentIds(classStudentIds);
          form.setValue("studentIds", classStudentIds);
          setAllStudents(studentsData);
          setFilteredStudents(studentsData);
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

  // 搜索过滤
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(allStudents);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredStudents(
        allStudents.filter(
          (student) =>
            student.name.toLowerCase().includes(query) ||
            student.studentId.toLowerCase().includes(query) ||
            student.guardian.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, allStudents]);

  const onSubmit = async (values: FormValues) => {
    if (!classId) {
      toast.error("班级ID不能为空");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/classes/${classId}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentIds: values.studentIds,
        }),
      });

      if (!response.ok) {
        throw new Error("分配学生失败");
      }

      toast.success("学生分配成功");
      onOpenChange(false);
      onAssignSuccess?.();
    } catch (error) {
      console.error("Error assigning students:", error);
      toast.error("分配学生失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理学生勾选/取消勾选
  const handleStudentSelection = (studentId: string, isChecked: boolean | "indeterminate") => {
    if (isChecked === true) {
      const newSelected = [...selectedStudentIds, studentId];
      setSelectedStudentIds(newSelected);
      form.setValue("studentIds", newSelected);
    } else {
      const newSelected = selectedStudentIds.filter(id => id !== studentId);
      setSelectedStudentIds(newSelected);
      form.setValue("studentIds", newSelected);
    }
  };

  // 全选/取消全选
  const handleSelectAll = (isChecked: boolean | "indeterminate") => {
    if (isChecked === true) {
      const allIds = filteredStudents.map(student => student.id);
      setSelectedStudentIds(allIds);
      form.setValue("studentIds", allIds);
    } else {
      setSelectedStudentIds([]);
      form.setValue("studentIds", []);
    }
  };

  // 检查是否全部选中
  const isAllSelected = filteredStudents.length > 0 && 
    filteredStudents.every(student => selectedStudentIds.includes(student.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>分配学生到班级</DialogTitle>
          {className && (
            <DialogDescription>
              为 {className} 分配学生
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="搜索学生姓名、学号或监护人..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader className="bg-gray-50/30 sticky top-0">
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={isAllSelected}
                          onCheckedChange={(checked: boolean | "indeterminate") => 
                            handleSelectAll(checked)
                          }
                          disabled={filteredStudents.length === 0}
                        />
                      </TableHead>
                      <TableHead className="w-[100px]">姓名</TableHead>
                      <TableHead className="w-[80px]">性别</TableHead>
                      <TableHead className="w-[80px]">年龄</TableHead>
                      <TableHead className="w-[100px]">学号</TableHead>
                      <TableHead className="w-[100px]">班级</TableHead>
                      <TableHead className="w-[100px]">监护人</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? "未找到匹配的学生" : "暂无学生数据"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedStudentIds.includes(student.id)}
                              onCheckedChange={(checked: boolean | "indeterminate") => 
                                handleStudentSelection(student.id, checked)
                              }
                            />
                          </TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.gender}</TableCell>
                          <TableCell>{student.age}</TableCell>
                          <TableCell>{student.studentId}</TableCell>
                          <TableCell>
                            {student.class ? (
                              <span className={student.class === classId ? "text-green-600 font-medium" : ""}>
                                已分配班级
                              </span>
                            ) : "未分配"}
                          </TableCell>
                          <TableCell>{student.guardian}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <FormField
                control={form.control}
                name="studentIds"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <div className="mr-auto text-sm text-muted-foreground">
                  已选择 {selectedStudentIds.length} 名学生
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting || selectedStudentIds.length === 0}>
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