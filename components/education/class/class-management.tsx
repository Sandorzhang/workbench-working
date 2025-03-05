"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CardContainer } from "@/components/ui/card-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/skeleton-loader";
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  MoreHorizontal,
  RefreshCw,
  Users,
  UserCog
} from "lucide-react";
import { Class, Grade } from "@/types/education";

// 表单验证模式
const classFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "班级名称不能为空" })
    .max(50, { message: "班级名称最长为50个字符" }),
  gradeId: z
    .string()
    .min(1, { message: "必须选择所属年级" }),
  headTeacherId: z
    .string()
    .optional(),
  roomNumber: z
    .string()
    .max(20, { message: "教室号最长为20个字符" })
    .optional(),
  description: z
    .string()
    .max(200, { message: "描述最长为200个字符" })
    .optional(),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

export default function ClassManagement() {
  // 状态管理
  const [classes, setClasses] = useState<Class[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");

  // 对话框状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // 初始化表单
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: "",
      gradeId: "",
      headTeacherId: "",
      roomNumber: "",
      description: "",
    },
  });

  // 编辑表单
  const editForm = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: "",
      gradeId: "",
      headTeacherId: "",
      roomNumber: "",
      description: "",
    },
  });

  useEffect(() => {
    // 检查URL中是否有gradeId参数
    const gradeId = searchParams.get("gradeId");
    if (gradeId) {
      setSelectedGradeId(gradeId);
    }
  }, [searchParams]);

  // 加载年级数据
  const loadGrades = async () => {
    try {
      const response = await fetch("/api/grades");
      if (!response.ok) {
        throw new Error("获取年级数据失败");
      }
      const data = await response.json();
      setGrades(data.data);
    } catch (error) {
      console.error("获取年级数据出错:", error);
      toast.error("获取年级数据失败");
    }
  };

  // 加载班级数据
  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const url = selectedGradeId && selectedGradeId !== 'all'
        ? `/api/classes?gradeId=${selectedGradeId}&search=${searchQuery}` 
        : `/api/classes?search=${searchQuery}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("获取班级数据失败");
      }
      const data = await response.json();
      setClasses(data.data);
    } catch (error) {
      console.error("获取班级数据出错:", error);
      toast.error("获取班级数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化和刷新数据
  useEffect(() => {
    loadGrades();
  }, []);

  // 当年级选择或搜索条件变化时重新加载班级数据
  useEffect(() => {
    loadClasses();
  }, [selectedGradeId, searchQuery]);

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 处理年级选择
  const handleGradeChange = (value: string) => {
    setSelectedGradeId(value);
    if (value && value !== 'all') {
      // 更新URL但不触发完全导航
      const newUrl = `/admin/education/classes?gradeId=${value}`;
      window.history.pushState({}, "", newUrl);
    } else {
      // 清除URL参数
      window.history.pushState({}, "", "/admin/education/classes");
    }
  };

  // 打开添加对话框
  const openAddDialog = () => {
    form.reset({
      name: "",
      gradeId: selectedGradeId || "",
      headTeacherId: "",
      roomNumber: "",
      description: "",
    });
    setIsAddDialogOpen(true);
  };

  // 打开编辑对话框
  const openEditDialog = (classItem: Class) => {
    setSelectedClass(classItem);
    editForm.reset({
      name: classItem.name,
      gradeId: classItem.gradeId,
      headTeacherId: classItem.headTeacherId || "",
      roomNumber: classItem.roomNumber || "",
      description: classItem.description || "",
    });
    setIsEditDialogOpen(true);
  };

  // 打开删除对话框
  const openDeleteDialog = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsDeleteDialogOpen(true);
  };

  // 添加班级
  const onAddSubmit = async (data: ClassFormValues) => {
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("添加班级失败");
      }

      toast.success("班级添加成功");
      setIsAddDialogOpen(false);
      loadClasses();
    } catch (error) {
      console.error("添加班级出错:", error);
      toast.error("添加班级失败");
    }
  };

  // 编辑班级
  const onEditSubmit = async (data: ClassFormValues) => {
    if (!selectedClass) return;

    try {
      const response = await fetch(`/api/classes/${selectedClass.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("编辑班级失败");
      }

      toast.success("班级更新成功");
      setIsEditDialogOpen(false);
      loadClasses();
    } catch (error) {
      console.error("编辑班级出错:", error);
      toast.error("编辑班级失败");
    }
  };

  // 删除班级
  const confirmDelete = async () => {
    if (!selectedClass) return;

    try {
      const response = await fetch(`/api/classes/${selectedClass.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除班级失败");
      }

      toast.success("班级删除成功");
      setIsDeleteDialogOpen(false);
      loadClasses();
    } catch (error) {
      console.error("删除班级出错:", error);
      toast.error("删除班级失败");
    }
  };

  // 管理班级学生
  const manageStudents = (classId: string) => {
    router.push(`/admin/education/students?classId=${classId}`);
  };

  // 管理班级教师
  const manageTeachers = (classId: string) => {
    router.push(`/admin/education/teachers?classId=${classId}`);
  };

  // 获取年级名称
  const getGradeName = (gradeId: string) => {
    const grade = grades.find(g => g.id === gradeId);
    return grade ? grade.name : '-';
  };

  return (
    <div className="space-y-4">
      {/* 搜索和操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <Select 
              value={selectedGradeId} 
              onValueChange={handleGradeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择年级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有年级</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="搜索班级名称..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadClasses} variant="outline" size="icon" className="h-10 w-10">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openAddDialog} className="h-10">
            <Plus className="h-4 w-4 mr-2" />
            添加班级
          </Button>
        </div>
      </div>

      {/* 班级列表 */}
      <CardContainer>
        <CardHeader className="px-6 py-5 border-b">
          <CardTitle className="text-xl">
            班级列表
            {selectedGradeId && (
              <span className="ml-2 text-muted-foreground font-normal text-base">
                ({getGradeName(selectedGradeId)})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rowCount={5} columnCount={6} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">班级名称</TableHead>
                    <TableHead className="w-[150px]">所属年级</TableHead>
                    <TableHead className="w-[150px]">教室</TableHead>
                    <TableHead className="w-[100px]">学生数</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead className="w-[150px] text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-muted-foreground"
                      >
                        {searchQuery
                          ? "未找到匹配的班级"
                          : selectedGradeId 
                            ? `${getGradeName(selectedGradeId)}暂无班级数据`
                            : "暂无班级数据"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    classes.map((classItem) => (
                      <TableRow key={classItem.id}>
                        <TableCell className="font-medium">{classItem.name}</TableCell>
                        <TableCell>{getGradeName(classItem.gradeId)}</TableCell>
                        <TableCell>{classItem.roomNumber || "-"}</TableCell>
                        <TableCell>{classItem.studentCount || 0}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {classItem.description || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => manageStudents(classItem.id)}>
                                  <Users className="h-4 w-4 mr-2" />
                                  管理学生
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => manageTeachers(classItem.id)}>
                                  <UserCog className="h-4 w-4 mr-2" />
                                  管理教师
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(classItem)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => openDeleteDialog(classItem)}
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

      {/* 添加班级对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>添加班级</DialogTitle>
            <DialogDescription>
              填写班级信息，点击提交添加新班级。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>班级名称</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：一年级一班" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>所属年级</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择年级" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {grades.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id}>
                            {grade.name}
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
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>教室</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：A101" {...field} />
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
                      <Textarea placeholder="班级描述信息" {...field} />
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

      {/* 编辑班级对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>编辑班级</DialogTitle>
            <DialogDescription>
              修改班级信息，点击保存更新班级。
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>班级名称</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：一年级一班" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="gradeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>所属年级</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择年级" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {grades.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id}>
                            {grade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>教室</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：A101" {...field} />
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
                      <Textarea placeholder="班级描述信息" {...field} />
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

      {/* 删除班级对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              确定要删除班级
              <span className="font-medium mx-1">
                {selectedClass?.name}
              </span>
              吗？此操作不可撤销，并且会解除该班级与所有学生和教师的关联关系。
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