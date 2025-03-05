'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { History, Calendar } from "lucide-react";

export interface Note {
  id?: string;
  date: string;
  content: string;
  author: string;
}

interface StudentTrackingProps {
  notes: Note[];
}

export function StudentTracking({ notes }: StudentTrackingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <History className="mr-2 h-5 w-5 text-indigo-500" />
          辅导记录
        </CardTitle>
        <CardDescription>
          该学生的辅导记录和笔记
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes && notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note, index) => (
                <div key={note.id || index} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{note.author}</span>
                    <span className="text-xs text-muted-foreground">{note.date}</span>
                  </div>
                  <p className="text-sm">{note.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">暂无辅导记录</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 