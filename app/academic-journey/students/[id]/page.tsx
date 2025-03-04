import { StudentHeatmap } from "@/components/academic-journey/StudentHeatmap";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface StudentDetailPageProps {
  params: {
    id: string;
  };
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = params;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <Link href="/academic-journey/students">
              <Button variant="ghost" className="pl-0 flex gap-1 items-center">
                <ArrowLeft className="h-4 w-4" />
                返回学生列表
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">学生学业热力图</h1>
            <p className="text-muted-foreground">
              查看学生在各个学习标准上的进步情况
            </p>
          </div>
        </div>
        
        <StudentHeatmap studentId={id} />
      </div>
    </div>
  );
} 