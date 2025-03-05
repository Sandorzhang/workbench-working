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
  );
}

export default StudentCompetencyOverview; 