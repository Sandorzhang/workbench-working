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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// 定义类型
interface Grade {
  id: string;
  name: string;
  year: string;
}

interface Class {
  id: string;
  name: string;
  gradeId: string;
}

const formSchema = z.object({
  name: z.string().min(1, "姓名不能为空"),
  gender: z.string().min(1, "请选择性别"),
  age: z.coerce.number().min(6, "年龄必须大于6岁").max(30, "年龄必须小于30岁"),
  grade: z.string().min(1, "请选择年级"),
  class: z.string().min(1, "请选择班级"),
  studentId: z.string().min(1, "学号不能为空"),
  phone: z.string().min(1, "联系电话不能为空"),
  guardian: z.string().min(1, "监护人不能为空"),
  status: z.string().default("在读"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSuccess?: () => void;
}

export function AddStudentDialog({
  open,
  onOpenChange,
  onAddSuccess,
}: AddStudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gender: "",
      age: 13,
      grade: "",
      class: "",
      studentId: "",
      phone: "",
      guardian: "",
      status: "在读",
    },
  });

  // 监听年级变化，筛选班级
  const selectedGrade = form.watch("grade");

  useEffect(() => {
    if (selectedGrade) {
      setFilteredClasses(classes.filter((c) => c.gradeId === selectedGrade));
    } else {
      setFilteredClasses([]);
    }
    // 当年级变化时，重置班级选择
    form.setValue("class", "");
  }, [selectedGrade, classes, form]);

  // 获取年级和班级数据
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setIsLoadingGrades(true);
        setIsLoadingClasses(true);
        try {
          // 获取年级数据
          const gradesResponse = await fetch("/api/grades");
          if (!gradesResponse.ok) {
            throw new Error("获取年级数据失败");
          }
          const gradesData = await gradesResponse.json();
          setGrades(gradesData);

          // 获取班级数据
          const classesResponse = await fetch("/api/classes");
          if (!classesResponse.ok) {
            throw new Error("获取班级数据失败");
          }
          const classesData = await classesResponse.json();
          setClasses(classesData);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("获取数据失败");
        } finally {
          setIsLoadingGrades(false);
          setIsLoadingClasses(false);
        }
      };

      fetchData();
    }
  }, [open]);

  // 生成学号
  useEffect(() => {
    if (selectedGrade && !form.getValues("studentId")) {
      const grade = grades.find((g) => g.id === selectedGrade);
      if (grade) {
        const year = grade.year.slice(-2); // 取学年的后两位
        const randomNum = Math.floor(1000 + Math.random() * 9000); // 4位随机数
        form.setValue("studentId", `S${year}${randomNum}`);
      }
    }
  }, [selectedGrade, grades, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("添加学生失败");
      }

      toast.success("学生添加成功");
      form.reset();
      onOpenChange(false);
      onAddSuccess?.();
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("添加学生失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>添加学生</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名</FormLabel>
                    <FormControl>
                      <Input placeholder="输入学生姓名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>性别</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择性别" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="男">男</SelectItem>
                        <SelectItem value="女">女</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年龄</FormLabel>
                    <FormControl>
                      <Input type="number" min={6} max={30} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学号</FormLabel>
                    <FormControl>
                      <Input placeholder="输入学号" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年级</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingGrades}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择年级" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingGrades ? (
                          <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-sm text-muted-foreground">
                              加载中...
                            </span>
                          </div>
                        ) : grades.length === 0 ? (
                          <div className="py-2 px-2 text-sm text-muted-foreground">
                            暂无年级数据
                          </div>
                        ) : (
                          grades.map((grade) => (
                            <SelectItem key={grade.id} value={grade.id}>
                              {grade.name} ({grade.year})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>班级</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={
                        isLoadingClasses || !selectedGrade || filteredClasses.length === 0
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择班级" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingClasses ? (
                          <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-sm text-muted-foreground">
                              加载中...
                            </span>
                          </div>
                        ) : !selectedGrade ? (
                          <div className="py-2 px-2 text-sm text-muted-foreground">
                            请先选择年级
                          </div>
                        ) : filteredClasses.length === 0 ? (
                          <div className="py-2 px-2 text-sm text-muted-foreground">
                            该年级下暂无班级
                          </div>
                        ) : (
                          filteredClasses.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guardian"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>监护人</FormLabel>
                    <FormControl>
                      <Input placeholder="输入监护人姓名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>联系电话</FormLabel>
                    <FormControl>
                      <Input placeholder="输入联系电话" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>状态</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="在读">在读</SelectItem>
                      <SelectItem value="休学">休学</SelectItem>
                      <SelectItem value="已毕业">已毕业</SelectItem>
                    </SelectContent>
                  </Select>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "添加中..." : "添加"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 