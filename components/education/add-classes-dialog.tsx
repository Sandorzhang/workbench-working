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
  FormDescription,
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// 定义年级类型
interface Grade {
  id: string;
  name: string;
  year: string;
  description?: string;
}

const formSchema = z.object({
  gradeId: z.string().min(1, "请选择年级"),
  classCount: z.coerce.number().min(1, "至少添加1个班级").max(20, "最多添加20个班级"),
  namePrefix: z.string().default("班"),
  startNumber: z.coerce.number().min(1, "起始编号最小为1").default(1),
});

type FormValues = z.infer<typeof formSchema>;

interface AddClassesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSuccess?: () => void;
}

export function AddClassesDialog({
  open,
  onOpenChange,
  onAddSuccess,
}: AddClassesDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gradeId: "",
      classCount: 1,
      namePrefix: "班",
      startNumber: 1,
    },
  });

  // 获取年级列表
  useEffect(() => {
    if (open) {
      const fetchGrades = async () => {
        setIsLoadingGrades(true);
        try {
          const response = await fetch("/api/grades");
          if (!response.ok) {
            throw new Error("获取年级数据失败");
          }
          const data = await response.json();
          setGrades(data);
        } catch (error) {
          console.error("Error fetching grades:", error);
          toast.error("获取年级数据失败");
        } finally {
          setIsLoadingGrades(false);
        }
      };

      fetchGrades();
    }
  }, [open]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/classes/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("批量添加班级失败");
      }

      const result = await response.json();
      
      toast.success(`成功添加 ${result.classes.length} 个班级`);
      form.reset();
      onOpenChange(false);
      onAddSuccess?.();
    } catch (error) {
      console.error("Error adding classes:", error);
      toast.error("批量添加班级失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>批量添加班级</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="gradeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>选择年级</FormLabel>
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
                          <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
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
              name="classCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>班级数量</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={20} {...field} />
                  </FormControl>
                  <FormDescription>
                    要创建的班级数量，最多20个
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="namePrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>班级后缀</FormLabel>
                    <FormControl>
                      <Input placeholder="班" {...field} />
                    </FormControl>
                    <FormDescription>
                      例如：班、组
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>起始编号</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormDescription>
                      从哪个编号开始
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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