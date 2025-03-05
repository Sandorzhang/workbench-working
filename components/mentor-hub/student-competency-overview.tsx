"use client";

import React, { useState } from "react";
import { CompetencyWheel } from "@/components/competency-wheel/competency-wheel";
import { CompetencyDetail } from "./competency-detail";
import { CompetencyDimension } from "@/types/competency";

interface StudentCompetencyOverviewProps {
  isLoading?: boolean;
}

export function StudentCompetencyOverview({ isLoading = false }: StudentCompetencyOverviewProps) {
  const [selectedCompetency, setSelectedCompetency] = useState<CompetencyDimension | null>(null);

  const handleDimensionClick = (dimension: any) => {
    setSelectedCompetency(dimension);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">学生素养概览</h2>
        <div className="text-xs text-gray-500">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="inline-block w-8 h-[2px] bg-gray-500"></span>
              <span>已完成</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-8 h-[2px] bg-gray-500" style={{ strokeDasharray: '4,2' }}></span>
              <span>进行中</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-8 h-[2px] bg-gray-500" style={{ strokeDasharray: '2,4' }}></span>
              <span>未开始</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-500">*</span>
              <span>高级项目</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <CompetencyWheel 
            isLoading={isLoading}
            onDimensionClick={handleDimensionClick}
            title=""
            description=""
          />
        </div>
        <div className="lg:col-span-2">
          <CompetencyDetail competency={selectedCompetency} />
        </div>
      </div>
    </div>
  );
}

export default StudentCompetencyOverview; 