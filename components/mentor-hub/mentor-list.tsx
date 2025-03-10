"use client";

import React from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Mentor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronRight, Users } from "lucide-react";

interface MentorListProps {
  mentors: Mentor[];
  onSelectMentor: (mentor: Mentor) => void;
}

export function MentorList({ mentors, onSelectMentor }: MentorListProps) {
  return (
    <div className="grid gap-4">
      {mentors.map((mentor) => (
        <Card 
          key={mentor.id} 
          className={cn(
            "cursor-pointer border border-gray-100/60 dark:border-gray-800/40 relative overflow-hidden",
            "bg-gradient-to-b from-white/80 to-white/95 dark:from-gray-900/80 dark:to-gray-900/95",
            "backdrop-blur-sm backdrop-filter",
            "shadow-sm hover:shadow-md transition-all duration-300 ease-in-out",
            "hover:translate-y-[-1px]"
          )}
          onClick={() => onSelectMentor(mentor)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12 border-2 border-primary/10 dark:border-primary/20 shadow-sm">
                <AvatarImage src={mentor.avatar} alt={mentor.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {mentor.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {mentor.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {mentor.title} · {mentor.department}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary hover:text-primary/90 hover:bg-primary/5 dark:hover:bg-primary/10 group"
                  >
                    查看详情
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                    <span>指导学生: {mentor.students?.length || 0}人</span>
                  </div>
                  {mentor.students && mentor.students.length > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 bg-green-50 text-green-700 hover:bg-green-100 border-green-100/50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30"
                    >
                      有学生
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {mentors.length === 0 && (
        <div className={cn(
          "text-center py-12 rounded-lg",
          "bg-gray-50/50 dark:bg-gray-800/30",
          "border border-gray-100/60 dark:border-gray-800/40",
          "backdrop-blur-sm backdrop-filter"
        )}>
          <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-700/30 mb-4">
            <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-muted-foreground">暂无导师数据</p>
        </div>
      )}
    </div>
  );
} 