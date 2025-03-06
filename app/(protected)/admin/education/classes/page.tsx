import { Metadata } from "next";
import ClassManagement from "@/components/education/class/class-management";

export const metadata: Metadata = {
  title: "班级管理",
  description: "管理学校班级的基本信息及相关数据",
};

export default function ClassesPage() {
  return (
    <div className="container py-8">
      <ClassManagement />
    </div>
  );
} 