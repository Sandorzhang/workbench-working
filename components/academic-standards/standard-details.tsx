'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calculator, Book, Award, Lightbulb, Download } from 'lucide-react';

// 标准目标类型
interface StandardObjective {
  id: string;
  content: string;
  type: 'knowledge' | 'skill' | 'attitude';
  code?: string;
}

// 详情类型
interface StandardDetails {
  id: string;
  title: string;
  description: string;
  code: string;
  grade: string;
  domain: string;
  objectives: StandardObjective[];
}

interface StandardDetailsProps {
  data?: StandardDetails;
  isLoading?: boolean;
}

export function StandardDetails({ data, isLoading = false }: StandardDetailsProps) {
  // 按类型过滤目标
  const filterObjectivesByType = (type: string) => {
    if (!data) return [];
    return data.objectives.filter(obj => obj.type === type);
  };
  
  // 默认数据（用于演示）
  const defaultData: StandardDetails = {
    id: 'M01.01.001',
    title: '能认、读、写10以内的数',
    description: 'M01.01数与代数/数与运算',
    code: 'M01.01.001',
    grade: '一年级',
    domain: '数与代数',
    objectives: [
      {
        id: 'o1',
        content: '能够认识10以内的数字符号',
        type: 'knowledge',
        code: 'K1'
      },
      {
        id: 'o2',
        content: '能够读出10以内的数',
        type: 'skill',
        code: 'S1'
      },
      {
        id: 'o3',
        content: '能够写出10以内的数字',
        type: 'skill',
        code: 'S2'
      },
      {
        id: 'o4',
        content: '理解数字与数量的对应关系',
        type: 'knowledge',
        code: 'K2'
      },
      {
        id: 'o5',
        content: '对数的认识有好奇心',
        type: 'attitude',
        code: 'A1'
      }
    ]
  };
  
  const displayData = data || defaultData;
  
  // 获取图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'knowledge':
        return <Book className="h-4 w-4" />;
      case 'skill':
        return <Calculator className="h-4 w-4" />;
      case 'attitude':
        return <Award className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        
        <Skeleton className="h-8 w-48" />
        
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{displayData.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="bg-slate-50">
            {displayData.grade}
          </Badge>
          <Badge variant="outline" className="bg-slate-50">
            {displayData.domain}
          </Badge>
          <span className="text-gray-500 text-sm">{displayData.code}</span>
        </div>
        <p className="text-gray-600 mt-3">{displayData.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">知识目标</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {filterObjectivesByType('knowledge').length} 项知识目标
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">技能目标</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {filterObjectivesByType('skill').length} 项技能目标
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">情感目标</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {filterObjectivesByType('attitude').length} 项情感目标
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">学业目标详情</h2>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          导出标准
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">全部目标</TabsTrigger>
          <TabsTrigger value="knowledge">知识目标</TabsTrigger>
          <TabsTrigger value="skill">技能目标</TabsTrigger>
          <TabsTrigger value="attitude">情感目标</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          {displayData.objectives.map(objective => (
            <Card key={objective.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div>
                    <Badge className={
                      objective.type === 'knowledge' ? 'bg-blue-500' :
                      objective.type === 'skill' ? 'bg-green-500' : 'bg-amber-500'
                    }>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(objective.type)}
                        <span>
                          {objective.type === 'knowledge' ? '知识' :
                           objective.type === 'skill' ? '技能' : '态度'}
                        </span>
                      </div>
                    </Badge>
                    <div className="mt-1 text-sm text-gray-500 ml-1">
                      {objective.code}
                    </div>
                  </div>
                  <p className="text-gray-800">{objective.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="knowledge" className="space-y-4 mt-4">
          {filterObjectivesByType('knowledge').map(objective => (
            <Card key={objective.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div>
                    <Badge className="bg-blue-500">
                      <div className="flex items-center gap-1">
                        <Book className="h-4 w-4" />
                        <span>知识</span>
                      </div>
                    </Badge>
                    <div className="mt-1 text-sm text-gray-500 ml-1">
                      {objective.code}
                    </div>
                  </div>
                  <p className="text-gray-800">{objective.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="skill" className="space-y-4 mt-4">
          {filterObjectivesByType('skill').map(objective => (
            <Card key={objective.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div>
                    <Badge className="bg-green-500">
                      <div className="flex items-center gap-1">
                        <Calculator className="h-4 w-4" />
                        <span>技能</span>
                      </div>
                    </Badge>
                    <div className="mt-1 text-sm text-gray-500 ml-1">
                      {objective.code}
                    </div>
                  </div>
                  <p className="text-gray-800">{objective.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="attitude" className="space-y-4 mt-4">
          {filterObjectivesByType('attitude').map(objective => (
            <Card key={objective.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div>
                    <Badge className="bg-amber-500">
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        <span>态度</span>
                      </div>
                    </Badge>
                    <div className="mt-1 text-sm text-gray-500 ml-1">
                      {objective.code}
                    </div>
                  </div>
                  <p className="text-gray-800">{objective.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
} 