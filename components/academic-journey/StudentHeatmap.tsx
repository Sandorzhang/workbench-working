'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MasteryLevel, HeatmapData } from '@/types/academic-journey';
import { getStudentHeatmap } from '@/lib/api-academic-journey';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MasteryLegend } from './MasteryLegend';
import { InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StudentHeatmapProps {
  studentId: string;
  className?: string;
}

export function StudentHeatmap({ studentId, className }: StudentHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        setLoading(true);
        setError(null);
        const { heatmap } = await getStudentHeatmap(studentId);
        setHeatmapData(heatmap);
      } catch (err) {
        console.error('Failed to fetch heatmap:', err);
        setError('加载热力图数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, [studentId]);

  // Map mastery levels to colors
  const getMasteryColor = (level: MasteryLevel): string => {
    switch (level) {
      case 'mastered':
        return 'bg-green-500';
      case 'progressing':
        return 'bg-blue-500';
      case 'needs-improvement':
        return 'bg-amber-500';
      case 'not-started':
      default:
        return 'bg-gray-200';
    }
  };

  const getMasteryLabel = (level: MasteryLevel): string => {
    switch (level) {
      case 'mastered':
        return '已掌握';
      case 'progressing':
        return '进行中';
      case 'needs-improvement':
        return '需提高';
      case 'not-started':
      default:
        return '未开始';
    }
  };

  if (loading) {
    return (
      <Card className={cn("w-full h-full min-h-[400px]", className)}>
        <CardHeader>
          <CardTitle>学习进度热力图</CardTitle>
          <div className="h-4 w-32">
            <Skeleton className="h-full w-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  {Array.from({ length: 12 }).map((_, j) => (
                    <Skeleton key={j} className="h-6 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !heatmapData) {
    return (
      <Card className={cn("w-full h-full min-h-[400px]", className)}>
        <CardHeader>
          <CardTitle>学习进度热力图</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">{error || '无数据'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { timePoints, standards, data } = heatmapData;

  return (
    <Card className={cn("w-full h-full", className)}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>学习进度热力图</CardTitle>
          <MasteryLegend className="ml-auto" />
        </div>
      </CardHeader>
      <CardContent className="overflow-auto">
        <div className="relative min-w-[800px]">
          {/* Header with time points */}
          <div className="grid grid-cols-1" style={{ gridTemplateColumns: `minmax(200px, auto) repeat(${timePoints.length}, minmax(80px, 1fr))` }}>
            <div className="sticky left-0 bg-background z-10 font-medium p-2 border-b">学习标准</div>
            {timePoints.map((timePoint, index) => (
              <div key={index} className="text-center p-2 font-medium border-b text-sm">
                {timePoint}
              </div>
            ))}
          </div>

          {/* Rows with standards and heatmap cells */}
          {standards.map((standard, standardIndex) => {
            const standardData = data.find(d => d.standardId === standard.id);
            
            if (!standardData) return null;
            
            return (
              <div 
                key={standard.id}
                className="grid grid-cols-1 hover:bg-accent/30 transition-colors"
                style={{ gridTemplateColumns: `minmax(200px, auto) repeat(${timePoints.length}, minmax(80px, 1fr))` }}
              >
                <div className="sticky left-0 bg-background z-10 p-2 border-b flex items-center">
                  <div className="font-medium text-sm truncate">
                    {standard.code}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="ml-1 h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" align="start" className="max-w-[300px]">
                        <p>{standard.shortDescription}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {/* Heatmap cells for each time point */}
                {standardData.timeValues.map((timeValue, timeIndex) => {
                  const masteryColor = getMasteryColor(timeValue.masteryLevel);
                  const masteryLabel = getMasteryLabel(timeValue.masteryLevel);
                  
                  return (
                    <div key={timeIndex} className="p-2 border-b flex justify-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "w-6 h-6 rounded-sm cursor-help",
                                masteryColor
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p><strong>标准:</strong> {standard.code}</p>
                            <p><strong>时间:</strong> {timeValue.timePoint}</p>
                            <p><strong>掌握程度:</strong> {masteryLabel}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 