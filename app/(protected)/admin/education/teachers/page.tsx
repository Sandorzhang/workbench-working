import { Metadata } from "next";
import TeacherManagement from "@/components/education/teacher/teacher-management";

export const metadata: Metadata = {
  title: "教师管理",
  description: "管理教师的基本信息及相关数据",
};

export default function TeachersPage() {
  return (
    <div className="container mx-auto py-6">
      <TeacherManagement />
    </div>
  );
} 