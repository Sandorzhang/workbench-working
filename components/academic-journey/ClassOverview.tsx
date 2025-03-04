'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClassOverview as ClassOverviewType, LearningStandard } from '@/types/academic-journey';
import { getClassOverview, getLearningStandards } from '@/lib/api-academic-journey';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { MasteryLegend } from './MasteryLegend';
import { TimeRangeSelector } from './TimeRangeSelector';
import { StandardsFilter } from './StandardsFilter';

interface ClassOverviewProps {
  classId: string;
  className?: string;
}

export function ClassOverview({ classId, className }: ClassOverviewProps) {
  const [overviewData, setOverviewData] = useState<ClassOverviewType | null>(null);
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
        console.error('Failed to fetch class overview:', err);
        setError('加载班级概览数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const handleTimeRangeChange = (startDate: Date, endDate: Date) => {
    // In a real implementation, we would re-fetch data with the new date range
    console.log('Time range changed:', { startDate, endDate });
  };

  const handleStandardsFilterChange = (selectedStandards: string[]) => {
    setFilteredStandardIds(selectedStandards);
  };

  // Get filtered or all standards summary data
  const getFilteredStandardsSummary = () => {
    if (!overviewData) return [];
    
    if (filteredStandardIds.length === 0) {
      return overviewData.standardsSummary;
    }
    
    return overviewData.standardsSummary.filter(summary => 
      filteredStandardIds.includes(summary.standardId)
    );
  };

  // Find standard details by ID
  const getStandardDetails = (standardId: string) => {
    return standards.find(s => s.id === standardId);
  };

  // Calculate average mastery for filtered standards
  const calculateFilteredProgress = () => {
    if (!overviewData) return null;
    
    const filteredSummary = getFilteredStandardsSummary();
    if (filteredSummary.length === 0) return overviewData.overallProgress;
    
    const studentCount = overviewData.studentCount;
    const totalAssessments = filteredSummary.length * studentCount;
    
    const mastered = filteredSummary.reduce((sum, s) => sum + s.masteryDistribution.mastered, 0);
    const progressing = filteredSummary.reduce((sum, s) => sum + s.masteryDistribution.progressing, 0);
    const needsImprovement = filteredSummary.reduce((sum, s) => sum + s.masteryDistribution.needsImprovement, 0);
    const notStarted = filteredSummary.reduce((sum, s) => sum + s.masteryDistribution.notStarted, 0);
    
    return {
      mastered: (mastered / totalAssessments) * 100,
      progressing: (progressing / totalAssessments) * 100,
      needsImprovement: (needsImprovement / totalAssessments) * 100,
      notStarted: (notStarted / totalAssessments) * 100,
    };
  };

  if (loading) {
    return (
      <Card className={cn("w-full h-full min-h-[400px]", className)}>
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
    );
  }

  if (error || !overviewData) {
    return (
      <Card className={cn("w-full h-full min-h-[400px]", className)}>
        <CardHeader>
          <CardTitle>班级学业概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">{error || '无数据'}</p>
          </div>
        </CardContent>
      </Card>
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
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <TimeRangeSelector onChange={handleTimeRangeChange} />
        <StandardsFilter onChange={handleStandardsFilterChange} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>班级学业概览</CardTitle>
          <CardDescription>
            {classNameData} - 共 {studentCount} 名学生
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    <Progress value={filteredProgress.mastered} className="h-2 bg-gray-200" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>进行中</span>
                      <span>{filteredProgress.progressing.toFixed(1)}%</span>
                    </div>
                    <Progress value={filteredProgress.progressing} className="h-2 bg-gray-200" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>需提高</span>
                      <span>{filteredProgress.needsImprovement.toFixed(1)}%</span>
                    </div>
                    <Progress value={filteredProgress.needsImprovement} className="h-2 bg-gray-200" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>未开始</span>
                      <span>{filteredProgress.notStarted.toFixed(1)}%</span>
                    </div>
                    <Progress value={filteredProgress.notStarted} className="h-2 bg-gray-200" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Challenging Standards */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">需要关注的学习标准</h3>
              <p className="text-sm text-muted-foreground">以下学习标准的掌握率较低，可能需要额外关注。</p>
              
              <div className="space-y-3">
                {challengingStandards.map(standard => {
                  const standardDetails = getStandardDetails(standard.standardId);
                  if (!standardDetails) return null;
                  
                  const masteryPercentage = (standard.masteryDistribution.mastered / studentCount) * 100;
                  
                  return (
                    <div key={standard.standardId} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{standardDetails.code}</div>
                          <div className="text-xs text-muted-foreground truncate">{standardDetails.shortDescription}</div>
                        </div>
                        <span className="text-sm font-medium">{masteryPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={masteryPercentage} className="h-2 bg-gray-200" />
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Additional Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">总体掌握率</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-bold">
                    {filteredProgress ? filteredProgress.mastered.toFixed(1) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    学生平均掌握学习标准的百分比
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">标准数量</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-bold">
                    {filteredSummary.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    当前选择的学习标准数量
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">已掌握标准数</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-bold">
                    {Math.round((filteredProgress?.mastered || 0) * filteredSummary.length / 100)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    班级平均已完全掌握的标准数量
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 