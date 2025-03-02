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
import { Search, Edit, Trash2, UserPlus, FileDown, FileUp, MoreHorizontal, Plus, GraduationCap, Users } from "lucide-react";
import { 
  TitleSkeleton, 
  TableSkeleton, 
  TabsSkeleton 
} from "@/components/ui/skeleton-loader";
import { PageContainer } from "@/components/ui/page-container";
import { SectionContainer } from "@/components/ui/section-container";
import { CardContainer } from "@/components/ui/card-container";
import { toast } from "sonner";

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

export default function UsersPage() {
  // 状态控制
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teachers');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
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
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('无法加载师生数据');
      } finally {
        // 模拟加载延迟
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };
    
    fetchData();
  }, []);
  
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
      toast.info('添加教师功能开发中...');
    } else {
      // 处理添加学生逻辑
      toast.info('添加学生功能开发中...');
    }
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
                        {teachers.map((teacher) => (
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
                        {students.map((student) => (
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
          </Tabs>
        </SectionContainer>
      </div>
      
      {/* 对话框组件 - 编辑与删除的实际实现 */}
    </div>
  );
} 