'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, Save, BarChart3, Filter, List, Grid, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 评价等级枚举
export type EvaluationLevel = 'excellent' | 'good' | 'average' | 'needs-improvement' | 'not-evaluated';

// 三级指标项接口
export interface IndicatorItem {
  id: string;
  code: string; // 指标代码，如 A1.1
  name: string; // 指标名称
  description: string; // 指标描述
  category: string; // 指标类别/一级分类
  subcategory: string; // 二级分类
  currentLevel?: EvaluationLevel; // 当前评价等级
}

interface StudentEvaluationProps {
  studentId: string;
  className?: string;
  readOnly?: boolean;
}

export function StudentEvaluation({ studentId, className, readOnly = false }: StudentEvaluationProps) {
  const [indicators, setIndicators] = useState<IndicatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // 获取学生评价指标和当前评价
  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 调用API获取学生评价指标
        const response = await fetch(`/api/mentor/student-evaluation/${studentId}`);
        
        if (!response.ok) {
          throw new Error('获取学生评价指标失败');
        }
        
        const data = await response.json();
        setIndicators(data.indicators);
      } catch (err) {
        console.error('Failed to fetch evaluation indicators:', err);
        setError('加载学生评价指标失败');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluationData();
  }, [studentId]);

  // 更新指标评价等级
  const updateIndicatorLevel = (indicatorId: string, level: EvaluationLevel) => {
    if (readOnly) return;
    
    setIndicators(prev => 
      prev.map(indicator => 
        indicator.id === indicatorId 
          ? { ...indicator, currentLevel: level }
          : indicator
      )
    );
  };

  // 保存评价
  const saveEvaluation = async () => {
    try {
      setSaving(true);
      
      // 调用API保存学生评价
      const response = await fetch(`/api/mentor/student-evaluation/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ indicators }),
      });
      
      if (!response.ok) {
        throw new Error('保存学生评价失败');
      }
      
      toast.success('学生评价已保存');
    } catch (err) {
      console.error('Failed to save evaluation:', err);
      toast.error('保存评价失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 获取评价等级对应的颜色和标签
  const getLevelInfo = (level: EvaluationLevel | undefined) => {
    switch (level) {
      case 'excellent':
        return { color: 'bg-emerald-500', label: '优秀', textColor: 'text-emerald-500' };
      case 'good':
        return { color: 'bg-blue-500', label: '良好', textColor: 'text-blue-500' };
      case 'average':
        return { color: 'bg-amber-500', label: '一般', textColor: 'text-amber-500' };
      case 'needs-improvement':
        return { color: 'bg-red-500', label: '需提高', textColor: 'text-red-500' };
      case 'not-evaluated':
      default:
        return { color: 'bg-gray-200', label: '未评价', textColor: 'text-gray-400' };
    }
  };

  // 分组指标项按类别
  const groupedIndicators = useMemo(() => {
    return indicators.reduce((acc, indicator) => {
      if (!acc[indicator.category]) {
        acc[indicator.category] = [];
      }
      acc[indicator.category].push(indicator);
      return acc;
    }, {} as Record<string, IndicatorItem[]>);
  }, [indicators]);

  // 获取所有一级分类
  const categories = useMemo(() => {
    return Object.keys(groupedIndicators);
  }, [groupedIndicators]);

  // 根据所选分类过滤指标
  const filteredIndicators = useMemo(() => {
    if (selectedCategory === 'all') {
      return indicators;
    }
    return indicators.filter(indicator => indicator.category === selectedCategory);
  }, [indicators, selectedCategory]);

  // 根据所选分类过滤分组指标
  const filteredGroupedIndicators = useMemo(() => {
    if (selectedCategory === 'all') {
      return groupedIndicators;
    }
    return {
      [selectedCategory]: groupedIndicators[selectedCategory]
    };
  }, [groupedIndicators, selectedCategory]);

  // 加载状态
  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-emerald-500" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-7 w-7 rounded-sm" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 错误状态
  if (error || !indicators.length) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-emerald-500" />
            学生评价
          </CardTitle>
          <CardDescription>
            综合评价学生在各维度的表现和发展潜力
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">{error || '暂无评价指标数据'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-emerald-500" />
          学生评价
        </CardTitle>
        <CardDescription>
          综合评价学生在各维度的表现和发展潜力
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="heatmap" className="w-full">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <TabsList>
              <TabsTrigger value="heatmap" className="text-sm">
                <Grid className="h-3.5 w-3.5 mr-1" />
                热力图
              </TabsTrigger>
              <TabsTrigger value="list" className="text-sm">
                <List className="h-3.5 w-3.5 mr-1" />
                列表视图
              </TabsTrigger>
              <TabsTrigger value="timeline" className="text-sm">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                评价记录
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <div className="flex items-center">
                    <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="按一级维度筛选" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">所有维度</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="text-xs">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {!readOnly && (
                <Button 
                  onClick={saveEvaluation} 
                  disabled={saving}
                  size="sm"
                  className="gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  保存评价
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {(['excellent', 'good', 'average', 'needs-improvement', 'not-evaluated'] as EvaluationLevel[]).map((level) => {
              const { color, label } = getLevelInfo(level);
              
              return (
                <div key={level} className="flex items-center gap-1.5 border px-2 py-1 rounded-md text-xs">
                  <div className={cn("w-3 h-3 rounded-sm", color)}></div>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>

          <TabsContent value="heatmap" className="mt-0">
            <ScrollArea className="h-[calc(100vh-350px)] pr-4">
              <div className="space-y-6">
                {Object.entries(filteredGroupedIndicators).map(([category, items]) => (
                  <div key={category} className="rounded-lg border overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b">
                      <h4 className="font-medium">{category}</h4>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        {items.map((indicator) => (
                          <div key={indicator.id} className="flex items-center space-x-2 py-2">
                            <div className="w-16 text-xs text-center font-medium text-muted-foreground">
                              {indicator.code}
                            </div>
                            <div className="flex-1 text-sm truncate" title={indicator.name}>
                              {indicator.name}
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center" className="max-w-[280px]">
                                  <p className="text-sm">{indicator.description}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {indicator.subcategory}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <div className="flex gap-1">
                              {(['excellent', 'good', 'average', 'needs-improvement', 'not-evaluated'] as EvaluationLevel[]).map((level) => {
                                const isSelected = indicator.currentLevel === level;
                                const { color, label } = getLevelInfo(level);
                                
                                return (
                                  <TooltipProvider key={level}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          disabled={readOnly}
                                          onClick={() => updateIndicatorLevel(indicator.id, level)}
                                          className={cn(
                                            "w-7 h-7 rounded-sm transition-all",
                                            color,
                                            isSelected ? "ring-2 ring-offset-1 ring-primary" : "",
                                            readOnly ? "cursor-default" : "cursor-pointer hover:opacity-90"
                                          )}
                                          aria-label={`将指标 ${indicator.name} 评为 ${label}`}
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p className="text-xs">{label}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            <ScrollArea className="h-[calc(100vh-350px)] pr-4">
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标代码</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标名称</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">一级分类</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">二级分类</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评价结果</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredIndicators.map((indicator) => {
                        const { label, textColor } = getLevelInfo(indicator.currentLevel);
                        
                        return (
                          <tr key={indicator.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs font-medium text-gray-500">{indicator.code}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help">{indicator.name}</span>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" align="start" className="max-w-xs">
                                    <p className="text-sm">{indicator.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs">{indicator.category}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs">{indicator.subcategory}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <Badge variant="outline" className={cn("text-xs", textColor)}>
                                {label}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-0">
            <div className="flex items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
              <div className="text-center">
                <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">评价记录功能即将上线</p>
                <p className="text-xs text-muted-foreground mt-1">该功能将显示学生历史评价记录和变化趋势</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 