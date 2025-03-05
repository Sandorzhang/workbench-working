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
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CardContainer } from "@/components/ui/card-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton-loader";
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  MoreHorizontal,
  RefreshCw,
  BookOpen
} from "lucide-react";
import { Grade } from "@/types/education";

// 表单验证模式
const gradeFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "年级名称不能为空" })
    .max(50, { message: "年级名称最长为50个字符" }),
  year: z
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
  const pageSize = 10;

  // 对话框状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  const router = useRouter();

  // 初始化表单
  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      name: "",
      year: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
      description: "",
    },
  });

  // 编辑表单
  const editForm = useForm<GradeFormValues>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      name: "",
      year: "",
      description: "",
    },
  });

  // 加载年级数据
  const loadGrades = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/grades?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`);
      if (!response.ok) {
        throw new Error("获取年级数据失败");
      }
      const data = await response.json();
      setGrades(data.data);
      setTotalPages(Math.ceil(data.total / pageSize));
    } catch (error) {
      console.error("获取年级数据出错:", error);
      toast.error("获取年级数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 当页码、搜索条件变化时重新加载数据
  useEffect(() => {
    loadGrades();
  }, [currentPage, searchQuery]);

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // 重置到第一页
  };

  // 处理页码变化
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 打开添加对话框
  const openAddDialog = () => {
    form.reset({
      name: "",
      year: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
      description: "",
    });
    setIsAddDialogOpen(true);
  };

  // 打开编辑对话框
  const openEditDialog = (grade: Grade) => {
    setSelectedGrade(grade);
    editForm.reset({
      name: grade.name,
      year: grade.year,
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
    try {
      const response = await fetch("/api/grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("添加年级失败");
      }

      toast.success("年级添加成功");
      setIsAddDialogOpen(false);
      loadGrades();
    } catch (error) {
      console.error("添加年级出错:", error);
      toast.error("添加年级失败");
    }
  };

  // 编辑年级
  const onEditSubmit = async (data: GradeFormValues) => {
    if (!selectedGrade) return;

    try {
      const response = await fetch(`/api/grades/${selectedGrade.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("编辑年级失败");
      }

      toast.success("年级更新成功");
      setIsEditDialogOpen(false);
      loadGrades();
    } catch (error) {
      console.error("编辑年级出错:", error);
      toast.error("编辑年级失败");
    }
  };

  // 删除年级
  const confirmDelete = async () => {
    if (!selectedGrade) return;

    try {
      const response = await fetch(`/api/grades/${selectedGrade.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除年级失败");
      }

      toast.success("年级删除成功");
      setIsDeleteDialogOpen(false);
      loadGrades();
    } catch (error) {
      console.error("删除年级出错:", error);
      toast.error("删除年级失败");
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
            onChange={handleSearch}
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
                    <TableHead className="w-[200px]">年级名称</TableHead>
                    <TableHead className="w-[150px]">学年</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead className="w-[150px] text-right">操作</TableHead>
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
                        <TableCell className="font-medium">{grade.name}</TableCell>
                        <TableCell>{grade.year}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {grade.description || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewClasses(grade.id)}
                            >
                              <BookOpen className="h-4 w-4 mr-1" />
                              班级
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(grade)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => openDeleteDialog(grade)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
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
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                />
              </PaginationItem>
              <PaginationItem className="flex items-center">
                <span>
                  {currentPage} / {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年级名称</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：一年级" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
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
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea placeholder="年级描述信息" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">提交</Button>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年级名称</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：一年级" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="year"
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
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea placeholder="年级描述信息" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">保存</Button>
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
                {selectedGrade?.name}
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
              onClick={confirmDelete}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 