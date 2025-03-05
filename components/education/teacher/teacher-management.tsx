"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Teacher } from "@/types/education";

// 定义教师表单验证模式
const teacherFormSchema = z.object({
  name: z.string().min(2, { message: "姓名至少需要2个字符" }),
  gender: z.enum(["male", "female"], { 
    required_error: "请选择性别" 
  }),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { 
    message: "请输入有效的日期格式 (YYYY-MM-DD)" 
  }),
  subject: z.string().min(1, { message: "请输入任教学科" }),
  externalAppIds: z.array(
    z.object({
      appId: z.string(),
      appName: z.string(),
      externalId: z.string(),
    })
  ).optional().default([]),
});

// 教师管理组件
export default function TeacherManagement() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [externalAppIdFields, setExternalAppIdFields] = useState([
    { appId: "", appName: "", externalId: "" },
  ]);

  // 初始化表单
  const form = useForm<z.infer<typeof teacherFormSchema>>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: "",
      gender: "male",
      birthDate: "",
      subject: "",
      externalAppIds: [],
    },
  });

  // 加载教师数据
  const loadTeachers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/teachers?page=${currentPage}&search=${searchTerm}`
      );
      if (!response.ok) throw new Error("加载教师数据失败");
      
      const data = await response.json();
      setTeachers(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("加载教师数据出错:", error);
      toast.error("加载教师数据失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 监听页码和搜索词变化，重新加载数据
  useEffect(() => {
    loadTeachers();
  }, [currentPage, searchTerm]);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // 重置到第一页
    loadTeachers();
  };

  // 处理添加教师
  const handleAddTeacher = async (values: z.infer<typeof teacherFormSchema>) => {
    try {
      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("添加教师失败");
      
      toast.success("教师添加成功");
      setIsAddDialogOpen(false);
      form.reset();
      loadTeachers();
    } catch (error) {
      console.error("添加教师出错:", error);
      toast.error("添加教师失败，请稍后重试");
    }
  };

  // 处理编辑教师
  const handleEditTeacher = async (values: z.infer<typeof teacherFormSchema>) => {
    if (!selectedTeacher) return;

    try {
      const response = await fetch(`/api/teachers/${selectedTeacher.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("更新教师失败");
      
      toast.success("教师信息更新成功");
      setIsEditDialogOpen(false);
      loadTeachers();
    } catch (error) {
      console.error("更新教师出错:", error);
      toast.error("更新教师失败，请稍后重试");
    }
  };

  // 处理删除教师
  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      const response = await fetch(`/api/teachers/${selectedTeacher.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("删除教师失败");
      
      toast.success("教师删除成功");
      setIsDeleteDialogOpen(false);
      loadTeachers();
    } catch (error) {
      console.error("删除教师出错:", error);
      toast.error("删除教师失败，请稍后重试");
    }
  };

  // 打开编辑对话框
  const openEditDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    form.reset({
      name: teacher.name,
      gender: teacher.gender,
      birthDate: teacher.birthDate,
      subject: teacher.subject,
      externalAppIds: teacher.externalAppIds.length > 0 
        ? teacher.externalAppIds 
        : [{ appId: "", appName: "", externalId: "" }],
    });
    setExternalAppIdFields(
      teacher.externalAppIds.length > 0 
        ? teacher.externalAppIds 
        : [{ appId: "", appName: "", externalId: "" }]
    );
    setIsEditDialogOpen(true);
  };

  // 打开删除对话框
  const openDeleteDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  // 添加外部应用ID字段
  const addExternalAppIdField = () => {
    setExternalAppIdFields([
      ...externalAppIdFields,
      { appId: "", appName: "", externalId: "" },
    ]);
  };

  // 更新外部应用ID字段
  const updateExternalAppIdField = (index: number, field: string, value: string) => {
    const updatedFields = [...externalAppIdFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setExternalAppIdFields(updatedFields);
    
    // 同时更新表单值
    form.setValue("externalAppIds", updatedFields.filter(
      field => field.appId && field.appName && field.externalId
    ));
  };

  // 删除外部应用ID字段
  const removeExternalAppIdField = (index: number) => {
    const updatedFields = externalAppIdFields.filter((_, i) => i !== index);
    setExternalAppIdFields(updatedFields.length ? updatedFields : [{ appId: "", appName: "", externalId: "" }]);
    
    // 同时更新表单值
    form.setValue("externalAppIds", updatedFields.filter(
      field => field.appId && field.appName && field.externalId
    ));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">教师管理</h1>
        <Button onClick={() => {
          form.reset();
          setExternalAppIdFields([{ appId: "", appName: "", externalId: "" }]);
          setIsAddDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> 添加教师
        </Button>
      </div>

      {/* 搜索栏 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          placeholder="搜索教师姓名或学科..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" /> 搜索
        </Button>
      </form>

      {/* 教师列表 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">暂无教师数据</p>
        </div>
      ) : (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>性别</TableHead>
                  <TableHead>出生日期</TableHead>
                  <TableHead>任教学科</TableHead>
                  <TableHead>外部应用ID</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>
                      {teacher.gender === "male" ? "男" : "女"}
                    </TableCell>
                    <TableCell>{teacher.birthDate}</TableCell>
                    <TableCell>{teacher.subject}</TableCell>
                    <TableCell>
                      {teacher.externalAppIds && teacher.externalAppIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.externalAppIds.map((app, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {app.appName}: {app.externalId}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">无</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">操作菜单</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(teacher)}>
                            <Edit className="mr-2 h-4 w-4" /> 编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(teacher)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> 删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 分页控制 */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              第 {currentPage} 页，共 {totalPages} 页
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> 上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
              >
                下一页 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* 添加教师对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加教师</DialogTitle>
            <DialogDescription>
              填写教师信息，所有带 * 的字段为必填项。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddTeacher)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入教师姓名" {...field} />
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
                    <FormLabel>性别 *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择性别" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">男</SelectItem>
                        <SelectItem value="female">女</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>出生日期 *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>任教学科 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入任教学科" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 外部应用ID */}
              <div>
                <FormLabel>外部应用ID</FormLabel>
                <div className="space-y-3 mt-2">
                  {externalAppIdFields.map((field, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="grid grid-cols-3 gap-2 flex-1">
                        <Input
                          placeholder="应用ID"
                          value={field.appId}
                          onChange={(e) => updateExternalAppIdField(index, "appId", e.target.value)}
                          className="col-span-1"
                        />
                        <Input
                          placeholder="应用名称"
                          value={field.appName}
                          onChange={(e) => updateExternalAppIdField(index, "appName", e.target.value)}
                          className="col-span-1"
                        />
                        <Input
                          placeholder="外部ID"
                          value={field.externalId}
                          onChange={(e) => updateExternalAppIdField(index, "externalId", e.target.value)}
                          className="col-span-1"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExternalAppIdField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={addExternalAppIdField}
                >
                  <Plus className="h-4 w-4 mr-1" /> 添加外部应用ID
                </Button>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 编辑教师对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑教师</DialogTitle>
            <DialogDescription>
              修改教师信息，所有带 * 的字段为必填项。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditTeacher)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入教师姓名" {...field} />
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
                    <FormLabel>性别 *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择性别" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">男</SelectItem>
                        <SelectItem value="female">女</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>出生日期 *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>任教学科 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入任教学科" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 外部应用ID */}
              <div>
                <FormLabel>外部应用ID</FormLabel>
                <div className="space-y-3 mt-2">
                  {externalAppIdFields.map((field, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="grid grid-cols-3 gap-2 flex-1">
                        <Input
                          placeholder="应用ID"
                          value={field.appId}
                          onChange={(e) => updateExternalAppIdField(index, "appId", e.target.value)}
                          className="col-span-1"
                        />
                        <Input
                          placeholder="应用名称"
                          value={field.appName}
                          onChange={(e) => updateExternalAppIdField(index, "appName", e.target.value)}
                          className="col-span-1"
                        />
                        <Input
                          placeholder="外部ID"
                          value={field.externalId}
                          onChange={(e) => updateExternalAppIdField(index, "externalId", e.target.value)}
                          className="col-span-1"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExternalAppIdField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={addExternalAppIdField}
                >
                  <Plus className="h-4 w-4 mr-1" /> 添加外部应用ID
                </Button>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除教师 "{selectedTeacher?.name}" 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeacher}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 