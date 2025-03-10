"use client";

import React, { useEffect, useState } from "react";

import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  BookOpen,
  SearchIcon,
  Star,
  History,
  RefreshCw,
  Search,
  User,
  BarChart3,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Skeleton } from "../ui/skeleton";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { EnrichedStudent } from "@/lib/types";
import { StudentCompetency } from "./student-competency";
import { StudentAcademic } from "./student-academic";
import { StudentTracking } from "./student-tracking";
import { StudentEvaluation } from "./student-evaluation";

// 学生列表组件
function StudentList({
  students,
  onSelectStudent,
  selectedStudentId,
  onRefresh,
}: {
  students: EnrichedStudent[];
  onSelectStudent: (student: EnrichedStudent) => void;
  selectedStudentId: string | null;
  onRefresh: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // 过滤学生列表
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 处理刷新
  const handleRefresh = () => {
    toast.success("正在刷新学生数据...");
    onRefresh();
  };

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full w-full flex flex-col">
        <div className="px-3 py-2 border-b border-gray-100 bg-slate-50/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-medium text-gray-800">学生列表</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-7 px-1.5 rounded-md"
              title="刷新学生数据"
              disabled={students.length === 0}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="p-3 text-center py-10 bg-white flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2">
            <User className="w-5 h-5 text-muted-foreground opacity-50" />
          </div>
          <p className="text-muted-foreground text-sm">暂无分配学生</p>
          <p className="text-muted-foreground text-xs mt-1">
            请联系管理员分配学生
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full w-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-medium text-gray-800 flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            学生列表
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-8 px-2"
            title="刷新学生数据"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            刷新
          </Button>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="搜索姓名或学号..."
            className="h-9 text-sm pl-9 pr-8 rounded-md border-gray-200 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-gray-700 transition-colors"
              onClick={() => setSearchQuery("")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 student-list-scroll">
        {filteredStudents.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <SearchIcon className="h-5 w-5 text-muted-foreground opacity-40" />
            </div>
            <p className="text-sm text-muted-foreground">未找到匹配的学生</p>
            <button
              className="mt-2 text-sm text-primary font-medium hover:underline"
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
                className={`px-3 py-2.5 rounded-md mb-1 flex items-center cursor-pointer transition-all duration-200 group ${
                  selectedStudentId === student.id
                    ? "bg-primary/10 border-l-4 border-l-primary"
                    : "hover:bg-slate-50 border-l-4 border-l-transparent hover:border-l-primary/50"
                }`}
                onClick={() => onSelectStudent(student)}
              >
                <Avatar className="h-10 w-10 mr-3 ring-1 ring-gray-100 transition-shadow group-hover:ring-2 group-hover:ring-primary/20">
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback className="text-sm bg-slate-100 text-slate-500">
                    {student.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-700 group-hover:text-primary transition-colors truncate">
                    {student.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    学号:{" "}
                    <span className="font-medium text-slate-600">
                      {student.id}
                    </span>
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

    window.addEventListener("record-added", handleRecordAdded);
    window.addEventListener("refresh-student-records", handleRecordAdded);

    return () => {
      window.removeEventListener("record-added", handleRecordAdded);
      window.removeEventListener("refresh-student-records", handleRecordAdded);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* 学生基本信息 */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-blue-100">
            <AvatarImage src={student.avatar} alt={student.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {student.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2 text-center md:text-left">
            <div>
              <h2 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                {student.name}
                <Badge variant="outline" className="ml-2 text-xs font-normal">
                  {student.gradeId} {student.classId}
                </Badge>
              </h2>
              <p className="text-muted-foreground">学号: {student.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab切换导航 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-3">
          <TabsTrigger value="competency" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            学生轮盘
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            学生学业
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            学生追踪
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            学生评价
          </TabsTrigger>
        </TabsList>

        {/* 学生轮盘(素养概览和素养详情) */}
        <TabsContent value="competency" className="mt-0">
          <StudentCompetency />
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
    <div className="space-y-4 animate-pulse">
      <div className="flex h-[calc(100vh-12rem)]">
        <div className="w-1/5 pr-2">
          <Skeleton className="h-full rounded-lg" />
        </div>
        <div className="w-4/5">
          <Skeleton className="h-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// 教师视图主组件
export default function TeacherView() {
  const [students, setStudents] = useState<EnrichedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] =
    useState<EnrichedStudent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 获取教师管理的学生列表
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/teacher/mentored-students");

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();

      // 转换数据格式以符合EnrichedStudent类型
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            name: "学术素养",
            value: student.competencyStatus.academic,
            maxValue: 100,
            description: "学术和学科知识掌握程度",
          },
          {
            id: `social-${student.id}`,
            name: "社交素养",
            value: student.competencyStatus.social,
            maxValue: 100,
            description: "人际交往和团队协作能力",
          },
          {
            id: `personal-${student.id}`,
            name: "个人素养",
            value: student.competencyStatus.personal,
            maxValue: 100,
            description: "自我管理和个人发展能力",
          },
          {
            id: `engineering-${student.id}`,
            name: "工程素养",
            value: student.competencyStatus.engineering,
            maxValue: 100,
            description: "实践能力和解决实际问题的能力",
          },
        ],
      }));

      setStudents(enrichedStudents);

      // 如果有学生数据，默认选择第一个学生
      if (enrichedStudents.length > 0 && !selectedStudent) {
        fetchStudentDetail(enrichedStudents[0].id);
      }
    } catch (error) {
      console.error("获取学生列表失败:", error);
      toast.error("获取学生列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 获取学生详细信息
  const fetchStudentDetail = async (studentId: string) => {
    try {
      const response = await fetch(`/api/teacher/student/${studentId}`);

      if (!response.ok) {
        throw new Error("获取学生详细信息失败");
      }

      const data = await response.json();

      // TODO: 字段补全
      // 将API返回的数据转换成组件需要的格式
      const enrichedStudent: EnrichedStudent = {
        id: data.id,
        name: data.name,
        avatar: data.avatar,
        gradeId: data.gradeId,
        classId: data.classId,
        gender: data.gender,
        birthDate: data.birthDate,
        // contact: data.contact,
        address: data.address,
        // interests: data.interests,
        // strengths: data.strengths,
        // areasToImprove: data.areasToImprove,
        // notes: data.notes,
        academicRecords: data.academicRecords,
        enrollmentYear: "",
        studentNumber: "",
        status: "",
        indicators: [
          {
            id: "academic",
            name: "学术素养",
            value: data.competencyDetail.academic.progress,
            maxValue: 100,
            description: data.competencyDetail.academic.description,
          },
          {
            id: "social",
            name: "社交素养",
            value: data.competencyDetail.social.progress,
            maxValue: 100,
            description: data.competencyDetail.social.description,
          },
          {
            id: "personal",
            name: "个人素养",
            value: data.competencyDetail.personal.progress,
            maxValue: 100,
            description: data.competencyDetail.personal.description,
          },
          {
            id: "engineering",
            name: "工程素养",
            value: data.competencyDetail.engineering.progress,
            maxValue: 100,
            description: data.competencyDetail.engineering.description,
          },
        ],
      };

      setSelectedStudent(enrichedStudent);
    } catch (error) {
      console.error("获取学生详细信息失败:", error);
      toast.error("获取学生详细信息失败");
    }
  };

  // 处理学生选择
  const handleSelectStudent = (student: EnrichedStudent) => {
    fetchStudentDetail(student.id);
  };

  // 组件挂载时获取学生列表
  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const refreshEvent = new CustomEvent("refresh-student-records", {
          detail: { studentId: selectedStudent.id },
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

    window.addEventListener("record-added", handleRecordAdded);

    return () => {
      window.removeEventListener("record-added", handleRecordAdded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudent, students]);

  // 处理刷新
  const handleRefresh = () => {
    fetchStudents();
    if (selectedStudent) {
      fetchStudentDetail(selectedStudent.id);
    }
    toast.success("数据已刷新");
  };

  if (isLoading) {
    return <TeacherViewSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="col-span-1 lg:col-span-2 bg-white rounded-xl overflow-hidden">
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
          <div className="flex h-[300px] items-center justify-center bg-white rounded-xl shadow border border-gray-100">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium">请选择一名学生</h3>
              <p className="text-sm text-muted-foreground mt-1">
                从左侧列表选择一名学生查看详情
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
