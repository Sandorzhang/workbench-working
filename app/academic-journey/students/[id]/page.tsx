import { use } from "react";
import { StudentHeatmap } from "@/components/academic-journey/StudentHeatmap";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { HeroSection } from "@/components/ui/hero-section";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: PageProps) {
  const { id } = use(params);

  return (
    <div className="h-full flex flex-col">
      <div>
        <Link href="/academic-journey/students">
          <Button variant="ghost" className="pl-0 flex gap-1 items-center mb-4">
            <ArrowLeft className="h-4 w-4" />
            返回学生列表
          </Button>
        </Link>
        <HeroSection
          title="学生学业热力图"
          description="查看学生在各个学习标准上的进步情况，发现学习特点和改进方向。"
          icon={User}
          gradient="from-blue-50 to-cyan-50"
        />
      </div>

      <div className="mt-6">
        <StudentHeatmap studentId={id} />
      </div>
    </div>
  );
}
