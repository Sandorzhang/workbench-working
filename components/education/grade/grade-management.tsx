"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from "@/components/ui/form";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CardContainer } from "@/components/ui/card-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton-loader";
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  MoreHorizontal,
  RefreshCw,
  BookOpen,
  Loader2
} from "lucide-react";
import { Grade } from "@/types/education";

// 表单验证模式
const gradeFormSchema = z.object({
  gradeLevel: z
    .string()
    .min(1, { message: "年级名称不能为空" })
    .max(50, { message: "年级名称最长为50个字符" }),
  gradeNumber: z
    .number()
    .min(1, { message: "年级编号必须大于0" })
    .max(20, { message: "年级编号不能超过20" }),
  academicYear: z
    .string()
    .min(4, { message: "学年格式应为YYYY-YYYY" })
    .regex(/^\d{4}-\d{4}$/, { message: "学年格式应为YYYY-YYYY" }),
  description: z
    .string()
    .max(200, { message: "描述最长为200个字符" })
    .optional(),
});

type GradeFormValues = z.infer<typeof gradeFormSchema>;

export default function GradeManagement() {
  // 状态管理
  const [grades, setGrades] = useState<Grade[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // 对话框状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  // 初始化表单
  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      gradeLevel: "",
      gradeNumber: 1,
      academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
      description: "",
    },
  });

  // 编辑表单
  const editForm = useForm<GradeFormValues>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      gradeLevel: "",
      gradeNumber: 1,
      academicYear: "",
      description: "",
    },
  });

  // 加载年级数据
  const loadGrades = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/grades?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`);
      if (!response.ok) {
        throw new Error("获取年级列表失败");
      }
      const data = await response.json();
      setGrades(data.data);
      setTotalPages(data.totalPages);
      setTotalItems(data.total);
    } catch (error) {
      console.error("加载年级数据出错:", error);
      toast.error("加载年级数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 监听页码变化，重新加载数据
  useEffect(() => {
    loadGrades();
  }, [currentPage, searchQuery]);

  // 处理搜索输入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // 重置到第一页
  };

  // 打开添加对话框
  const openAddDialog = () => {
    form.reset({
      gradeLevel: "",
      gradeNumber: 1,
      academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
      description: "",
    });
    setIsAddDialogOpen(true);
  };

  // 打开编辑对话框
  const openEditDialog = (grade: Grade) => {
    setSelectedGrade(grade);
    editForm.reset({
      gradeLevel: grade.gradeLevel || "",
      gradeNumber: grade.gradeNumber || 1,
      academicYear: grade.academicYear || "",
      description: grade.description || "",
    });
    setIsEditDialogOpen(true);
  };

  // 打开删除对话框
  const openDeleteDialog = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsDeleteDialogOpen(true);
  };

  // 添加年级
  const onAddSubmit = async (data: GradeFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("年级添加成功");
        setIsAddDialogOpen(false);
        loadGrades();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "添加失败，请重试");
      }
    } catch (error) {
      toast.error("添加失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 编辑年级
  const onEditSubmit = async (data: GradeFormValues) => {
    if (!selectedGrade) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/grades/${selectedGrade.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("年级更新成功");
        setIsEditDialogOpen(false);
        loadGrades();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "更新失败，请重试");
      }
    } catch (error) {
      toast.error("更新失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除年级
  const handleDelete = async () => {
    if (!selectedGrade) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/grades/${selectedGrade.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("年级删除成功");
        setIsDeleteDialogOpen(false);
        loadGrades();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "删除失败，请重试");
      }
    } catch (error) {
      toast.error("删除失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 查看年级下的班级
  const viewClasses = (gradeId: string) => {
    router.push(`/admin/education/classes?gradeId=${gradeId}`);
  };

  return (
    <div className="space-y-4">
      {/* 搜索和操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="搜索年级名称..."
            className="pl-10 pr-4"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={loadGrades} variant="outline" size="icon" className="h-10 w-10">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openAddDialog} className="h-10">
            <Plus className="h-4 w-4 mr-2" />
            添加年级
          </Button>
        </div>
      </div>

      {/* 年级列表 */}
      <CardContainer>
        <CardHeader className="px-6 py-5 border-b">
          <CardTitle className="text-xl">年级列表</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rowCount={5} columnCount={5} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>年级名称</TableHead>
                    <TableHead>年级编号</TableHead>
                    <TableHead>学年</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead className="w-[150px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-32 text-center text-muted-foreground"
                      >
                        {searchQuery
                          ? "未找到匹配的年级"
                          : "暂无年级数据"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.gradeLevel}</TableCell>
                        <TableCell>{grade.gradeNumber}</TableCell>
                        <TableCell>{grade.academicYear}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {grade.description || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewClasses(grade.id)}
                            >
                              查看班级
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(grade)}>
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(grade)}
                                  className="text-destructive"
                                >
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
      </CardContainer>

      {/* 分页 */}
      {!isLoading && grades.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            共 {totalItems} 条记录
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* 添加年级对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>添加年级</DialogTitle>
            <DialogDescription>
              填写年级信息，点击提交添加新年级。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年级名称</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入年级名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年级编号</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="例如：1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      用于排序和区分年级的数字编码
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学年</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：2023-2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述（可选）</FormLabel>
                    <FormControl>
                      <Textarea placeholder="请输入年级描述" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    "添加"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 编辑年级对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>编辑年级</DialogTitle>
            <DialogDescription>
              修改年级信息，点击保存更新年级。
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年级名称</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入年级名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="gradeNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年级编号</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="例如：1" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      用于排序和区分年级的数字编码
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学年</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：2023-2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述（可选）</FormLabel>
                    <FormControl>
                      <Textarea placeholder="请输入年级描述" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    "保存"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 删除年级对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              确定要删除年级
              <span className="font-medium mx-1">
                {selectedGrade?.gradeLevel}
              </span>
              吗？此操作不可撤销，并且会同时删除该年级下的所有班级和学生关联关系。
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  删除中...
                </>
              ) : (
                "确认删除"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 