"use client";

import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Star, Info } from "lucide-react";
import { CompetencyWheel } from "../competency-wheel/competency-wheel";
import { CompetencyDetail } from "./competency-detail";
import { CompetencyDimension } from "@/types/models/competency";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function StudentCompetency() {
  const [selectedCompetency, setSelectedCompetency] =
    useState<CompetencyDimension | null>(null);

  const handleDimensionClick = useCallback((dimension: CompetencyDimension) => {
    setSelectedCompetency(dimension);
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedCompetency(null);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Star className="mr-2 h-5 w-5 text-amber-500" />
          学生素养概览
        </CardTitle>
        <CardDescription>学生核心素养与能力发展维度图谱</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wheel" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="wheel">轮盘视图</TabsTrigger>
            <TabsTrigger value="list">列表视图</TabsTrigger>
          </TabsList>

          <TabsContent value="wheel" className="w-full">
            <div className="md:grid md:grid-cols-3 gap-4">
              <div className="col-span-2 relative">
                <div className="bg-slate-50 rounded-md border p-4 mb-4 relative">
                  <TooltipProvider>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-medium">素养能力轮盘</h3>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-slate-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="flex flex-col gap-2 p-1">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                              <span className="text-xs">已完成</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 border border-amber-500 border-dashed rounded-sm"></div>
                              <span className="text-xs">进行中</span>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>

                  <div
                    className="relative"
                    onClick={(e) => {
                      if (e.currentTarget === e.target) {
                        resetSelection();
                      }
                    }}
                  >
                    <CompetencyWheel onDimensionClick={handleDimensionClick} />

                    {!selectedCompetency && (
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-sm text-center">
                        <p className="text-xs text-slate-600">
                          点击轮盘选择一个维度查看详情
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <div className="bg-slate-50 rounded-md border p-4 h-full">
                  {selectedCompetency ? (
                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <span>{selectedCompetency.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {selectedCompetency.level || "初级"}
                        </Badge>
                      </h3>
                      <CompetencyDetail competency={selectedCompetency} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                      <Info className="h-8 w-8 mb-2 text-slate-400" />
                      <p className="text-sm">
                        请先在左侧轮盘中选择一个素养维度
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list">
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
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        素养维度
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        当前水平
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        说明
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* 这里将显示所有素养维度的数据 */}
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
