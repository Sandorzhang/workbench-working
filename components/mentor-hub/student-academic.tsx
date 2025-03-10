'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export interface AcademicRecord {
  id?: string;
  subject: string;
  score: number;
  date: string;
  type: string;
  rank?: string;
  comment?: string;
}

interface StudentAcademicProps {
  records: AcademicRecord[];
}

export function StudentAcademic({ records }: StudentAcademicProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
          学业记录
        </CardTitle>
        <CardDescription>
          该学生的学习成绩和考试记录
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records && records.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学科</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成绩</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record, index) => (
                    <tr key={record.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{record.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant={record.score >= 90 ? "default" : record.score >= 60 ? "secondary" : "destructive"}>
                          {record.score}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{record.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.rank || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">暂无学业记录</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 