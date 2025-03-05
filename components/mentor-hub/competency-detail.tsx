"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Star, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { CompetencyDimension } from "@/types/competency";

interface CompetencyDetailProps {
  competency: CompetencyDimension | null;
}

export function CompetencyDetail({ competency }: CompetencyDetailProps) {
  if (!competency) {
    return (
      <Card className="h-full border-dashed">
        <CardContent className="flex flex-col items-center justify-center h-full py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
            <Star className="h-6 w-6 text-muted-foreground opacity-30" />
          </div>
          <h3 className="font-medium text-muted-foreground mb-1">请选择素养维度</h3>
          <p className="text-sm text-muted-foreground/70 max-w-[250px]">
            点击左侧轮盘的任一区域以查看详细信息
          </p>
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
    <Card className="h-full shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span 
              className="h-3 w-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: competency.color || '#4f46e5' }}
            />
            {competency.name}
          </CardTitle>
          
          {competency.status && (
            <Badge 
              variant={
                competency.status === 'completed' ? 'default' : 
                competency.status === 'in-progress' ? 'secondary' : 'outline'
              }
              className="flex items-center gap-1 font-normal"
            >
              <StatusIcon />
              <span>
                {competency.status === 'completed' ? '已掌握' : 
                 competency.status === 'in-progress' ? '学习中' : '待学习'}
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
      
      <CardContent className="space-y-4">
        {/* 进度 */}
        {competency.progress !== undefined && (
          <div>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-muted-foreground">掌握程度:</span>
              <span className="font-medium">{competency.progress}%</span>
            </div>
            <Progress value={competency.progress} className="h-2" />
          </div>
        )}

        {/* 描述 */}
        {competency.description && (
          <div>
            <h4 className="text-sm font-medium mb-1.5">素养描述</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {competency.description}
            </p>
          </div>
        )}
        
        {/* 得分 */}
        {competency.score !== undefined && (
          <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">评估得分</span>
            <div className="flex items-center">
              <span className="font-semibold text-lg mr-1">{competency.score}</span>
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            </div>
          </div>
        )}
        
        {/* 技能列表 */}
        {competency.skills && competency.skills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">相关技能</h4>
            <div className="flex flex-wrap gap-1.5">
              {competency.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="font-normal">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      {competency.lastUpdated && (
        <CardFooter className="pt-0 text-xs text-muted-foreground">
          最近更新: {competency.lastUpdated}
        </CardFooter>
      )}
    </Card>
  );
}

export default CompetencyDetail; 