import { Metadata } from "next";
import Link from "next/link";
import { Book, GraduationCap, Users, School } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "教育管理",
  description: "教师、学生、年级、班级管理系统",
};

export default function EducationManagementPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">教育管理系统</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 教师管理卡片 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              教师管理
            </CardTitle>
            <CardDescription>管理学校教师信息</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              添加、编辑、查看和删除教师，管理教师的基本信息、任教学科和外部系统 ID。
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/education/teachers">进入管理</Link>
            </Button>
          </CardContent>
        </Card>

        {/* 学生管理卡片 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              学生管理
            </CardTitle>
            <CardDescription>管理学生基本信息</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              添加、编辑、查看和删除学生，管理学生的基本信息、班级、年级和外部系统 ID。
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/education/students">进入管理</Link>
            </Button>
          </CardContent>
        </Card>

        {/* 年级管理卡片 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-6 w-6 text-primary" />
              年级管理
            </CardTitle>
            <CardDescription>管理学校年级信息</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              添加、编辑、查看和删除年级，管理年级的名称和所属学年等信息。
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/education/grades">进入管理</Link>
            </Button>
          </CardContent>
        </Card>

        {/* 班级管理卡片 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-6 w-6 text-primary" />
              班级管理
            </CardTitle>
            <CardDescription>管理学校班级信息</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              添加、编辑、查看和删除班级，管理班级的名称、所属年级和学年等信息。
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/education/classes">进入管理</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 