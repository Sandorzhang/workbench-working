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
import { Search, Edit, Trash2, UserPlus, FileDown, FileUp, MoreHorizontal, Plus } from "lucide-react";
import { 
  TitleSkeleton, 
  TableSkeleton, 
  TabsSkeleton 
} from "@/components/ui/skeleton-loader";

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
  const [activeTab, setActiveTab] = useState("teachers");
  const [searchQuery, setSearchQuery] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 对话框状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  useEffect(() => {
    // 模拟从API获取数据
    const fetchData = async () => {
      try {
        // 在实际应用中，这里会从API获取数据
        const teachersResponse = await fetch('/api/teachers');
        const studentsResponse = await fetch('/api/students');
        
        if (teachersResponse.ok && studentsResponse.ok) {
          const teachersData = await teachersResponse.json();
          const studentsData = await studentsResponse.json();
          
          setTeachers(teachersData);
          setStudents(studentsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        // 延迟设置加载状态以展示骨架屏效果
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };
    
    fetchData();
  }, []);
  
  // 搜索功能
  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // 处理导出
  const handleExport = () => {
    console.log("导出", activeTab === "teachers" ? "教师" : "学生", "数据");
  };
  
  // 处理导入
  const handleImport = () => {
    console.log("导入", activeTab === "teachers" ? "教师" : "学生", "数据");
  };
  
  // 处理添加
  const handleAdd = () => {
    setIsAddDialogOpen(true);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">师生信息管理</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <FileUp className="h-4 w-4 mr-2" />
            导入数据
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="animate-fadeIn">
          <TitleSkeleton className="mb-4" />
          <TabsSkeleton tabCount={2} className="mb-4" />
          <div className="flex justify-between items-center mb-4">
            <div className="w-1/3"><div className="h-10 bg-gray-200 rounded animate-pulse"></div></div>
            <div className="w-24"><div className="h-10 bg-gray-200 rounded animate-pulse"></div></div>
          </div>
          <TableSkeleton rowCount={6} columnCount={7} />
        </div>
      ) : (
        <Tabs defaultValue="teachers" className="space-y-4 w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="teachers">教师管理</TabsTrigger>
            <TabsTrigger value="students">学生管理</TabsTrigger>
          </TabsList>
          
          <TabsContent value="teachers" className="space-y-4">
            <div className="flex justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索教师姓名或科目..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                添加教师
              </Button>
            </div>
            
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">教师列表</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>姓名</TableHead>
                      <TableHead>性别</TableHead>
                      <TableHead>年龄</TableHead>
                      <TableHead>科目</TableHead>
                      <TableHead>职称</TableHead>
                      <TableHead>联系电话</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>{teacher.name}</TableCell>
                        <TableCell>{teacher.gender}</TableCell>
                        <TableCell>{teacher.age}</TableCell>
                        <TableCell>{teacher.subject}</TableCell>
                        <TableCell>{teacher.title}</TableCell>
                        <TableCell>{teacher.phone}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              teacher.status === "在职"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {teacher.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditTeacher(teacher)}
                              >
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteTeacher(teacher)}
                              >
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="students" className="space-y-4">
            <div className="flex justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索学生姓名或班级..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                添加学生
              </Button>
            </div>
            
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">学生列表</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>姓名</TableHead>
                      <TableHead>性别</TableHead>
                      <TableHead>年龄</TableHead>
                      <TableHead>班级</TableHead>
                      <TableHead>年级</TableHead>
                      <TableHead>学号</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.gender}</TableCell>
                        <TableCell>{student.age}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                        <TableCell>{student.studentId}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.status === "在校"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {student.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditStudent(student)}
                              >
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteStudent(student)}
                              >
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      {/* 对话框组件 - 实际实现中需要添加 */}
    </div>
  );
} 