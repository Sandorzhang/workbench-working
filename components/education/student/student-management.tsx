"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Class, Grade, PaginatedResponse, Student } from "@/types/models";

// 学生表单验证模式
const studentFormSchema = z.object({
  name: z.string().min(2, { message: "姓名至少需要2个字符" }),
  gender: z.enum(["male", "female"], {
    required_error: "请选择性别",
  }),
  enrollmentYear: z.coerce
    .number()
    .min(2015, { message: "入学年份不能早于2015年" }),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "请输入有效的日期格式 (YYYY-MM-DD)",
  }),
  studentNumber: z.string().min(5, { message: "学籍号至少需要5个字符" }),
  classId: z.string().min(1, { message: "请选择班级" }),
  gradeId: z.string().min(1, { message: "请选择年级" }),
  externalAppIds: z
    .array(
      z.object({
        appId: z.string(),
        appName: z.string(),
        externalId: z.string(),
      })
    )
    .optional()
    .default([]),
});

export default function StudentManagement() {
  // const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [gradeFilter, setGradeFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [externalAppIdFields, setExternalAppIdFields] = useState([
    { appId: "", appName: "", externalId: "" },
  ]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);

  // 初始化表单
  const form = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      gender: "male",
      enrollmentYear: new Date().getFullYear(),
      birthDate: "",
      studentNumber: "",
      classId: "",
      gradeId: "",
      externalAppIds: [],
    },
  });

  // 加载学生数据
  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/students?page=${currentPage}&search=${searchTerm}&gradeId=${gradeFilter}&classId=${classFilter}`
      );
      if (!response.ok) throw new Error("加载学生数据失败");

      const data = (await response.json()) as PaginatedResponse<Student>;
      setStudents(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("加载学生数据出错:", error);
      toast.error("加载学生数据失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 加载年级数据
  const loadGrades = async () => {
    try {
      const response = await fetch("/api/grades");
      if (!response.ok) throw new Error("加载年级数据失败");

      const data = await response.json();
      setGrades(data.data);
    } catch (error) {
      console.error("加载年级数据出错:", error);
      toast.error("加载年级数据失败");
    }
  };

  // 加载班级数据
  const loadClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      if (!response.ok) throw new Error("加载班级数据失败");

      const data = await response.json();
      setClasses(data.data);
    } catch (error) {
      console.error("加载班级数据出错:", error);
      toast.error("加载班级数据失败");
    }
  };

  // 监听页码和筛选条件变化，重新加载数据
  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, gradeFilter, classFilter]);

  // 初始加载年级和班级数据
  useEffect(() => {
    loadGrades();
    loadClasses();
  }, []);

  // 更新年级筛选时，重置班级筛选并过滤相关班级
  useEffect(() => {
    if (gradeFilter && gradeFilter !== "all") {
      setFilteredClasses(classes.filter((cls) => cls.gradeId === gradeFilter));
      setClassFilter("all");
    } else {
      setFilteredClasses(classes);
    }
  }, [gradeFilter, classes]);

  // 更新表单中年级选择时，过滤相关班级
  const handleGradeChange = (gradeId: string) => {
    setGradeFilter(gradeId);
    form.setValue("gradeId", gradeId === "all" ? "" : gradeId);
    form.setValue("classId", "");

    if (gradeId && gradeId !== "all") {
      setFilteredClasses(classes.filter((cls) => cls.gradeId === gradeId));
    } else {
      setFilteredClasses(classes);
    }
  };

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // 重置到第一页
    loadStudents();
  };

  // 处理添加学生
  const handleAddStudent = async (
    values: z.infer<typeof studentFormSchema>
  ) => {
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("添加学生失败");

      toast.success("学生添加成功");
      setIsAddDialogOpen(false);
      form.reset();
      loadStudents();
    } catch (error) {
      console.error("添加学生出错:", error);
      toast.error("添加学生失败，请稍后重试");
    }
  };

  // 处理编辑学生
  const handleEditStudent = async (
    values: z.infer<typeof studentFormSchema>
  ) => {
    if (!selectedStudent) return;

    try {
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("更新学生失败");

      toast.success("学生信息更新成功");
      setIsEditDialogOpen(false);
      loadStudents();
    } catch (error) {
      console.error("更新学生出错:", error);
      toast.error("更新学生失败，请稍后重试");
    }
  };

  // 处理删除学生
  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("删除学生失败");

      toast.success("学生删除成功");
      setIsDeleteDialogOpen(false);
      loadStudents();
    } catch (error) {
      console.error("删除学生出错:", error);
      toast.error("删除学生失败，请稍后重试");
    }
  };

  // 打开编辑对话框
  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    const defaultExternalAppId = [{ appId: "", appName: "", externalId: "" }];
    const externalAppIds = Array.isArray(student.externalAppIds)
      ? student.externalAppIds
      : defaultExternalAppId;

    form.reset({
      name: student.name,
      gender: student.gender === "男" ? "male" : "female",
      enrollmentYear: Number(student.enrollmentYear),
      birthDate: student.birthDate,
      studentNumber: student.studentNumber,
      classId: student.classId || "",
      gradeId: student.gradeId || "",
      externalAppIds,
    });
    setExternalAppIdFields(externalAppIds);

    // 设置对应的班级列表
    setFilteredClasses(
      classes.filter((cls) => cls.gradeId === student.gradeId)
    );

    setIsEditDialogOpen(true);
  };

  // 打开删除对话框
  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
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
  const updateExternalAppIdField = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedFields = [...externalAppIdFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setExternalAppIdFields(updatedFields);

    // 同时更新表单值
    form.setValue(
      "externalAppIds",
      updatedFields.filter(
        (field) => field.appId && field.appName && field.externalId
      )
    );
  };

  // 删除外部应用ID字段
  const removeExternalAppIdField = (index: number) => {
    const updatedFields = externalAppIdFields.filter((_, i) => i !== index);
    setExternalAppIdFields(
      updatedFields.length
        ? updatedFields
        : [{ appId: "", appName: "", externalId: "" }]
    );

    // 同时更新表单值
    form.setValue(
      "externalAppIds",
      updatedFields.filter(
        (field) => field.appId && field.appName && field.externalId
      )
    );
  };

  // 获取年级名称
  const getGradeName = (gradeId: string) => {
    const grade = grades.find((g) => g.id === gradeId);
    return grade ? grade.gradeLevel : "";
  };

  // 获取班级名称
  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId);
    return cls ? cls.name : "";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">学生管理</h1>
        <Button
          onClick={() => {
            form.reset();
            setExternalAppIdFields([
              { appId: "", appName: "", externalId: "" },
            ]);
            setFilteredClasses([]);
            setIsAddDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> 添加学生
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <div className="grid gap-4 mb-6 md:grid-cols-4">
        <form onSubmit={handleSearch} className="flex gap-2 md:col-span-2">
          <Input
            placeholder="搜索学生姓名或学籍号..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" /> 搜索
          </Button>
        </form>

        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="选择年级" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有年级</SelectItem>
            {grades.map((grade) => (
              <SelectItem key={grade.id} value={grade.id}>
                {grade.gradeLevel} ({grade.academicYear})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={classFilter}
          onValueChange={setClassFilter}
          disabled={!gradeFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择班级" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有班级</SelectItem>
            {filteredClasses.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 学生列表 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">暂无学生数据</p>
        </div>
      ) : (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>学籍号</TableHead>
                  <TableHead>年级</TableHead>
                  <TableHead>班级</TableHead>
                  <TableHead>入学年份</TableHead>
                  <TableHead>性别</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.studentNumber}</TableCell>
                    <TableCell>{getGradeName(student.gradeId ?? "")}</TableCell>
                    <TableCell>{getClassName(student.classId ?? "")}</TableCell>
                    <TableCell>{student.enrollmentYear}</TableCell>
                    <TableCell>
                      {student.gender === "male" ? "男" : "女"}
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
                          <DropdownMenuItem
                            onClick={() => openEditDialog(student)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> 编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(student)}
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage >= totalPages}
              >
                下一页 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* 添加学生对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加学生</DialogTitle>
            <DialogDescription>
              填写学生信息，所有带 * 的字段为必填项。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddStudent)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入学生姓名" {...field} />
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="enrollmentYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>入学年份 *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={2015}
                          max={new Date().getFullYear()}
                          {...field}
                        />
                      </FormControl>
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
              </div>
              <FormField
                control={form.control}
                name="studentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学籍号 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入学籍号" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gradeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>年级 *</FormLabel>
                      <Select
                        onValueChange={(value) => handleGradeChange(value)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择年级" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade.id} value={grade.id}>
                              {grade.gradeLevel}
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
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>班级 *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!form.watch("gradeId")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择班级" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredClasses.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                          onChange={(e) =>
                            updateExternalAppIdField(
                              index,
                              "appId",
                              e.target.value
                            )
                          }
                          className="col-span-1"
                        />
                        <Input
                          placeholder="应用名称"
                          value={field.appName}
                          onChange={(e) =>
                            updateExternalAppIdField(
                              index,
                              "appName",
                              e.target.value
                            )
                          }
                          className="col-span-1"
                        />
                        <Input
                          placeholder="外部ID"
                          value={field.externalId}
                          onChange={(e) =>
                            updateExternalAppIdField(
                              index,
                              "externalId",
                              e.target.value
                            )
                          }
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 编辑学生对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑学生</DialogTitle>
            <DialogDescription>
              修改学生信息，所有带 * 的字段为必填项。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEditStudent)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入学生姓名" {...field} />
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="enrollmentYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>入学年份 *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={2015}
                          max={new Date().getFullYear()}
                          {...field}
                        />
                      </FormControl>
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
              </div>
              <FormField
                control={form.control}
                name="studentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学籍号 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入学籍号" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gradeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>年级 *</FormLabel>
                      <Select
                        onValueChange={(value) => handleGradeChange(value)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择年级" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade.id} value={grade.id}>
                              {grade.gradeLevel}
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
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>班级 *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!form.watch("gradeId")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择班级" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredClasses.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                          onChange={(e) =>
                            updateExternalAppIdField(
                              index,
                              "appId",
                              e.target.value
                            )
                          }
                          className="col-span-1"
                        />
                        <Input
                          placeholder="应用名称"
                          value={field.appName}
                          onChange={(e) =>
                            updateExternalAppIdField(
                              index,
                              "appName",
                              e.target.value
                            )
                          }
                          className="col-span-1"
                        />
                        <Input
                          placeholder="外部ID"
                          value={field.externalId}
                          onChange={(e) =>
                            updateExternalAppIdField(
                              index,
                              "externalId",
                              e.target.value
                            )
                          }
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
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
              您确定要删除学生 {selectedStudent?.name} 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteStudent}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
