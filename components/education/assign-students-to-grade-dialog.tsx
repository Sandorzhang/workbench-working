import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  gender: string;
  age: number;
  class: string;
  grade: string;
  studentId: string;
  phone: string;
  guardian: string;
  status: string;
}

interface Grade {
  id: string;
  name: string;
  year: string;
  description?: string;
}

interface AssignStudentsToGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: Grade | null;
  onSuccess?: () => void;
}

export function AssignStudentsToGradeDialog({
  open,
  onOpenChange,
  grade,
  onSuccess
}: AssignStudentsToGradeDialogProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取所有学生
  useEffect(() => {
    if (open && grade) {
      fetchStudents();
    }
  }, [open, grade]);

  // 重置状态
  useEffect(() => {
    if (!open) {
      setSelectedStudentIds([]);
      setSearchQuery("");
    }
  }, [open]);

  // 获取学生数据
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error('获取学生列表失败');
      }
      const data = await response.json();
      
      // 过滤掉已经在该年级的学生
      const filteredStudents = data.filter((student: Student) => student.grade !== grade?.id);
      setStudents(filteredStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('获取学生列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理学生选择
  const handleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(student => student.id));
    }
  };

  // 提交分配
  const handleSubmit = async () => {
    if (!grade) return;
    
    if (selectedStudentIds.length === 0) {
      toast.warning('请至少选择一名学生');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/grades/${grade.id}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentIds: selectedStudentIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.hasClasses === false) {
          toast.error('该年级下没有班级，请先创建班级');
        } else {
          throw new Error('分配学生失败');
        }
        return;
      }

      const result = await response.json();
      toast.success(`成功将 ${result.addedStudentCount} 名学生分配到 ${grade.name}`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error assigning students:', error);
      toast.error('分配学生失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 过滤学生
  const filteredStudents = students.filter(student => {
    const searchLower = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.studentId.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>分配学生到年级</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
          {grade && (
            <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-md">
              <span className="font-medium">目标年级:</span>
              <span>{grade.name} ({grade.year}学年)</span>
            </div>
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="搜索学生姓名或学号..."
              className="pl-10 rounded-xl border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2 py-2">
                <Checkbox
                  id="select-all"
                  checked={selectedStudentIds.length > 0 && selectedStudentIds.length === filteredStudents.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="cursor-pointer">
                  {selectedStudentIds.length === 0 ? '全选' : 
                   selectedStudentIds.length === filteredStudents.length ? '取消全选' : 
                   `已选择 ${selectedStudentIds.length} 名学生`}
                </Label>
              </div>
              
              <ScrollArea className="flex-1 border rounded-md">
                {filteredStudents.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    {searchQuery ? '未找到匹配的学生' : '没有可分配的学生'}
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md transition-colors"
                      >
                        <Checkbox
                          id={`student-${student.id}`}
                          checked={selectedStudentIds.includes(student.id)}
                          onCheckedChange={() => handleStudentSelection(student.id)}
                        />
                        <Label htmlFor={`student-${student.id}`} className="flex-1 cursor-pointer">
                          <div className="flex justify-between">
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.studentId}</div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.gender} | {student.age}岁 | 监护人: {student.guardian}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          )}
        </div>
        
        <DialogFooter className="pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedStudentIds.length === 0 || isSubmitting}
            className="ml-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                处理中...
              </>
            ) : (
              `分配 ${selectedStudentIds.length} 名学生`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 