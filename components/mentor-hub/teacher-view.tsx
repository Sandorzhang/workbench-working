"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { 
  BookOpen,
  Calendar,
  SearchIcon,
  Star,
  History,
  RefreshCw,
  Search,
  User,
  BarChart3,
  ClipboardEdit,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Skeleton } from "../ui/skeleton";
import { Progress } from "../ui/progress";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { EnrichedStudent } from "@/lib/types";
import { StudentCompetency } from "./student-competency";
import { StudentAcademic } from "./student-academic";
import { StudentTracking } from "./student-tracking";
import { StudentEvaluation } from "./student-evaluation";
import { cn } from "@/lib/utils";

// 学生列表组件
function StudentList({ 
  students, 
  onSelectStudent,
  selectedStudentId,
  onRefresh
}: { 
  students: EnrichedStudent[], 
  onSelectStudent: (student: EnrichedStudent) => void,
  selectedStudentId: string | null,
  onRefresh: () => void
}) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // 过滤学生列表
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 处理刷新
  const handleRefresh = () => {
    toast.success("正在刷新学生数据...");
    onRefresh();
  };

  if (students.length === 0) {
    return (
      <div className={cn(
        "rounded-xl overflow-hidden h-full w-full flex flex-col",
        "bg-gradient-to-b from-white/80 to-white/95 dark:from-gray-900/80 dark:to-gray-900/95",
        "border border-gray-100/60 dark:border-gray-800/40",
        "shadow-md backdrop-blur-sm backdrop-filter"
      )}>
        <div className={cn(
          "px-3 py-2 border-b",
          "border-gray-100/80 dark:border-gray-800/60",
          "bg-gradient-to-b from-gray-50/90 to-gray-100/30 dark:from-gray-800/50 dark:to-gray-900/30"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200">学生列表</h2>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-7 px-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              title="刷新学生数据"
              disabled={students.length === 0}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="p-3 text-center py-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gray-50/80 dark:bg-gray-800/80 flex items-center justify-center mb-3 shadow-sm">
            <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">暂无分配学生</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1.5">请联系管理员分配学生</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl overflow-hidden h-full w-full flex flex-col",
      "bg-gradient-to-b from-white/80 to-white/95 dark:from-gray-900/80 dark:to-gray-900/95",
      "border border-gray-100/60 dark:border-gray-800/40",
      "shadow-md backdrop-blur-sm backdrop-filter"
    )}>
      <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-800/60">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium text-gray-800 dark:text-gray-200 flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            学生列表
          </h2>
          <Button 
            variant="outline"
            size="sm" 
            onClick={handleRefresh}
            className="h-8 px-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border-gray-200/80 dark:border-gray-700/60"
            title="刷新学生数据"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            刷新
          </Button>
        </div>
        
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            type="text"
            placeholder="搜索姓名或学号..." 
            className="h-9 text-sm pl-9 pr-8 rounded-md border-gray-200/80 dark:border-gray-700/60 w-full bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              onClick={() => setSearchQuery("")}
              aria-label="清除搜索"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 student-list-scroll">
        {filteredStudents.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50/80 dark:bg-gray-800/80 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">未找到匹配的学生</p>
            <button 
              className="text-sm text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
              onClick={() => setSearchQuery("")}
            >
              清除搜索
            </button>
          </div>
        ) : (
          <div className="p-3">
            {filteredStudents.map((student) => (
              <div 
                key={student.id} 
                className={cn(
                  "px-3 py-2.5 rounded-md mb-2 flex items-center cursor-pointer transition-all duration-200 group",
                  selectedStudentId === student.id 
                    ? 'bg-primary/10 border-l-4 border-l-primary shadow-sm' 
                    : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/50 border-l-4 border-l-transparent hover:border-l-primary/50',
                  "border border-transparent",
                  selectedStudentId === student.id 
                    ? 'border-primary/20' 
                    : 'hover:border-gray-200/50 dark:hover:border-gray-700/30'
                )}
                onClick={() => onSelectStudent(student)}
              >
                <Avatar className={cn(
                  "h-10 w-10 mr-3 transition-all",
                  "ring-1 ring-gray-100/80 dark:ring-gray-800/80",
                  "group-hover:ring-2 group-hover:ring-primary/20",
                  selectedStudentId === student.id 
                    ? "ring-2 ring-primary/30 shadow-sm" 
                    : ""
                )}>
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback className="text-sm bg-primary/10 dark:bg-primary/20 text-primary">{student.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm truncate transition-colors",
                    selectedStudentId === student.id 
                      ? "text-primary" 
                      : "text-gray-700 dark:text-gray-300 group-hover:text-primary"
                  )}>
                    {student.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    学号: <span className="font-medium text-gray-600 dark:text-gray-300">{student.studentId}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .student-list-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .student-list-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .student-list-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(203, 213, 225, 0.7);
          border-radius: 4px;
        }
        
        .student-list-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(148, 163, 184, 0.8);
        }

        .border-l-4 {
          border-left-width: 4px;
        }
      `}</style>
    </div>
  );
}

// 学生详情组件
function StudentDetail({ student }: { student: EnrichedStudent }) {
  const [activeTab, setActiveTab] = useState("competency");

  // 监听记录添加事件，在添加记录后保持在"学生追踪"tab
  useEffect(() => {
    const handleRecordAdded = () => {
      console.log("StudentDetail: 监听到记录添加事件，保持在tracking tab");
      setActiveTab("tracking");
    };

    window.addEventListener('record-added', handleRecordAdded);
    window.addEventListener('refresh-student-records', handleRecordAdded);
    
    return () => {
      window.removeEventListener('record-added', handleRecordAdded);
      window.removeEventListener('refresh-student-records', handleRecordAdded);
    };
  }, []);

  return (
    <div className="space-y-5">
      {/* 学生基本信息 */}
      <div className={cn(
        "p-5 rounded-xl relative overflow-hidden",
        "bg-gradient-to-r from-blue-50/30 via-white/80 to-white/90 dark:from-blue-950/20 dark:via-gray-900/80 dark:to-gray-900/90",
        "border border-gray-100/60 dark:border-gray-800/40",
        "shadow-md backdrop-blur-sm backdrop-filter"
      )}>
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -mr-12 -mt-12 blur-3xl opacity-60 dark:opacity-40"></div>
        <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-[1px] backdrop-filter z-0"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 relative z-10">
          <Avatar className="h-16 w-16 border-2 border-blue-100 dark:border-blue-900/50 shadow-md">
            <AvatarImage src={student.avatar} alt={student.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
              {student.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2 text-center md:text-left">
            <div>
              <h2 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2 text-gray-900 dark:text-gray-100">
                {student.name}
                <Badge variant="outline" className="ml-2 text-xs font-normal bg-white/80 dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/60">
                  {student.grade} {student.class}
                </Badge>
              </h2>
              <p className="text-gray-500 dark:text-gray-400">学号: {student.studentId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab切换导航 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={cn(
          "grid grid-cols-4 mb-4 p-1",
          "bg-gray-100/50 dark:bg-gray-800/30",
          "backdrop-blur-sm backdrop-filter",
          "border border-gray-100/60 dark:border-gray-800/40 rounded-lg"
        )}>
          <TabsTrigger value="competency" className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800/80 data-[state=active]:shadow-sm">
            <Star className="h-4 w-4" />
            学生轮盘
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800/80 data-[state=active]:shadow-sm">
            <BookOpen className="h-4 w-4" />
            学生学业
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800/80 data-[state=active]:shadow-sm">
            <History className="h-4 w-4" />
            学生追踪
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800/80 data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4" />
            学生评价
          </TabsTrigger>
        </TabsList>
        
        {/* 学生轮盘(素养概览和素养详情) */}
        <TabsContent value="competency" className="mt-0">
          <StudentCompetency indicators={student.indicators} />
        </TabsContent>
        
        {/* 学生学业 */}
        <TabsContent value="academic" className="mt-0">
          <StudentAcademic records={student.academicRecords || []} />
        </TabsContent>
        
        {/* 学生追踪 */}
        <TabsContent value="tracking" className="mt-0">
          <StudentTracking studentId={student.id} />
        </TabsContent>
        
        {/* 学生评价 */}
        <TabsContent value="evaluation" className="mt-0">
          <StudentEvaluation studentId={student.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 骨架屏组件
function TeacherViewSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <Skeleton className="h-[calc(100vh-10rem)] rounded-xl" />
        </div>
        <div className="col-span-1 lg:col-span-10">
          <Skeleton className="h-32 rounded-xl mb-5" />
          <Skeleton className="h-[calc(100vh-16rem)] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// 教师视图主组件
export default function TeacherView() {
  const [students, setStudents] = useState<EnrichedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<EnrichedStudent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 获取教师管理的学生列表
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/teacher/mentored-students');
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const data = await response.json();
      
      // 转换数据格式以符合EnrichedStudent类型
      const enrichedStudents: EnrichedStudent[] = data.map((student: any) => ({
        id: student.id,
        name: student.name,
        avatar: student.avatar,
        studentId: student.studentId,
        grade: student.grade,
        class: student.class,
        gender: student.gender,
        indicators: [
          {
            id: `academic-${student.id}`,
            name: '学术素养',
            value: student.competencyStatus.academic,
            maxValue: 100,
            description: '学术和学科知识掌握程度'
          },
          {
            id: `social-${student.id}`,
            name: '社交素养',
            value: student.competencyStatus.social,
            maxValue: 100,
            description: '人际交往和团队协作能力'
          },
          {
            id: `personal-${student.id}`,
            name: '个人素养',
            value: student.competencyStatus.personal,
            maxValue: 100,
            description: '自我管理和个人发展能力'
          },
          {
            id: `engineering-${student.id}`,
            name: '工程素养',
            value: student.competencyStatus.engineering,
            maxValue: 100,
            description: '实践能力和解决实际问题的能力'
          }
        ]
      }));
      
      setStudents(enrichedStudents);
      
      // 如果有学生数据，默认选择第一个学生
      if (enrichedStudents.length > 0 && !selectedStudent) {
        fetchStudentDetail(enrichedStudents[0].id);
      }
    } catch (error) {
      console.error('获取学生列表失败:', error);
      toast.error('获取学生列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取学生详细信息
  const fetchStudentDetail = async (studentId: string) => {
    try {
      const response = await fetch(`/api/teacher/student/${studentId}`);
      
      if (!response.ok) {
        throw new Error('获取学生详细信息失败');
      }
      
      const data = await response.json();
      
      // 将API返回的数据转换成组件需要的格式
      const enrichedStudent: EnrichedStudent = {
        id: data.id,
        name: data.name,
        avatar: data.avatar,
        studentId: data.studentId,
        grade: data.grade,
        class: data.class,
        gender: data.gender,
        birthday: data.birthday,
        contact: data.contact,
        address: data.address,
        interests: data.interests,
        strengths: data.strengths,
        areasToImprove: data.areasToImprove,
        notes: data.notes,
        academicRecords: data.academicRecords,
        indicators: [
          {
            id: 'academic',
            name: '学术素养',
            value: data.competencyDetail.academic.progress,
            maxValue: 100,
            description: data.competencyDetail.academic.description
          },
          {
            id: 'social',
            name: '社交素养',
            value: data.competencyDetail.social.progress,
            maxValue: 100,
            description: data.competencyDetail.social.description
          },
          {
            id: 'personal',
            name: '个人素养',
            value: data.competencyDetail.personal.progress,
            maxValue: 100,
            description: data.competencyDetail.personal.description
          },
          {
            id: 'engineering',
            name: '工程素养',
            value: data.competencyDetail.engineering.progress,
            maxValue: 100,
            description: data.competencyDetail.engineering.description
          }
        ]
      };
      
      setSelectedStudent(enrichedStudent);
    } catch (error) {
      console.error('获取学生详细信息失败:', error);
      toast.error('获取学生详细信息失败');
    }
  };

  // 处理学生选择
  const handleSelectStudent = (student: EnrichedStudent) => {
    fetchStudentDetail(student.id);
  };

  // 组件挂载时获取学生列表
  useEffect(() => {
    fetchStudents();
  }, []);

  // 添加全局事件监听，响应hero栏中的record-added事件
  useEffect(() => {
    const handleRecordAdded = (event: Event) => {
      console.log("记录添加事件被触发", event);
      // 检查事件详情
      const customEvent = event as CustomEvent;
      console.log("事件详情:", customEvent.detail);
      
      // 无论选中了哪个学生，都应该刷新学生列表
      fetchStudents();
      
      if (selectedStudent) {
        // 刷新学生详情，包括学生记录
        console.log("刷新学生详情:", selectedStudent.id);
        fetchStudentDetail(selectedStudent.id);
        
        // 这里我们添加一个直接的DOM事件来触发学生记录组件的刷新
        const refreshEvent = new CustomEvent('refresh-student-records', { 
          detail: { studentId: selectedStudent.id } 
        });
        console.log("触发refresh-student-records事件");
        window.dispatchEvent(refreshEvent);
        
        toast.success("学生记录已更新");
      } else {
        // 如果没有选中学生，但学生列表有数据，选择第一个学生
        setTimeout(() => {
          if (students.length > 0 && !selectedStudent) {
            console.log("自动选择第一个学生:", students[0].id);
            fetchStudentDetail(students[0].id);
          }
        }, 1000);
      }
    };

    window.addEventListener('record-added', handleRecordAdded);
    
    return () => {
      window.removeEventListener('record-added', handleRecordAdded);
    };
  }, [selectedStudent, students]);

  // 处理刷新
  const handleRefresh = () => {
    fetchStudents();
    if (selectedStudent) {
      fetchStudentDetail(selectedStudent.id);
    }
    toast.success('数据已刷新');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border border-gray-100/60 dark:border-gray-800/40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600 dark:text-gray-300">正在加载学生数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="col-span-1 lg:col-span-2">
        <StudentList 
          students={students} 
          onSelectStudent={handleSelectStudent}
          selectedStudentId={selectedStudent?.id || null}
          onRefresh={handleRefresh}
        />
      </div>
      
      <div className="col-span-1 lg:col-span-10">
        {selectedStudent ? (
          <StudentDetail student={selectedStudent} />
        ) : (
          <div className={cn(
            "flex h-64 items-center justify-center rounded-xl",
            "bg-gradient-to-b from-white/80 to-white/95 dark:from-gray-900/80 dark:to-gray-900/95",
            "border border-gray-100/60 dark:border-gray-800/40",
            "shadow-md backdrop-blur-sm backdrop-filter"
          )}>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-50/80 dark:bg-gray-800/80 mb-4 shadow-sm">
                <User className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1.5">请选择一名学生</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                从左侧列表选择一名学生查看详情
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 