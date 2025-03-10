"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ClassOverview as ClassOverviewType,
  LearningStandard,
} from "@/types/academic-journey";
import {
  getClassOverview,
  getLearningStandards,
} from "@/lib/api-academic-journey";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { MasteryLegend } from "./MasteryLegend";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { StandardsFilter } from "./StandardsFilter";
import { SectionContainer } from "@/components/ui/section-container";
import { Users, BookOpen, TrendingUp } from "lucide-react";

interface ClassOverviewProps {
  classId: string;
  className?: string;
}

export function ClassOverview({ classId, className }: ClassOverviewProps) {
  const [overviewData, setOverviewData] = useState<ClassOverviewType | null>(
    null
  );
  const [standards, setStandards] = useState<LearningStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredStandardIds, setFilteredStandardIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch class overview data
        const { overview } = await getClassOverview(classId);
        setOverviewData(overview);

        // Fetch standards data for reference
        const { standards } = await getLearningStandards();
        setStandards(standards);
      } catch (err) {
        console.error("Failed to fetch class overview:", err);
        setError("加载班级概览数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const handleTimeRangeChange = (startDate: Date, endDate: Date) => {
    // In a real application, this would fetch data for the selected time range
    //console.log('Time range changed:', { startDate, endDate });
  };

  const handleStandardsFilterChange = (selectedStandards: string[]) => {
    setFilteredStandardIds(selectedStandards);
  };

  const getFilteredStandardsSummary = () => {
    if (!overviewData) return [];

    const { standardsSummary } = overviewData;

    if (filteredStandardIds.length === 0) {
      return standardsSummary;
    }

    return standardsSummary.filter((summary) =>
      filteredStandardIds.includes(summary.standardId)
    );
  };

  const getStandardDetails = (standardId: string) => {
    return standards.find((s) => s.id === standardId);
  };

  const calculateFilteredProgress = () => {
    if (!overviewData) return null;

    if (filteredStandardIds.length === 0) {
      return overviewData.overallProgress;
    }

    // Calculate progress based on filtered standards
    const filteredSummary = getFilteredStandardsSummary();
    const totalStudents = overviewData.studentCount;

    if (filteredSummary.length === 0 || totalStudents === 0) {
      return {
        mastered: 0,
        progressing: 0,
        needsImprovement: 0,
        notStarted: 0,
      };
    }

    // Sum up all mastery counts
    const totals = filteredSummary.reduce(
      (acc, summary) => {
        acc.mastered += summary.masteryDistribution.mastered;
        acc.progressing += summary.masteryDistribution.progressing;
        acc.needsImprovement += summary.masteryDistribution.needsImprovement;
        acc.notStarted += summary.masteryDistribution.notStarted;
        return acc;
      },
      { mastered: 0, progressing: 0, needsImprovement: 0, notStarted: 0 }
    );

    // Convert to percentages
    const totalStandards = filteredSummary.length * totalStudents;
    return {
      mastered: (totals.mastered / totalStandards) * 100,
      progressing: (totals.progressing / totalStandards) * 100,
      needsImprovement: (totals.needsImprovement / totalStandards) * 100,
      notStarted: (totals.notStarted / totalStandards) * 100,
    };
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <SectionContainer>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-64" />
          </div>
        </SectionContainer>

        <Card className="w-full h-full min-h-[400px]">
          <CardHeader>
            <CardTitle>班级学业概览</CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-64" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !overviewData) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="w-full h-full min-h-[400px]">
          <CardHeader>
            <CardTitle>班级学业概览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">{error || "无数据"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { className: classNameData, studentCount } = overviewData;
  const filteredProgress = calculateFilteredProgress();
  const filteredSummary = getFilteredStandardsSummary();

  // Sort standards by mastery level (lowest to highest)
  const sortedStandards = [...filteredSummary].sort((a, b) => {
    const aMastery = a.masteryDistribution.mastered / studentCount;
    const bMastery = b.masteryDistribution.mastered / studentCount;
    return aMastery - bMastery;
  });

  // Get challenging standards (lowest 5 mastery rates)
  const challengingStandards = sortedStandards.slice(0, 5);

  return (
    <div className={cn("space-y-6", className)}>
      <SectionContainer
        title="班级学业概览"
        description={`${classNameData} - 共 ${studentCount} 名学生`}
        className="bg-white rounded-lg shadow-sm border p-6"
      >
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-full">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">{classNameData}</h3>
              <p className="text-sm text-gray-500">{studentCount} 名学生</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <TimeRangeSelector onChange={handleTimeRangeChange} />
            <StandardsFilter onChange={handleStandardsFilterChange} sticky />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">整体掌握率</p>
                  <h4 className="text-2xl font-semibold">
                    {filteredProgress?.mastered.toFixed(1)}%
                  </h4>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-500 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">学习标准数</p>
                  <h4 className="text-2xl font-semibold">
                    {filteredSummary.length}
                  </h4>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-none">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-amber-500 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">进行中标准</p>
                  <h4 className="text-2xl font-semibold">
                    {filteredProgress?.progressing.toFixed(1)}%
                  </h4>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Overall Progress */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">整体掌握水平</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">掌握进度</span>
              <MasteryLegend />
            </div>

            {filteredProgress && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>已掌握</span>
                    <span>{filteredProgress.mastered.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={filteredProgress.mastered}
                    className="h-2 bg-gray-200"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>进行中</span>
                    <span>{filteredProgress.progressing.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={filteredProgress.progressing}
                    className="h-2 bg-gray-200"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>需提高</span>
                    <span>{filteredProgress.needsImprovement.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={filteredProgress.needsImprovement}
                    className="h-2 bg-gray-200"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>未开始</span>
                    <span>{filteredProgress.notStarted.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={filteredProgress.notStarted}
                    className="h-2 bg-gray-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Challenging Standards */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">需要关注的学习标准</h3>
            <div className="space-y-3">
              {challengingStandards.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  没有需要特别关注的学习标准
                </p>
              ) : (
                challengingStandards.map((standard) => {
                  const standardDetails = getStandardDetails(
                    standard.standardId
                  );
                  const masteryRate =
                    (standard.masteryDistribution.mastered / studentCount) *
                    100;

                  return (
                    <div
                      key={standard.standardId}
                      className="p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">
                            {standardDetails?.code || standard.standardId}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {standardDetails?.shortDescription || "未知标准"}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-red-500">
                          {masteryRate.toFixed(1)}% 掌握
                        </span>
                      </div>
                      <Progress
                        value={masteryRate}
                        className="h-2 bg-gray-200"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
