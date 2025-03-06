'use client';

import { Button } from "@/components/ui/button";
import { ClassOverview } from "@/components/academic-journey/ClassOverview";
import { GraduationCap, Users, BookOpen, AlertTriangle, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroSection } from "@/components/ui/hero-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { 
  StudentSummary, 
  LearningStandard, 
  MasteryLevel 
} from "@/features/academic-journey/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/shared/api";
import { MasteryBadge } from "@/components/academic-journey/MasteryLegend";

// Student warning component
function StudentWarnings() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [standards, setStandards] = useState<LearningStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"subject" | "date">("subject");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all students
        const studentResponse = await api.academicJourney.getStudentList("class-1", 1, 100);
        
        // Fetch all standards for reference
        const standardsResponse = await api.academicJourney.getLearningStandards();
        
        setStudents(studentResponse.data.students);
        setStandards(standardsResponse.data.standards);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("加载数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            学生预警情况
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            学生预警情况
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter students with warning indicators (has 'needs-improvement' or 'not-started' standards)
  const studentsWithWarnings = students.filter(student => 
    student.standardsCounts.needsImprovement > 0 || 
    student.standardsCounts.notStarted > 0
  );

  // Get warning info from recent progress
  const getWarningsBySubject = () => {
    // Group warnings by subject
    const warningsBySubject: Record<string, {
      subject: string;
      students: Array<{
        studentId: string;
        studentName: string;
        standardId: string;
        standardCode: string;
        standardDescription: string;
        masteryLevel: MasteryLevel;
        date: string;
      }>
    }> = {};

    // Process each student with warnings
    studentsWithWarnings.forEach(student => {
      // Look at their recent progress for warning levels
      student.recentProgress.forEach(progress => {
        if (progress.currentLevel === 'needs-improvement' || progress.currentLevel === 'not-started') {
          // Find the standard details
          const standard = standards.find(s => s.id === progress.standardId);
          if (standard) {
            // Initialize subject group if not exists
            if (!warningsBySubject[standard.subject]) {
              warningsBySubject[standard.subject] = {
                subject: standard.subject,
                students: []
              };
            }
            
            // Add warning to the subject group
            warningsBySubject[standard.subject].students.push({
              studentId: student.id,
              studentName: student.name,
              standardId: standard.id,
              standardCode: standard.code,
              standardDescription: standard.shortDescription,
              masteryLevel: progress.currentLevel,
              date: progress.date
            });
          }
        }
      });
    });

    return Object.values(warningsBySubject);
  };

  const getWarningsByDate = () => {
    // Group warnings by date
    const warningsByDate: Record<string, {
      date: string;
      students: Array<{
        studentId: string;
        studentName: string;
        standardId: string;
        standardCode: string;
        standardDescription: string;
        masteryLevel: MasteryLevel;
        subject: string;
      }>
    }> = {};

    // Process each student with warnings
    studentsWithWarnings.forEach(student => {
      // Look at their recent progress for warning levels
      student.recentProgress.forEach(progress => {
        if (progress.currentLevel === 'needs-improvement' || progress.currentLevel === 'not-started') {
          // Find the standard details
          const standard = standards.find(s => s.id === progress.standardId);
          if (standard) {
            // Initialize date group if not exists
            if (!warningsByDate[progress.date]) {
              warningsByDate[progress.date] = {
                date: progress.date,
                students: []
              };
            }
            
            // Add warning to the date group
            warningsByDate[progress.date].students.push({
              studentId: student.id,
              studentName: student.name,
              standardId: standard.id,
              standardCode: standard.code,
              standardDescription: standard.shortDescription,
              masteryLevel: progress.currentLevel,
              subject: standard.subject
            });
          }
        }
      });
    });

    // Sort dates from newest to oldest
    return Object.values(warningsByDate).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const warningsBySubject = getWarningsBySubject();
  const warningsByDate = getWarningsByDate();

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          学生预警情况 
          <Badge variant="outline" className="ml-2">
            {studentsWithWarnings.length} 位学生需要关注
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="subject" className="w-full" onValueChange={(val) => setActiveTab(val as "subject" | "date")}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="subject" className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                按学科查看
              </TabsTrigger>
              <TabsTrigger value="date" className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                按日期查看
              </TabsTrigger>
            </TabsList>
            <Link href="/academic-journey/students">
              <Button variant="ghost" size="sm" className="text-sm">
                查看全部学生
              </Button>
            </Link>
          </div>

          <TabsContent value="subject" className="mt-0">
            {warningsBySubject.length > 0 ? (
              <div className="space-y-4">
                {warningsBySubject.map(group => (
                  <div key={group.subject} className="border rounded-lg p-4">
                    <h3 className="font-medium text-md mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-indigo-500" />
                      {group.subject} 
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        {group.students.length} 个预警
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {group.students.map((warning, idx) => (
                        <div key={`${warning.studentId}-${warning.standardId}-${idx}`} 
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{warning.studentName}</span>
                              <MasteryBadge level={warning.masteryLevel} />
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <span className="text-gray-500">{warning.standardCode}:</span> 
                              {warning.standardDescription}
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {warning.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-[200px] text-muted-foreground">
                暂无预警信息
              </div>
            )}
          </TabsContent>

          <TabsContent value="date" className="mt-0">
            {warningsByDate.length > 0 ? (
              <div className="space-y-4">
                {warningsByDate.map(group => (
                  <div key={group.date} className="border rounded-lg p-4">
                    <h3 className="font-medium text-md mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      {group.date}
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        {group.students.length} 个预警
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {group.students.map((warning, idx) => (
                        <div key={`${warning.studentId}-${warning.standardId}-${idx}`} 
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{warning.studentName}</span>
                              <MasteryBadge level={warning.masteryLevel} />
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <span className="text-gray-500">{warning.standardCode}:</span> 
                              {warning.standardDescription}
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <BookOpen className="h-3.5 w-3.5 mr-1" />
                            {warning.subject}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-[200px] text-muted-foreground">
                暂无预警信息
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default function AcademicJourneyPage() {
  return (
    <div className="h-full flex flex-col">
      <HeroSection
        title="学业旅程"
        description="跟踪学生的学业标准达成进度，了解班级整体情况，助力教学决策与个性化指导。"
        icon={GraduationCap}
        gradient="from-blue-50 to-indigo-50"
        actions={
          <Link href="/academic-journey/students">
            <Button variant="outline" className="h-10 rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
              <Users className="h-4 w-4 mr-2" />
              查看学生进度
            </Button>
          </Link>
        }
      />

      {/* Content section */}
      <div className="space-y-6 mt-6">
        {/* Student Warnings Section */}
        <StudentWarnings />
        
        {/* Class Overview Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <ClassOverview classId="class-1" />
        </div>
      </div>
    </div>
  );
} 