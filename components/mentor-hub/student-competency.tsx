'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, Info } from "lucide-react";
import { Indicator } from "@/types/student";
import { CompetencyWheel } from "@/components/competency-wheel/competency-wheel";
import { CompetencyDetail } from "./competency-detail";
import { CompetencyDimension } from "@/types/competency";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface StudentCompetencyProps {
  indicators: Indicator[];
  isLoading?: boolean;
}

export function StudentCompetency({ indicators, isLoading = false }: StudentCompetencyProps) {
  const [selectedCompetency, setSelectedCompetency] = useState<CompetencyDimension | null>(null);

  const handleDimensionClick = (dimension: CompetencyDimension) => {
    setSelectedCompetency(dimension);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Star className="mr-2 h-5 w-5 text-amber-500" />
          学生素养概览
        </CardTitle>
        <CardDescription>
          学生核心素养与能力发展维度图谱
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wheel" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="wheel" className="text-sm">轮盘视图</TabsTrigger>
              <TabsTrigger value="list" className="text-sm">列表视图</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 cursor-help">
                      <div className="w-6 h-1.5 bg-emerald-500 rounded-sm"></div>
                      <span className="text-xs text-muted-foreground">已完成</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">已达到预期水平的项目</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 cursor-help">
                      <div className="w-6 h-1.5 border-t-2 border-amber-500 border-dashed"></div>
                      <span className="text-xs text-muted-foreground">进行中</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">正在发展中的能力项目</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 cursor-help">
                      <span className="text-red-500 text-xs font-bold">*</span>
                      <span className="text-xs text-muted-foreground">高级项目</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">需要特别关注的发展项目</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <TabsContent value="wheel" className="mt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-slate-50 rounded-lg p-4 border border-slate-100">
                <CompetencyWheel 
                  isLoading={isLoading}
                  onDimensionClick={handleDimensionClick}
                  title=""
                  description=""
                />
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  点击轮盘上的维度查看详情
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium">维度详情</h3>
                  {selectedCompetency && (
                    <Badge variant="outline" className="text-xs">
                      {selectedCompetency.name}
                    </Badge>
                  )}
                </div>
                <CompetencyDetail competency={selectedCompetency} />
                {!selectedCompetency && (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <Info className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-muted-foreground text-sm">点击轮盘选择一个维度查看详情</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  以下是学生在各素养维度的表现水平
                </p>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">素养维度</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前水平</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">说明</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {indicators.map((indicator) => (
                      <tr key={indicator.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{indicator.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{width: `${(indicator.value / indicator.maxValue) * 100}%`}}
                              ></div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {indicator.value}/{indicator.maxValue}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{indicator.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 