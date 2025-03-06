'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Calculator, BookOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

// 标准结构类型
interface StandardItem {
  id: string;
  title: string;
  type: 'standard' | 'domain';
  grade?: string;
  code?: string;
}

// 年级组类型
interface GradeGroup {
  grade: string;
  items: StandardItem[];
}

interface StandardNavigationProps {
  data?: GradeGroup[];
  isLoading?: boolean;
  selectedId?: string;
  onSelectStandard: (id: string) => void;
  subject?: string;
}

export function StandardNavigation({
  data = [],
  isLoading = false,
  selectedId,
  onSelectStandard,
  subject = 'math'
}: StandardNavigationProps) {
  const [expandedGrades, setExpandedGrades] = useState<string[]>([]);
  
  // 切换年级展开/折叠状态
  const toggleGrade = (grade: string) => {
    setExpandedGrades(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade) 
        : [...prev, grade]
    );
  };
  
  // 获取学科图标
  const getSubjectIcon = () => {
    switch (subject) {
      case 'math':
        return <Calculator className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };
  
  // 如果正在加载，显示骨架屏
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="p-2 mb-4">
          <Skeleton className="h-8 w-full mb-2" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="ml-2">
              <Skeleton className="h-6 w-24 mb-2" />
              <div className="ml-4 space-y-2">
                {[1, 2, 3].map(j => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // 如果没有数据，显示空状态
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        未找到标准数据
      </div>
    );
  }

  // 默认数据（用于演示）
  const defaultData: GradeGroup[] = [
    {
      grade: '一年级',
      items: [
        { id: 'M01.01', title: '数与代数/数与运算', type: 'domain', code: 'M01.01' },
        { id: 'M01.02', title: '数与代数/数量关系', type: 'domain', code: 'M01.02' },
        { id: 'M02.01', title: '图形与几何/图形的认识', type: 'domain', code: 'M02.01' },
        { id: 'M03.01', title: '统计与概率/数据分类', type: 'domain', code: 'M03.01' },
        { id: 'M04.01', title: '综合与实践', type: 'domain', code: 'M04.01' }
      ]
    },
    {
      grade: '二年级',
      items: [
        { id: 'M01.01-2', title: '数与代数/数与运算', type: 'domain', code: 'M01.01' },
        { id: 'M01.02-2', title: '数与代数/数量关系', type: 'domain', code: 'M01.02' },
        { id: 'M02.01-2', title: '图形与几何/图形的认识', type: 'domain', code: 'M02.01' },
        { id: 'M03.01-2', title: '统计与概率/数据分类', type: 'domain', code: 'M03.01' },
        { id: 'M04.01-2', title: '综合与实践', type: 'domain', code: 'M04.01' }
      ]
    },
    {
      grade: '三年级',
      items: [
        { id: 'M01.01-3', title: '数与代数/数与运算', type: 'domain', code: 'M01.01' },
        { id: 'M02.01-3', title: '图形与几何/图形的认识', type: 'domain', code: 'M02.01' },
        { id: 'M02.02-3', title: '图形与几何/图形的位置', type: 'domain', code: 'M02.02' },
        { id: 'M03.02-3', title: '统计与概率/数据收集', type: 'domain', code: 'M03.02' },
        { id: 'M04.01-3', title: '综合与实践', type: 'domain', code: 'M04.01' }
      ]
    },
    {
      grade: '四年级',
      items: [
        { id: 'M01.01-4', title: '数与代数/数与运算', type: 'domain', code: 'M01.01' },
        { id: 'M02.01-4', title: '图形与几何/图形的认识', type: 'domain', code: 'M02.01' },
        { id: 'M03.01-4', title: '统计与概率/数据分类', type: 'domain', code: 'M03.01' },
        { id: 'M04.01-4', title: '综合与实践', type: 'domain', code: 'M04.01' }
      ]
    },
    {
      grade: '五年级',
      items: [
        { id: 'M01.01-5', title: '数与代数/数与运算', type: 'domain', code: 'M01.01' },
        { id: 'M03.01-5', title: '统计与概率/数据分类', type: 'domain', code: 'M03.01' },
        { id: 'M04.01-5', title: '综合与实践', type: 'domain', code: 'M04.01' }
      ]
    }
  ];
  
  const displayData = data.length > 0 ? data : defaultData;
  
  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="pr-4">
        <div className="flex items-center p-2 bg-slate-50 rounded-md mb-4">
          {getSubjectIcon()}
          <span className="ml-2 font-medium">
            {subject === 'math' ? '数学' : '学科'}
          </span>
        </div>
        
        {displayData.map(gradeGroup => {
          const isExpanded = expandedGrades.includes(gradeGroup.grade);
          
          return (
            <div key={gradeGroup.grade} className="mb-2">
              <Button
                variant="ghost"
                className="w-full justify-start p-2 font-medium"
                onClick={() => toggleGrade(gradeGroup.grade)}
              >
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4 mr-1" /> : 
                  <ChevronRight className="h-4 w-4 mr-1" />
                }
                {gradeGroup.grade}
              </Button>
              
              {isExpanded && (
                <div className="ml-6 space-y-1">
                  {gradeGroup.items.map(item => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-sm text-left",
                        selectedId === item.id && "bg-slate-100 font-medium"
                      )}
                      onClick={() => onSelectStandard(item.id)}
                    >
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">{item.code}</span>
                        <span className="truncate">{item.title}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
} 