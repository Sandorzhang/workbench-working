import { ClassOverview } from "@/components/academic-journey/ClassOverview";
import { BookOpen } from "lucide-react";

export default function AcademicJourneyOverviewPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center">
          <div className="bg-white p-4 shadow-sm rounded-2xl mr-6 border border-gray-100/80">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">班级学业概览</h1>
            <p className="text-gray-500 mt-1.5 text-sm font-normal">查看全班学生的学业标准达成情况和统计数据</p>
          </div>
        </div>
        
        <ClassOverview classId="class-1" />
      </div>
    </div>
  );
} 