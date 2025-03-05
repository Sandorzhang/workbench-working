"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Star, CheckCircle, Clock, AlertCircle } from "lucide-react";

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

interface CompetencyDetailProps {
  competency: CompetencyDimension | null;
}

export function CompetencyDetail({ competency }: CompetencyDetailProps) {
  if (!competency) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>素养详情</CardTitle>
          <CardDescription>请选择一个维度查看详细信息</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground p-8">
          点击左侧素养轮中的任意维度查看详情
        </CardContent>
      </Card>
    );
  }

  // 基于状态显示对应的图标
  const StatusIcon = () => {
    if (!competency.status) return null;
    
    switch (competency.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader 
        className="pb-3 space-y-1.5 bg-gradient-to-r border-b border-gray-100/90"
        style={{ 
          backgroundImage: competency.color 
            ? `linear-gradient(to right, ${competency.color}15, ${competency.color}05)` 
            : 'linear-gradient(to right, rgba(243, 244, 246, 0.5), white)' 
        }}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center">
            <span 
              className="h-3 w-3 rounded-full mr-2 flex-shrink-0" 
              style={{ backgroundColor: competency.color || '#4f46e5' }}
            />
            {competency.name}
          </CardTitle>
          
          {competency.level > 1 && competency.status && (
            <Badge 
              className="flex items-center gap-1 font-normal"
              variant={
                competency.status === 'completed' ? 'default' : 
                competency.status === 'in-progress' ? 'secondary' : 'outline'
              }
            >
              <StatusIcon />
              <span>
                {competency.status === 'completed' ? '已完成' : 
                 competency.status === 'in-progress' ? '进行中' : '待开始'}
              </span>
            </Badge>
          )}
        </div>
        <CardDescription>
          {competency.level === 1 ? '一级维度' : 
           competency.level === 2 ? '二级维度' : '三级维度'}
           {competency.children && competency.children.length > 0 && ` · 包含 ${competency.children.length} 个子维度`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* 描述 */}
        {competency.description && (
          <div className="text-sm text-gray-600 leading-relaxed">
            {competency.description}
          </div>
        )}
        
        {/* 进度 */}
        {competency.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">完成度</span>
              <span className="font-medium">{competency.progress}%</span>
            </div>
            <Progress value={competency.progress} className="h-2" />
          </div>
        )}
        
        {/* 得分 */}
        {competency.score !== undefined && (
          <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">评估得分</span>
            <div className="flex items-center">
              <span className="font-semibold text-lg mr-1">{competency.score}</span>
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            </div>
          </div>
        )}
        
        {/* 技能列表 */}
        {competency.skills && competency.skills.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">相关技能</p>
            <div className="flex flex-wrap gap-2">
              {competency.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-gray-50/80">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      {competency.lastUpdated && (
        <CardFooter className="pt-0 px-4 pb-4">
          <p className="text-xs text-muted-foreground">
            最后更新: {competency.lastUpdated}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

export default CompetencyDetail; 