"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Edit, 
  Trash2, 
  UserPlus, 
  FileDown, 
  FileUp, 
  MoreHorizontal, 
  Plus, 
  GraduationCap, 
  Users,
  School,
  FolderPlus,
  BookOpen,
  UserCog 
} from "lucide-react";
import { 
  TitleSkeleton, 
  TableSkeleton, 
  TabsSkeleton 
} from "@/components/ui/skeleton-loader";
import { PageContainer } from "@/components/ui/page-container";
import { SectionContainer } from "@/components/ui/section-container";
import { CardContainer } from "@/components/ui/card-container";
import { toast } from "sonner";
import {
  AddGradeDialog,
  AddClassesDialog,
  AddTeacherDialog,
  AddStudentDialog,
  AssignTeachersDialog,
  AssignStudentsDialog
} from "@/components/education";

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

interface Grade {
  id: string;
  name: string;
  year: string;
  description?: string;
}

interface Class {
  id: string;
  name: string;
  gradeId: string;
  grade?: Grade;
  headTeacherId?: string;
  teacherIds: string[];
  studentIds: string[];
  roomNumber?: string;
  description?: string;
  studentCount?: number;
}

export default function UsersPage() {
  // 状态控制
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teachers');
  
  // 弹窗状态
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddGradeDialogOpen, setIsAddGradeDialogOpen] = useState(false);
  const [isAddClassesDialogOpen, setIsAddClassesDialogOpen] = useState(false);
  const [isAddTeacherDialogOpen, setIsAddTeacherDialogOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isAssignTeachersDialogOpen, setIsAssignTeachersDialogOpen] = useState(false);
  const [isAssignStudentsDialogOpen, setIsAssignStudentsDialogOpen] = useState(false);
  
  // 初始化数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取教师数据
        const teachersResponse = await fetch('/api/teachers');
        const teachersData = await teachersResponse.json();
        setTeachers(teachersData);
        
        // 获取学生数据
        const studentsResponse = await fetch('/api/students');
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);

        // 获取年级数据
        const gradesResponse = await fetch('/api/grades');
        const gradesData = await gradesResponse.json();
        setGrades(gradesData);

        // 获取班级数据
        const classesResponse = await fetch('/api/classes');
        const classesData = await classesResponse.json();
        setClasses(classesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('无法加载数据');
      } finally {
        // 模拟加载延迟
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };
    
    fetchData();
  }, []);
  
  // 刷新数据
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // 获取教师数据
      const teachersResponse = await fetch('/api/teachers');
      const teachersData = await teachersResponse.json();
      setTeachers(teachersData);
      
      // 获取学生数据
      const studentsResponse = await fetch('/api/students');
      const studentsData = await studentsResponse.json();
      setStudents(studentsData);

      // 获取年级数据
      const gradesResponse = await fetch('/api/grades');
      const gradesData = await gradesResponse.json();
      setGrades(gradesData);

      // 获取班级数据
      const classesResponse = await fetch('/api/classes');
      const classesData = await classesResponse.json();
      setClasses(classesData);
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('刷新数据失败');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理导入
  const handleImport = () => {
    // 处理导入逻辑
    toast.info('导入功能开发中...');
  };
  
  // 处理导出
  const handleExport = () => {
    // 处理导出逻辑
    toast.info('导出功能开发中...');
  };
  
  // 处理添加
  const handleAdd = () => {
    if (activeTab === 'teachers') {
      // 处理添加教师逻辑
      setIsAddTeacherDialogOpen(true);
    } else if (activeTab === 'students') {
      // 处理添加学生逻辑
      setIsAddStudentDialogOpen(true);
    }
  };
  
  // 处理添加年级
  const handleAddGrade = () => {
    setIsAddGradeDialogOpen(true);
  };
  
  // 处理添加班级
  const handleAddClasses = () => {
    setIsAddClassesDialogOpen(true);
  };
  
  // 处理分配教师到班级
  const handleAssignTeachers = (classData: Class) => {
    setSelectedClass(classData);
    setIsAssignTeachersDialogOpen(true);
  };
  
  // 处理分配学生到班级
  const handleAssignStudents = (classData: Class) => {
    setSelectedClass(classData);
    setIsAssignStudentsDialogOpen(true);
  };
  
  // 获取班级对应的年级名称
  const getGradeName = (gradeId: string) => {
    const grade = grades.find(g => g.id === gradeId);
    return grade ? grade.name : '';
  };
  
  // 获取班级的学生人数
  const getClassStudentCount = (classId: string) => {
    return students.filter(s => s.class === classId).length;
  };
  
  // 处理编辑教师
  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditDialogOpen(true);
  };
  
  // 处理编辑学生
  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };
  
  // 处理删除教师
  const handleDeleteTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };
  
  // 处理删除学生
  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };
  
  // 确认删除教师
  const confirmDeleteTeacher = async () => {
    if (!selectedTeacher) return;
    
    try {
      const response = await fetch(`/api/teachers/${selectedTeacher.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('删除教师失败');
      }
      
      toast.success('教师删除成功');
      setIsDeleteDialogOpen(false);
      refreshData();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error('删除教师失败');
    }
  };
  
  // 确认删除学生
  const confirmDeleteStudent = async () => {
    if (!selectedStudent) return;
    
    try {
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('删除学生失败');
      }
      
      toast.success('学生删除成功');
      setIsDeleteDialogOpen(false);
      refreshData();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('删除学生失败');
    }
  };
  
  // 过滤教师
  const filteredTeachers = searchQuery
    ? teachers.filter(
        teacher =>
          teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : teachers;

  // 过滤学生
  const filteredStudents = searchQuery
    ? students.filter(
        student =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.guardian.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : students;

  // 过滤班级
  const filteredClasses = searchQuery
    ? classes.filter(
        cls =>
          cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getGradeName(cls.gradeId).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : classes;
  
  return (
    <div className="h-full flex flex-col">
      {/* 页面标题区域 */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center">
          <div className="bg-white p-4 shadow-sm rounded-2xl mr-6 border border-gray-100/80">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">师生信息管理</h1>
            <p className="text-gray-500 mt-1.5 text-sm font-normal">管理、查询和维护教师与学生信息</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            className="h-10 rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
            onClick={handleExport}
          >
            <FileDown className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Button 
            variant="outline" 
            className="h-10 rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
            onClick={handleImport}
          >
            <FileUp className="h-4 w-4 mr-2" />
            导入数据
          </Button>
        </div>
      </div>
      
      {/* 主要内容区域 */}
      <div className="flex-1">
        <SectionContainer padding="standard" className="mb-0 h-full">
          <Tabs defaultValue="teachers" className="space-y-4 w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-gray-50/70 p-1 rounded-lg">
              <TabsTrigger value="teachers" className="flex items-center gap-2 data-[state=active]:shadow-sm data-[state=active]:font-medium">
                <GraduationCap className="h-4 w-4" />
                教师管理
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2 data-[state=active]:shadow-sm data-[state=active]:font-medium">
                <Users className="h-4 w-4" />
                学生管理
              </TabsTrigger>
              <TabsTrigger value="classes" className="flex items-center gap-2 data-[state=active]:shadow-sm data-[state=active]:font-medium">
                <School className="h-4 w-4" />
                班级管理
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="teachers" className="space-y-4 mt-4">
              <div className="flex justify-between">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="搜索教师姓名或科目..."
                    className="pl-10 rounded-xl border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium"
                  onClick={handleAdd}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加教师
                </Button>
              </div>
              
              <CardContainer elevated className="border-gray-100/80 overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-5">
                  <CardTitle className="text-base font-medium text-gray-900">教师列表</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  {isLoading ? (
                    <TableSkeleton rowCount={5} columnCount={8} />
                  ) : (
                    <Table>
                      <TableHeader className="bg-gray-50/30">
                        <TableRow>
                          <TableHead className="w-[80px]">姓名</TableHead>
                          <TableHead className="w-[80px]">性别</TableHead>
                          <TableHead className="w-[80px]">年龄</TableHead>
                          <TableHead className="w-[120px]">任教科目</TableHead>
                          <TableHead className="w-[120px]">职称</TableHead>
                          <TableHead className="w-[140px]">联系电话</TableHead>
                          <TableHead className="w-[200px]">邮箱</TableHead>
                          <TableHead className="w-[100px]">状态</TableHead>
                          <TableHead className="w-[80px] text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTeachers.map((teacher) => (
                          <TableRow key={teacher.id}>
                            <TableCell className="font-medium">{teacher.name}</TableCell>
                            <TableCell>{teacher.gender}</TableCell>
                            <TableCell>{teacher.age}</TableCell>
                            <TableCell>{teacher.subject}</TableCell>
                            <TableCell>{teacher.title}</TableCell>
                            <TableCell>{teacher.phone}</TableCell>
                            <TableCell>{teacher.email}</TableCell>
                            <TableCell>{teacher.status}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl">
                                  <DropdownMenuItem
                                    onClick={() => handleEditTeacher(teacher)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    编辑
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600 cursor-pointer focus:text-red-600"
                                    onClick={() => handleDeleteTeacher(teacher)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    删除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </CardContainer>
            </TabsContent>
            
            <TabsContent value="students" className="space-y-4 mt-4">
              <div className="flex justify-between">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="搜索学生姓名或班级..."
                    className="pl-10 rounded-xl border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium"
                  onClick={handleAdd}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加学生
                </Button>
              </div>
              
              <CardContainer elevated className="border-gray-100/80 overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-5">
                  <CardTitle className="text-base font-medium text-gray-900">学生列表</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  {isLoading ? (
                    <TableSkeleton rowCount={5} columnCount={9} />
                  ) : (
                    <Table>
                      <TableHeader className="bg-gray-50/30">
                        <TableRow>
                          <TableHead className="w-[80px]">姓名</TableHead>
                          <TableHead className="w-[80px]">性别</TableHead>
                          <TableHead className="w-[80px]">年龄</TableHead>
                          <TableHead className="w-[100px]">班级</TableHead>
                          <TableHead className="w-[100px]">年级</TableHead>
                          <TableHead className="w-[120px]">学号</TableHead>
                          <TableHead className="w-[140px]">联系电话</TableHead>
                          <TableHead className="w-[120px]">监护人</TableHead>
                          <TableHead className="w-[100px]">状态</TableHead>
                          <TableHead className="w-[80px] text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.gender}</TableCell>
                            <TableCell>{student.age}</TableCell>
                            <TableCell>{student.class}</TableCell>
                            <TableCell>{student.grade}</TableCell>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell>{student.phone}</TableCell>
                            <TableCell>{student.guardian}</TableCell>
                            <TableCell>{student.status}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl">
                                  <DropdownMenuItem
                                    onClick={() => handleEditStudent(student)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    编辑
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600 cursor-pointer focus:text-red-600"
                                    onClick={() => handleDeleteStudent(student)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    删除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </CardContainer>
            </TabsContent>

            {/* 班级管理 */}
            <TabsContent value="classes" className="space-y-4 mt-4">
              <div className="flex justify-between">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="搜索班级或年级..."
                    className="pl-10 rounded-xl border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="h-10 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={handleAddGrade}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    添加年级
                  </Button>
                  <Button 
                    className="h-10 px-4 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium"
                    onClick={handleAddClasses}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加班级
                  </Button>
                </div>
              </div>
              
              <CardContainer elevated className="border-gray-100/80 overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-5">
                  <CardTitle className="text-base font-medium text-gray-900">班级列表</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  {isLoading ? (
                    <TableSkeleton rowCount={5} columnCount={6} />
                  ) : (
                    <Table>
                      <TableHeader className="bg-gray-50/30">
                        <TableRow>
                          <TableHead className="w-[150px]">班级名称</TableHead>
                          <TableHead className="w-[120px]">所属年级</TableHead>
                          <TableHead className="w-[120px]">学年</TableHead>
                          <TableHead className="w-[100px]">学生人数</TableHead>
                          <TableHead className="w-[100px]">教室</TableHead>
                          <TableHead className="w-[150px] text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClasses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                              {searchQuery ? '未找到匹配的班级' : '暂无班级数据'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredClasses.map((classData) => {
                            const grade = grades.find(g => g.id === classData.gradeId);
                            const studentCount = getClassStudentCount(classData.id);
                            
                            return (
                              <TableRow key={classData.id}>
                                <TableCell className="font-medium">{classData.name}</TableCell>
                                <TableCell>{grade?.name || '-'}</TableCell>
                                <TableCell>{grade?.year || '-'}</TableCell>
                                <TableCell>{studentCount}</TableCell>
                                <TableCell>{classData.roomNumber || '-'}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="h-8 px-2"
                                      onClick={() => handleAssignTeachers(classData)}
                                    >
                                      <UserCog className="h-3.5 w-3.5 mr-1" />
                                      教师
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="h-8 px-2"
                                      onClick={() => handleAssignStudents(classData)}
                                    >
                                      <BookOpen className="h-3.5 w-3.5 mr-1" />
                                      学生
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </CardContainer>
            </TabsContent>
          </Tabs>
        </SectionContainer>
      </div>
      
      {/* 对话框组件 - 编辑与删除的实际实现 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {activeTab === 'teachers' && selectedTeacher && (
              <p>确定要删除教师 <span className="font-medium">{selectedTeacher.name}</span> 吗？此操作不可撤销。</p>
            )}
            {activeTab === 'students' && selectedStudent && (
              <p>确定要删除学生 <span className="font-medium">{selectedStudent.name}</span> 吗？此操作不可撤销。</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" variant="destructive" onClick={activeTab === 'teachers' ? confirmDeleteTeacher : confirmDeleteStudent}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 年级、班级、教师、学生管理对话框 */}
      <AddGradeDialog 
        open={isAddGradeDialogOpen} 
        onOpenChange={setIsAddGradeDialogOpen} 
        onAddSuccess={refreshData}
      />

      <AddClassesDialog 
        open={isAddClassesDialogOpen} 
        onOpenChange={setIsAddClassesDialogOpen} 
        onAddSuccess={refreshData}
      />

      <AddTeacherDialog 
        open={isAddTeacherDialogOpen} 
        onOpenChange={setIsAddTeacherDialogOpen} 
        onAddSuccess={refreshData}
      />

      <AddStudentDialog 
        open={isAddStudentDialogOpen} 
        onOpenChange={setIsAddStudentDialogOpen} 
        onAddSuccess={refreshData}
      />

      <AssignTeachersDialog 
        open={isAssignTeachersDialogOpen} 
        onOpenChange={setIsAssignTeachersDialogOpen} 
        classId={selectedClass?.id || ''}
        className={selectedClass?.name}
        onAssignSuccess={refreshData}
      />

      <AssignStudentsDialog 
        open={isAssignStudentsDialogOpen} 
        onOpenChange={setIsAssignStudentsDialogOpen} 
        classId={selectedClass?.id || ''}
        className={selectedClass?.name}
        gradeId={selectedClass?.gradeId}
        onAssignSuccess={refreshData}
      />
    </div>
  );
} 