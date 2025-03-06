import { StudentList } from "@/components/academic-journey/StudentList";
import { Users } from "lucide-react";
import { HeroSection } from "@/components/ui/hero-section";

export default function AcademicJourneyStudentsPage() {
  return (
    <div className="h-full flex flex-col">
      <HeroSection
        title="学生学业进度"
        description="查看所有学生的学业标准达成情况和个人进度，帮助教师了解每位学生的学习状态。"
        icon={Users}
        gradient="from-emerald-50 to-teal-50"
      />
      
      <div className="mt-6">
        <StudentList classId="class-1" />
      </div>
    </div>
  );
} 