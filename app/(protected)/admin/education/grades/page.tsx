import { Metadata } from "next";
import GradeManagement from "@/components/education/grade/grade-management";

export const metadata: Metadata = {
  title: "年级管理",
  description: "管理学校年级的基本信息及相关数据",
};

export default function GradesPage() {
  return (
    <div className="container py-8">
      <GradeManagement />
    </div>
  );
} 