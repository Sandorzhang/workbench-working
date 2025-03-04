import { Button } from "@/components/ui/button";
import { ClassOverview } from "@/components/academic-journey/ClassOverview";
import { GraduationCap, Users, BookOpen, BarChart, Plus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { HeroSection } from "@/components/ui/hero-section";

export default function AcademicJourneyPage() {
  return (
    <div className="h-full flex flex-col">
      <HeroSection
        title="学业旅程"
        description="跟踪学生的学业标准达成进度，了解班级整体情况，助力教学决策与个性化指导。"
        icon={GraduationCap}
        gradient="from-blue-50 to-indigo-50"
        actions={
          <>
            <Link href="/academic-journey/students">
              <Button variant="outline" className="h-10 rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                <Users className="h-4 w-4 mr-2" />
                查看学生进度
              </Button>
            </Link>
            <Link href="/academic-journey/overview">
              <Button className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium">
                <Plus className="h-4 w-4 mr-2" />
                添加新标准
              </Button>
            </Link>
          </>
        }
      />

      {/* Navigation buttons with improved styling */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Card className="border border-indigo-100 shadow-sm w-full md:w-auto">
          <CardContent className="p-0">
            <div className="p-4 flex items-center gap-3">
              <div className="bg-indigo-50 p-2.5 rounded-md">
                <BarChart className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">快速导航</h3>
                <p className="text-sm text-gray-500">访问学业旅程相关功能</p>
              </div>
            </div>
            <div className="flex flex-wrap border-t border-gray-100 divide-x divide-gray-100">
              <Link href="/academic-journey/students" className="flex-1">
                <Button variant="ghost" className="w-full rounded-none py-5 flex items-center justify-center gap-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                  <Users className="h-4 w-4" />
                  学生学业进度
                </Button>
              </Link>
              <div className="flex-1">
                <Button variant="ghost" className="w-full rounded-none py-5 flex items-center justify-center gap-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                  <BookOpen className="h-4 w-4" />
                  学业标准概览
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content section with improved header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="bg-indigo-100 p-1.5 rounded-md">
              <BarChart className="h-4 w-4 text-indigo-600" />
            </span>
            班级学业概览
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="bg-green-100 w-3 h-3 rounded-full"></span>高掌握度
            <span className="bg-yellow-100 w-3 h-3 rounded-full ml-2"></span>中掌握度
            <span className="bg-red-100 w-3 h-3 rounded-full ml-2"></span>低掌握度
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <ClassOverview classId="class-1" />
        </div>
      </div>
    </div>
  );
} 