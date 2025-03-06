'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExamTable } from '@/components/exam-management/exam-table'
import { HeroSection } from '@/components/ui/hero-section'
import { PlusCircle, FileSpreadsheet, Search, Info } from 'lucide-react'
import { Exam } from '@/types/exam'
import { Card, CardContent } from '@/components/ui/card'
import { ExamDialog } from '@/components/exam-management/exam-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function ExamManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // 弹窗状态
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedExamId, setSelectedExamId] = useState<string | undefined>(undefined)

  const fetchExams = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/exams')
      if (!response.ok) {
        throw new Error('Failed to fetch exams')
      }
      const data = await response.json()
      setExams(data.exams || [])
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 解析搜索词，支持空格分隔和引号包裹
  const parseSearchTerms = (input: string): string[] => {
    const result: string[] = [];
    let currentTerm = '';
    let inQuotes = false;
    
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      
      if (char === ' ' && !inQuotes) {
        if (currentTerm) {
          result.push(currentTerm);
          currentTerm = '';
        }
      } else {
        currentTerm += char;
      }
    }
    
    if (currentTerm) {
      result.push(currentTerm);
    }
    
    return result.filter(term => term.trim().length > 0);
  }

  const filteredExams = useMemo(() => {
    if (!searchTerm.trim()) return exams;
    
    const searchTerms = parseSearchTerms(searchTerm);
    
    return exams.filter(exam => {
      // 如果没有搜索词，显示所有考试
      if (searchTerms.length === 0) return true;
      
      // 检查每个搜索词是否匹配
      return searchTerms.every(term => {
        const lowerCaseTerm = term.toLowerCase();
        
        return (
          exam.name.toLowerCase().includes(lowerCaseTerm) ||
          exam.subject.toLowerCase().includes(lowerCaseTerm) ||
          exam.grade.toLowerCase().includes(lowerCaseTerm) ||
          exam.semester.toLowerCase().includes(lowerCaseTerm) ||
          (exam.status === 'published' && '已发布'.includes(lowerCaseTerm)) ||
          (exam.status === 'draft' && '草稿'.includes(lowerCaseTerm))
        );
      });
    });
  }, [exams, searchTerm]);

  // 打开新增考试弹窗
  const handleAddExam = () => {
    setSelectedExamId(undefined)
    setDialogOpen(true)
  }

  // 打开编辑考试弹窗
  const handleEditExam = (examId: string) => {
    setSelectedExamId(examId)
    setDialogOpen(true)
  }

  const searchInstructions = `
    搜索语法：
    • 输入多个关键词（以空格分隔）可同时匹配多个条件
    • 使用引号包裹短语进行精确匹配，如 "期末考试"
    • 例如：语文 "高一" 可搜索高一年级的语文考试
  `;

  return (
    <div className="h-full flex flex-col">
      <HeroSection
        title="考试管理"
        description="创建、编辑和管理各类考试及试卷，支持考试数据分析和成绩管理。"
        icon={FileSpreadsheet}
        gradient="from-amber-50 to-orange-50"
        actions={
          <Button 
            onClick={handleAddExam} 
            className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            新增考试
          </Button>
        }
      />
      
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div className="relative w-full max-w-md flex items-center">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索考试名称、学科、年级..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 h-10 rounded-lg border-border pr-10"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs whitespace-pre-line">{searchInstructions}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-sm text-muted-foreground">
              {!isLoading && `共 ${filteredExams.length} 个考试记录`}
            </div>
          </div>
          
          <ExamTable 
            exams={filteredExams} 
            isLoading={isLoading} 
            onRefresh={fetchExams}
            onEdit={handleEditExam} 
          />
        </CardContent>
      </Card>

      {/* 考试编辑/新增弹窗 */}
      <ExamDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        examId={selectedExamId}
        onSuccess={fetchExams}
      />
    </div>
  )
} 