"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  AlertTriangle, 
  FileQuestion, 
  FileText, 
  ClipboardList, 
  BookOpen, 
  AlertCircle, 
  FileSpreadsheet, 
  Calendar, 
  UserRound, 
  CheckSquare, 
  Users, 
  Lightbulb
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { RecordType, RecordStatus, recordTypeNames, recordStatusNames, recordStatusColors } from "@/features/mentor-system/types";
import { api } from '@/shared/api';

interface RecordDialogProps {
  studentId?: string;
  onRecordAdded?: () => void;
}

// 记录类型图标映射
const recordTypeIcons: Record<RecordType, React.ReactNode> = {
  intervention: <AlertTriangle className="w-4 h-4" />,
  referral: <FileQuestion className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
  plan504: <ClipboardList className="w-4 h-4" />,
  reportCardNotes: <BookOpen className="w-4 h-4" />,
  minorBehavior: <AlertCircle className="w-4 h-4" />,
  elementaryReportCard: <FileSpreadsheet className="w-4 h-4" />,
  attendance: <Calendar className="w-4 h-4" />,
  counselorMeeting: <UserRound className="w-4 h-4" />,
  task: <CheckSquare className="w-4 h-4" />,
  studentSupportMeeting: <Users className="w-4 h-4" />,
  accommodations: <Lightbulb className="w-4 h-4" />
};

export function RecordDialog({ studentId, onRecordAdded }: RecordDialogProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'typeSelect' | 'recordForm'>('typeSelect');
  const [selectedType, setSelectedType] = useState<RecordType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<RecordStatus>('notStarted');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 当组件接收到新的studentId prop时更新selectedStudentId
  useEffect(() => {
    if (studentId) {
      setSelectedStudentId(studentId);
    }
  }, [studentId]);

  // 如果没有传递studentId，尝试获取默认学生
  useEffect(() => {
    const fetchDefaultStudent = async () => {
      try {
        setIsLoading(true);
        // 使用新的API客户端获取默认学生
        const response = await api.mentorSystem.getDefaultStudent();
        
        if (response.success) {
          setSelectedStudentId(response.data.id);
        } else {
          console.error('获取默认学生失败:', response.message);
          toast({
            title: '获取默认学生失败',
            description: response.message || '请稍后再试',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('获取默认学生出错:', error);
        toast({
          title: '获取默认学生失败',
          description: '请稍后再试',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefaultStudent();
  }, [studentId]);

  // 处理记录类型选择
  const handleTypeSelect = (type: RecordType) => {
    setSelectedType(type);
    setView('recordForm');
  };

  // 返回到类型选择
  const handleBackToTypeSelect = () => {
    setView('typeSelect');
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: '标题不能为空',
        description: '请输入记录标题',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedStudentId) {
      toast({
        title: '未选择学生',
        description: '无法添加记录，请选择一个学生',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedType) {
      toast({
        title: '未选择记录类型',
        description: '请选择一个记录类型',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const recordData = {
        type: selectedType,
        title,
        content,
        status,
        createdBy: '当前教师', // 一般情况下这会从认证系统获取
      };
      
      console.log("🚀 [RecordDialog] 提交记录数据:", JSON.stringify(recordData, null, 2));
      
      // 使用新的API客户端添加记录
      const response = await api.mentorSystem.addStudentRecordById(
        selectedStudentId,
        recordData
      );
      
      console.log("🚀 [RecordDialog] 提交记录响应:", response);
      
      if (response.success) {
        toast({
          title: '添加成功',
          description: '学生记录已成功添加',
        });
        
        // 重置表单并通知父组件
        resetForm();
        setOpen(false);
        onRecordAdded?.();
      } else {
        console.error('添加记录失败:', response.message);
        toast({
          title: '添加失败',
          description: response.message || '请稍后再试',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('添加记录出错:', error);
      toast({
        title: '添加失败',
        description: error instanceof Error ? error.message : '请稍后再试',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 重置表单
  const resetForm = () => {
    setView('typeSelect');
    setSelectedType(null);
    setStatus('notStarted');
    setTitle('');
    setContent('');
  };
  
  // 关闭弹窗时重置表单
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium record-dialog-trigger"
        >
          <Plus className="mr-2 h-4 w-4" />
          添加记录
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        {view === 'typeSelect' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold mb-4">选择记录类型</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-3 py-4">
              {(Object.keys(recordTypeNames) as RecordType[]).map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="h-24 flex flex-col justify-center items-center p-2 gap-2 hover:bg-primary/5 hover:border-primary/30 group transition-all duration-200"
                  onClick={() => handleTypeSelect(type)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    {recordTypeIcons[type]}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{recordTypeNames[type]}</span>
                </Button>
              ))}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <span className="text-primary">{selectedType && recordTypeNames[selectedType]}</span>
                <span className="text-slate-500">记录</span>
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">记录状态</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(recordStatusNames) as RecordStatus[]).map((recordStatus) => (
                    <Button
                      key={recordStatus}
                      type="button"
                      variant="outline"
                      className={`h-9 px-3 border ${status === recordStatus ? recordStatusColors[recordStatus] : ''}`}
                      onClick={() => setStatus(recordStatus)}
                    >
                      {recordStatusNames[recordStatus]}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  标题
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入记录标题"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  内容
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="输入记录内容"
                  className="min-h-32"
                />
              </div>
              
              <DialogFooter className="flex justify-between items-center pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToTypeSelect}
                >
                  返回选择
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "提交中..." : "添加记录"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 