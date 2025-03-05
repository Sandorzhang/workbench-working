"use client";

import React, { useState } from "react";
import { CompetencyWheel } from "@/components/competency-wheel/competency-wheel";
import { CompetencyDetail } from "./competency-detail";

interface CompetencyDimension {
  id: string;
  name: string;
  color: string;
  level: 1 | 2 | 3;
  parentId?: string;
  progress?: number;
  status?: 'completed' | 'in-progress' | 'pending';
  score?: number;
  description?: string;
  lastUpdated?: string;
  skills?: string[];
  children?: any[];
}

interface StudentCompetencyOverviewProps {
  isLoading?: boolean;
}

export function StudentCompetencyOverview({ isLoading = false }: StudentCompetencyOverviewProps) {
  const [selectedCompetency, setSelectedCompetency] = useState<CompetencyDimension | null>(null);

  const handleDimensionClick = (dimension: any) => {
    setSelectedCompetency(dimension);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <CompetencyWheel 
          isLoading={isLoading}
          onDimensionClick={handleDimensionClick}
          title="素养概览"
          description="学生核心素养与能力发展维度"
        />
      </div>
      <div className="lg:col-span-1">
        <CompetencyDetail competency={selectedCompetency} />
      </div>
    </div>
  );
}

export default StudentCompetencyOverview; 