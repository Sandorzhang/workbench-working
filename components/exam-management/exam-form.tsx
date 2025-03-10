"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, CheckCircle2, ClockIcon, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const examSchema = z.object({
  name: z.string().min(1, "考试名称不能为空"),
  subject: z.string().min(1, "学科不能为空"),
  grade: z.string().min(1, "年级不能为空"),
  semester: z.string().min(1, "学期不能为空"),
  startTime: z.string().min(1, "开始时间不能为空"),
  endTime: z.string().min(1, "结束时间不能为空"),
  status: z.enum(["published", "draft"]),
});

type ExamFormValues = z.infer<typeof examSchema>;

const defaultValues: Partial<ExamFormValues> = {
  name: "",
  subject: "",
  grade: "",
  semester: "",
  startTime: "",
  endTime: "",
  status: "draft",
};

interface ExamFormProps {
  examId?: string;
}

export function ExamForm({ examId }: ExamFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(examId);

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues,
    mode: "onChange",
  });

  // 如果是编辑模式，获取考试信息
  useEffect(() => {
    if (examId) {
      setIsLoading(true);
      fetch(`/api/exams/${examId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch exam");
          }
          return response.json();
        })
        .then((data) => {
          // 忽略id字段，使用表单中的其他字段
          const { ...formData } = data;

          // 调整时间格式以适应输入框
          const formattedData = {
            ...formData,
            startTime: formData.startTime
              ? formData.startTime.replace(" ", "T").slice(0, 16)
              : "",
            endTime: formData.endTime
              ? formData.endTime.replace(" ", "T").slice(0, 16)
              : "",
          };

          form.reset(formattedData);
        })
        .catch((error) => {
          console.error("Error fetching exam:", error);
          toast({
            title: "获取考试信息失败",
            description: "请稍后再试",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [examId, form]);

  const onSubmit = async (data: ExamFormValues) => {
    setIsSubmitting(true);

    try {
      // 将日期格式转换回后端期望的格式
      const formattedData = {
        ...data,
        startTime: data.startTime.replace("T", " "),
        endTime: data.endTime.replace("T", " "),
      };

      const url = isEditing ? `/api/exams/${examId}` : "/api/exams";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error("Failed to save exam");
      }

      toast({
        title: isEditing ? "考试更新成功" : "考试创建成功",
        description: isEditing ? "考试信息已更新" : "新考试已创建",
      });

      router.push("/exam-management");
    } catch (error) {
      console.error("Error saving exam:", error);
      toast({
        title: "保存失败",
        description: "保存考试信息时出错",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const grades = [
    "一年级",
    "二年级",
    "三年级",
    "四年级",
    "五年级",
    "六年级",
    "初一",
    "初二",
    "初三",
    "高一",
    "高二",
    "高三",
  ];
  const subjects = [
    "语文",
    "数学",
    "英语",
    "物理",
    "化学",
    "生物",
    "历史",
    "地理",
    "政治",
    "综合",
  ];
  const semesters = ["第一学期", "第二学期"];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-sm text-muted-foreground">正在加载考试信息...</p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-1 border-b pb-3">
              <h3 className="text-lg font-medium">基本信息</h3>
              <p className="text-sm text-muted-foreground">
                设置考试的基本信息
              </p>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>考试名称</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="请输入考试名称"
                      {...field}
                      className="rounded-md"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    输入一个清晰的考试名称，例如 2023年春季期末考试
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学科</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-md">
                          <SelectValue placeholder="选择学科" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
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
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年级</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-md">
                          <SelectValue placeholder="选择年级" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {grades.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-1 border-b pb-3">
              <h3 className="text-lg font-medium">考试时间设置</h3>
              <p className="text-sm text-muted-foreground">
                设置考试的开始和结束时间
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学期</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-md">
                          <SelectValue placeholder="选择学期" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {semesters.map((semester) => (
                          <SelectItem key={semester} value={semester}>
                            {semester}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>发布状态</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-md">
                          <SelectValue placeholder="选择状态" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="published">
                          <div className="flex items-center">
                            <Badge className="mr-2 rounded-sm bg-green-100 text-green-800 hover:bg-green-200">
                              已发布
                            </Badge>
                            <span>考试已对学生可见</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="draft">
                          <div className="flex items-center">
                            <Badge
                              variant="secondary"
                              className="mr-2 rounded-sm"
                            >
                              草稿
                            </Badge>
                            <span>仅管理员可见</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      开始时间
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ClockIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="datetime-local"
                          {...field}
                          className="rounded-md pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      设置考试开始的日期和时间
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      结束时间
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ClockIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="datetime-local"
                          {...field}
                          className="rounded-md pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      设置考试结束的日期和时间
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/exam-management")}
            disabled={isSubmitting}
            className="rounded-md px-5"
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "rounded-md px-5 min-w-[100px]",
              isSubmitting ? "opacity-80" : ""
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditing ? "保存中..." : "创建中..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {isEditing ? "更新考试" : "创建考试"}
              </span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
