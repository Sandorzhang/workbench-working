import { StudentHeatmap } from "@/components/academic-journey/StudentHeatmap";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
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
        <div>
          <Link href="/academic-journey/students">
            <Button variant="ghost" className="pl-0 flex gap-1 items-center mb-4">
              <ArrowLeft className="h-4 w-4" />
              返回学生列表
            </Button>
          </Link>
          <div className="flex items-center">
            <div className="bg-white p-4 shadow-sm rounded-2xl mr-6 border border-gray-100/80">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">学生学业热力图</h1>
              <p className="text-gray-500 mt-1.5 text-sm font-normal">查看学生在各个学习标准上的进步情况</p>
            </div>
          </div>
        </div>
        
        <StudentHeatmap studentId={id} />
      </div>
    </div>
  );
} 