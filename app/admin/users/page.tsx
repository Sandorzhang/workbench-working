"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";
import { TabsSkeleton } from "@/components/ui/skeleton-loader";
import { PageContainer } from "@/components/ui/page-container";
import { SectionContainer } from "@/components/ui/section-container";
import { HeroSection } from "@/components/ui/hero-section";

// 导入新开发的管理组件
import TeacherManagement from "@/components/education/teacher/teacher-management";
import StudentManagement from "@/components/education/student/student-management";
import GradeManagement from "@/components/education/grade/grade-management";
import ClassManagement from "@/components/education/class/class-management";

export default function UsersPage(): React.JSX.Element {
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const timer = setTimeout(() => {
      if (mounted) {
        setIsLoading(false);
      }
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
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
        {_isLoading ? (
          <TabsSkeleton />
        ) : (
          <Tabs defaultValue="teachers" className="w-full">
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
