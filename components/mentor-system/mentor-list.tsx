"use client";

import React from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Mentor } from "@/lib/types";

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
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onSelectMentor(mentor)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={mentor.avatar} alt={mentor.name} />
                <AvatarFallback>{mentor.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{mentor.name}</h4>
                    <p className="text-sm text-gray-500">
                      {mentor.title} · {mentor.department}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    查看详情
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>指导学生: {mentor.students?.length || 0}人</span>
                  {mentor.students && mentor.students.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
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
        <div className="text-center py-8 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">暂无导师数据</p>
        </div>
      )}
    </div>
  );
} 