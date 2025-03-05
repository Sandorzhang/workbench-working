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
  BookOpen,
  UserCog,
  ExternalLink 
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
  AddClassesDialog,
  AddTeacherDialog,
  AddStudentDialog,
  AssignTeachersDialog,
  AssignStudentsDialog,
  AssignStudentsToGradeDialog
} from "@/components/education";
import { HeroSection } from '@/components/ui/hero-section';
import { useRouter } from "next/navigation";

// 导入新开发的管理组件
import TeacherManagement from "@/components/education/teacher/teacher-management";
import StudentManagement from "@/components/education/student/student-management";
import GradeManagement from "@/components/education/grade/grade-management";
import ClassManagement from "@/components/education/class/class-management";

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
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddClassesDialogOpen, setIsAddClassesDialogOpen] = useState(false);
  const [isAddTeacherDialogOpen, setIsAddTeacherDialogOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isAssignTeachersDialogOpen, setIsAssignTeachersDialogOpen] = useState(false);
  const [isAssignStudentsDialogOpen, setIsAssignStudentsDialogOpen] = useState(false);
  const [isAssignStudentsToGradeDialogOpen, setIsAssignStudentsToGradeDialogOpen] = useState(false);
  
  const router = useRouter();
  
  // 为了模拟加载效果，设置一个短暂的延迟
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageContainer>
      <HeroSection
        title="师生信息管理"
        description="管理学校中的教师、学生、年级与班级信息"
        icon={Users}
      />

      {/* 标签页部分 */}
      <SectionContainer>
        {isLoading ? (
          <TabsSkeleton />
        ) : (
          <Tabs
            defaultValue="teachers"
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="teachers">教师管理</TabsTrigger>
              <TabsTrigger value="students">学生管理</TabsTrigger>
              <TabsTrigger value="grades">年级管理</TabsTrigger>
              <TabsTrigger value="classes">班级管理</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teachers" className="mt-6">
              <TeacherManagement />
            </TabsContent>
            
            <TabsContent value="students" className="mt-6">
              <StudentManagement />
            </TabsContent>
            
            <TabsContent value="grades" className="mt-6">
              <GradeManagement />
            </TabsContent>
            
            <TabsContent value="classes" className="mt-6">
              <ClassManagement />
            </TabsContent>
          </Tabs>
        )}
      </SectionContainer>
    </PageContainer>
  );
} 