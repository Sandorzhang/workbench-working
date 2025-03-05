'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  History,
  ArrowDownWideNarrow,
  ArrowDown,
  ArrowUp,
  FileText,
  ListFilter,
  Plus,
  AlertTriangle,
  FileQuestion,
  ClipboardList,
  BookOpen,
  AlertCircle,
  FileSpreadsheet,
  Calendar,
  UserRound,
  CheckCircle2,
  Users,
  Lightbulb,
  RefreshCcw
} from "lucide-react";
import { StudentRecord, RecordType, recordTypeNames, recordStatusNames, recordStatusColors } from '@/types/record';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { RecordDialog } from './record-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from '@/components/ui/use-toast';

export interface Note {
  id?: string;
  date: string;
  content: string;
  author: string;
}

interface StudentTrackingProps {
  studentId: string;
}

export function StudentTracking({ studentId }: StudentTrackingProps) {
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [typeFilter, setTypeFilter] = useState<RecordType | 'all'>('all');
  const [lastRefresh, setLastRefresh] = useState<string>(new Date().toISOString());

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      console.log("🔍 [StudentTracking] 开始获取学生记录，学生ID:", studentId);
      
      // 添加时间戳参数，确保不使用缓存的结果
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/student/${studentId}/records?t=${timestamp}`);
      console.log("🔍 [StudentTracking] 获取学生记录响应状态:", response.status);
      
      if (!response.ok) {
        console.error("🔍 [StudentTracking] 获取学生记录失败，状态码:", response.status);
        throw new Error('获取学生记录失败');
      }
      
      const data = await response.json();
      console.log("🔍 [StudentTracking] 获取到学生记录数量:", data.length);
      console.log("🔍 [StudentTracking] 获取到的学生记录:", JSON.stringify(data, null, 2));
      
      if (!Array.isArray(data)) {
        console.error("🔍 [StudentTracking] 获取到的数据不是数组:", data);
        throw new Error('获取到的学生记录数据格式不正确');
      }
      
      setRecords(data);
      setLastRefresh(new Date().toISOString());
    } catch (error) {
      console.error('🔍 [StudentTracking] 获取学生记录失败:', error);
      toast({
        variant: "destructive",
        title: "获取失败",
        description: "获取学生记录失败，请重试"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 当studentId变化时获取记录
  useEffect(() => {
    console.log("🔍 [StudentTracking] studentId改变，新值:", studentId);
    if (studentId) {
      fetchRecords();
    } else {
      console.warn("🔍 [StudentTracking] 没有提供studentId，无法获取记录");
    }
  }, [studentId]);

  // 添加对record-added事件的监听
  useEffect(() => {
    const handleRecordAdded = (event: CustomEvent) => {
      console.log("🔍 [StudentTracking] record-added事件被触发", event.detail);
      // 不管事件详情，都刷新当前学生的记录
      if (studentId) {
        console.log("🔍 [StudentTracking] 正在刷新学生ID的记录:", studentId);
        fetchRecords();
      }
    };

    console.log("🔍 [StudentTracking] 添加record-added事件监听器");
    window.addEventListener('record-added', handleRecordAdded as EventListener);
    
    return () => {
      console.log("🔍 [StudentTracking] 移除record-added事件监听器");
      window.removeEventListener('record-added', handleRecordAdded as EventListener);
    };
  }, [studentId]);

  // 添加对refresh-student-records事件的监听
  useEffect(() => {
    const handleRefreshRecords = (event: CustomEvent) => {
      console.log("🔍 [StudentTracking] refresh-student-records事件被触发");
      const detail = event.detail as { studentId: string };
      console.log("🔍 [StudentTracking] 事件详情:", detail);
      
      // 如果事件包含studentId且与当前一致，或者事件没有包含特定studentId，就刷新记录
      if (!detail || !detail.studentId || detail.studentId === studentId) {
        console.log("🔍 [StudentTracking] 开始刷新记录", 
          "事件studentId:", detail?.studentId || "无", 
          "当前studentId:", studentId);
        fetchRecords();
      } else {
        console.log("🔍 [StudentTracking] 事件studentId不匹配当前组件studentId，不刷新记录", 
          "事件studentId:", detail?.studentId, 
          "当前studentId:", studentId);
      }
    };

    console.log("🔍 [StudentTracking] 添加refresh-student-records事件监听器");
    window.addEventListener('refresh-student-records', handleRefreshRecords as EventListener);
    
    return () => {
      console.log("🔍 [StudentTracking] 移除refresh-student-records事件监听器");
      window.removeEventListener('refresh-student-records', handleRefreshRecords as EventListener);
    };
  }, [studentId]);

  const handleRecordAdded = () => {
    console.log("🔍 [StudentTracking] 本地记录添加回调被调用");
    fetchRecords();
  };

  // 按创建日期排序记录
  const sortedRecords = useMemo(() => {
    console.log("🔍 [StudentTracking] 排序记录，顺序:", sortOrder, "记录数量:", records.length);
    return [...records].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [records, sortOrder]);

  // 根据类型过滤记录
  const filteredRecords = useMemo(() => {
    const filtered = typeFilter === 'all' 
      ? sortedRecords 
      : sortedRecords.filter(record => record.type === typeFilter);
    console.log("🔍 [StudentTracking] 过滤记录，类型:", typeFilter, "过滤后记录数量:", filtered.length);
    return filtered;
  }, [sortedRecords, typeFilter]);

  // 获取记录类型对应的图标
  const getRecordTypeIcon = (type: RecordType) => {
    switch (type) {
      case 'intervention':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'referral':
        return <FileQuestion className="w-4 h-4 text-blue-500" />;
      case 'note':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'plan504':
        return <ClipboardList className="w-4 h-4 text-emerald-500" />;
      case 'reportCardNotes':
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'minorBehavior':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'elementaryReportCard':
        return <FileSpreadsheet className="w-4 h-4 text-cyan-500" />;
      case 'attendance':
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'counselorMeeting':
        return <UserRound className="w-4 h-4 text-pink-500" />;
      case 'task':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'studentSupportMeeting':
        return <Users className="w-4 h-4 text-sky-500" />;
      case 'accommodations':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center">
            <History className="mr-2 h-5 w-5 text-indigo-500" />
            学生记录
          </CardTitle>
          <CardDescription>
            该学生的辅导记录和笔记
          </CardDescription>
        </div>
        <RecordDialog studentId={studentId} onRecordAdded={handleRecordAdded} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            {records.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 justify-between">
                <div className="flex gap-2">
                  <Select
                    value={typeFilter}
                    onValueChange={(value) => setTypeFilter(value as RecordType | 'all')}
                  >
                    <SelectTrigger className="w-[160px] h-8">
                      <SelectValue placeholder="全部类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      {Object.keys(recordTypeNames).map((type) => (
                        <SelectItem key={type} value={type}>
                          {recordTypeNames[type as RecordType]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                  className="flex items-center gap-1 h-8"
                >
                  <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                  {sortOrder === 'newest' ? '最新优先' : '最早优先'}
                </Button>
              </div>
            )}
            
            <div className="space-y-4">
              {filteredRecords.length > 0 ? (
                <div className="space-y-4">
                  {filteredRecords.map((record) => (
                    <div key={record.id} className="bg-slate-50 rounded-lg p-4 border border-slate-100 hover:shadow-sm transition-all duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{record.title}</span>
                          <Badge variant="outline" className={recordStatusColors[record.status]}>
                            {recordStatusNames[record.status]}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          {getRecordTypeIcon(record.type)}
                          {recordTypeNames[record.type]}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          创建人: {record.createdBy}
                        </span>
                      </div>
                      <p className="text-sm">{record.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
                  <FileQuestion className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
                  <h3 className="text-lg font-medium mb-1">没有找到记录</h3>
                  {records.length > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      尝试更改过滤条件或选择不同的排序方式
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      点击"添加记录"按钮开始为该学生记录信息
                    </p>
                  )}
                  <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={fetchRecords} className="mr-2">
                      <RefreshCcw className="w-4 h-4 mr-1" />
                      刷新
                    </Button>
                    <RecordDialog studentId={studentId} onRecordAdded={handleRecordAdded} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 