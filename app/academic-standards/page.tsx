"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CardContainer } from "@/components/ui/card-container";
import { Input } from "@/components/ui/input";
import { Search, Calculator, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { HeroSection } from "@/components/ui/hero-section";

// 学业标准类型定义
interface AcademicStandard {
  id: string;
  title: string;
  category: string;
  subject: string;
  grade: string;
  count: number;
}

// 学科类型定义
interface Subject {
  id: string;
  name: string;
  icon: string;
}

// 标准详情类型
// interface StandardDetail {
//   id: string;
//   title: string;
//   category: string;
//   description: string;
// }

export default function AcademicStandardsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [standards, setStandards] = useState<AcademicStandard[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("competencies");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 检查认证状态
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error("请先登录");
        router.push("/login");
      }
    }
  }, [authLoading, isAuthenticated, router]);

  // 获取学科列表
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("/api/academic-standards/subjects");
        const data = await response.json();
        setSubjects(data);

        // 默认选择第一个学科
        if (data.length > 0 && !selectedSubject) {
          setSelectedSubject(data[0].id);
        }
      } catch (error) {
        console.error("获取学科列表失败:", error);
        toast.error("获取学科列表失败");
      }
    };

    fetchSubjects();
  }, [selectedSubject]);

  // 获取学业标准
  useEffect(() => {
    if (!selectedSubject) return;

    const fetchStandards = async () => {
      setIsLoading(true);

      try {
        const url = `/api/academic-standards?subject=${selectedSubject}&category=${selectedTab}${
          selectedGrade ? `&grade=${selectedGrade}` : ""
        }${searchTerm ? `&search=${searchTerm}` : ""}`;
        const response = await fetch(url);
        const data = await response.json();

        setStandards(data);
        setIsLoading(false);
      } catch (error) {
        console.error("获取学业标准失败:", error);
        toast.error("获取学业标准失败");
        setIsLoading(false);
      }
    };

    fetchStandards();
  }, [selectedSubject, selectedTab, selectedGrade, searchTerm]);

  // 处理学科切换
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setSelectedGrade(""); // 重置年级选择
  };

  // 处理年级切换
  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade === selectedGrade ? "" : grade);
  };

  // 处理标准点击
  const handleStandardClick = (standardId: string) => {
    router.push(`/academic-standards/${standardId}`);
  };

  // 获取学科图标组件
  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case "book-open":
        return <BookOpen className="h-5 w-5" />;
      case "math":
        return <Calculator className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <HeroSection
        title="学业标准"
        description="浏览和查询各学科学业标准，了解教学内容和目标要求，支持教学计划制定。"
        icon={BookOpen}
        gradient="from-blue-50 to-indigo-50"
        actions={
          <>
            <Button
              variant="outline"
              className="h-10 rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Search className="h-4 w-4 mr-2" />
              高级筛选
            </Button>
            <Button className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium">
              <BookOpen className="h-4 w-4 mr-2" />
              添加标准
            </Button>
          </>
        }
      />

      {/* 学科选择区域 */}
      <div className="flex flex-wrap gap-4 mb-6">
        {subjects.map((subject) => (
          <Button
            key={subject.id}
            variant={selectedSubject === subject.id ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => handleSubjectChange(subject.id)}
          >
            {getSubjectIcon(subject.icon)}
            {subject.name}
          </Button>
        ))}
      </div>

      {/* 年级选择区域 */}
      {selectedSubject && (
        <div className="flex flex-wrap gap-2 mb-6 bg-slate-50 p-3 rounded-lg">
          {["一年级", "二年级", "三年级", "四年级", "五年级"].map((grade) => (
            <Button
              key={grade}
              variant={selectedGrade === grade ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleGradeChange(grade)}
            >
              {grade}
            </Button>
          ))}
        </div>
      )}

      {/* 分类标签页 */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="competencies">核心素养</TabsTrigger>
            <TabsTrigger value="domains">领域/主题</TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索标准名称"
              className="pl-10 max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="competencies">
          <ResponsiveGrid xs={1} sm={2} md={3} gap="md">
            {isLoading
              ? // 骨架屏加载状态
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <CardContainer key={index} elevated>
                      <div className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContainer>
                  ))
              : standards.map((standard) => (
                  <CardContainer
                    key={standard.id}
                    elevated
                    clickable
                    onClick={() => handleStandardClick(standard.id)}
                    className="h-full"
                  >
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {standard.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{standard.grade}</Badge>
                        <span className="text-sm text-gray-500">
                          {standard.count} 条标准
                        </span>
                      </div>
                    </div>
                  </CardContainer>
                ))}
          </ResponsiveGrid>
        </TabsContent>

        <TabsContent value="domains">
          <ResponsiveGrid xs={1} sm={2} md={3} gap="md">
            {isLoading
              ? // 骨架屏加载状态
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <CardContainer key={index} elevated>
                      <div className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContainer>
                  ))
              : standards.map((standard) => (
                  <CardContainer
                    key={standard.id}
                    elevated
                    clickable
                    onClick={() => handleStandardClick(standard.id)}
                    className="h-full"
                  >
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {standard.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{standard.grade}</Badge>
                        <span className="text-sm text-gray-500">
                          {standard.count} 条标准
                        </span>
                      </div>
                    </div>
                  </CardContainer>
                ))}
          </ResponsiveGrid>
        </TabsContent>
      </Tabs>
    </div>
  );
}
