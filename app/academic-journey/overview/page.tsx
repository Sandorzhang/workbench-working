import { ClassOverview } from "@/components/academic-journey/ClassOverview";
import { GraduationCap, BarChart } from "lucide-react";
import { HeroSection } from "@/components/ui/hero-section";

export default function AcademicJourneyOverviewPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <HeroSection
          title="班级学业概览"
          description="查看全班学生的学业标准达成情况和统计数据，掌握教学进度和学习差异。"
          icon={BarChart}
          gradient="from-purple-50 to-indigo-50"
        />
        
        <ClassOverview classId="class-1" />
      </div>
    </div>
  );
} 