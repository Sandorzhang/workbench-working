import { StudentList } from "@/components/academic-journey/StudentList";
import { Users } from "lucide-react";

export default function AcademicJourneyStudentsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center">
          <div className="bg-white p-4 shadow-sm rounded-2xl mr-6 border border-gray-100/80">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">学生学业进度</h1>
            <p className="text-gray-500 mt-1.5 text-sm font-normal">查看所有学生的学业标准达成情况和个人进度</p>
          </div>
        </div>
        
        <StudentList classId="class-1" />
      </div>
    </div>
  );
} 