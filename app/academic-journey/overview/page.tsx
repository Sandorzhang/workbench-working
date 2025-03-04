import { ClassOverview } from "@/components/academic-journey/ClassOverview";

export default function AcademicJourneyOverviewPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">班级学业概览</h1>
          <p className="text-muted-foreground">
            查看全班学生的学业标准达成情况和统计数据
          </p>
        </div>
        
        <ClassOverview classId="class-1" />
      </div>
    </div>
  );
} 