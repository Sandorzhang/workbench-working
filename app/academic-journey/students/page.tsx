import { StudentList } from "@/components/academic-journey/StudentList";

export default function AcademicJourneyStudentsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">学生学业进度</h1>
          <p className="text-muted-foreground">
            查看所有学生的学业标准达成情况和个人进度
          </p>
        </div>
        
        <StudentList classId="class-1" />
      </div>
    </div>
  );
} 