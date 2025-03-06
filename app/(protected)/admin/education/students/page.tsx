import { Metadata } from "next";
import StudentManagement from "@/components/education/student/student-management";

export const metadata: Metadata = {
  title: "学生管理",
  description: "管理学生的基本信息及相关数据",
};

export default function StudentsPage() {
  return (
    <div className="container py-8">
      <StudentManagement />
    </div>
  );
} 