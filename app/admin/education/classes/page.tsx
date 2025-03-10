import { Metadata } from "next";
import ClassManagement from "@/components/education/class/class-management";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "班级管理",
  description: "管理学校班级的基本信息及相关数据",
};

export default function ClassesPage() {
  return (
    <div className="container py-8">
      <Suspense fallback={<div>加载中...</div>}>
        <ClassManagement />
      </Suspense>
    </div>
  );
}
