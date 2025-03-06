'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertCircle, Edit, FileUp, Image as ImageIcon, Plus, Trash2, Calculator } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Question, LearningObjective } from '@/features/exam-management/question-types'
import { Exam } from '@/features/exam-management/types'
import { QuestionDialog } from './question-dialog'
import { PdfImportDialog } from './pdf-import-dialog'
import { BulkScoreDialog } from './bulk-score-dialog'
import { api } from '@/shared/api'

interface QuestionManagementProps {
  examId: string
  questions: Question[]
  examSubject?: string // 添加考试学科属性
  onQuestionsUpdate: (questions: Question[]) => void
}

export function QuestionManagement({
  examId,
  questions,
  examSubject = '综合', // 默认为综合
  onQuestionsUpdate,
}: QuestionManagementProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pdfImportDialogOpen, setPdfImportDialogOpen] = useState(false)
  const [bulkScoreDialogOpen, setBulkScoreDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>([])
  const [isLoadingObjectives, setIsLoadingObjectives] = useState(false)
  const [examInfo, setExamInfo] = useState<Partial<Exam> | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 获取考试信息
  useEffect(() => {
    const fetchExamInfo = async () => {
      try {
        const response = await fetch(`/api/exams/${examId}`)
        if (!response.ok) {
          throw new Error('获取考试信息失败')
        }
        const data = await response.json()
        setExamInfo(data)
      } catch (error) {
        console.error('获取考试信息出错:', error)
      }
    }

    fetchExamInfo()
  }, [examId])

  // 获取学业目标，根据考试学科筛选
  const fetchLearningObjectives = async () => {
    try {
      setIsLoading(true)
      // 使用考试学科作为筛选条件
      const response = await api.examManagement.getLearningObjectives(examSubject)
      setLearningObjectives(response.data)
    } catch (error) {
      console.error('获取学习目标失败:', error)
      toast({
        title: '加载失败',
        description: '无法加载学习目标数据',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 组件加载时获取学业目标
  useEffect(() => {
    if (examInfo?.subject || examSubject) {
      fetchLearningObjectives()
    }
  }, [examInfo?.subject, examSubject])

  // 添加/编辑题目
  const handleAddEditQuestion = (question: Question | null = null) => {
    setSelectedQuestion(question)
    setDialogOpen(true)
  }

  // 处理题目对话框提交
  const handleQuestionDialogSubmit = async (data: Partial<Question>) => {
    try {
      setIsSaving(true)
      
      if (selectedQuestion) {
        // 更新现有题目
        const updatedQuestion = await api.examManagement.updateQuestion(selectedQuestion.id, {
          ...data,
          examId
        })
        
        // 更新本地状态
        const updatedQuestions = questions.map(q => 
          q.id === updatedQuestion.data.id ? updatedQuestion.data : q
        )
        
        onQuestionsUpdate(updatedQuestions)
        toast({
          title: '题目已更新',
          description: '题目信息已成功更新',
        })
      } else {
        // 创建新题目
        const response = await api.examManagement.createQuestion({
          ...data,
          examId
        } as Omit<Question, 'id' | 'createdAt' | 'updatedAt'>)
        
        // 更新本地状态
        onQuestionsUpdate([...questions, response.data])
        toast({
          title: '题目已添加',
          description: '新题目已成功添加到考试中',
        })
      }
      
      // 关闭对话框
      setDialogOpen(false)
    } catch (error) {
      console.error('保存题目时出错:', error)
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '保存题目时出现错误',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 删除题目
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      setIsDeleting(true)
      
      await api.examManagement.deleteQuestion(questionId)
      
      // 更新本地状态
      const updatedQuestions = questions.filter(q => q.id !== questionId)
      onQuestionsUpdate(updatedQuestions)
      
      toast({
        title: '题目已删除',
        description: '题目已成功从考试中移除',
      })
    } catch (error) {
      console.error('删除题目时出错:', error)
      toast({
        title: '删除失败',
        description: '删除题目时出现错误，请稍后再试',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // 获取学业目标详情
  const getLearningObjectiveDetail = (code: string) => {
    return learningObjectives.find(obj => obj.code === code)
  }

  // 查看图片
  const handleViewImage = (imageUrl: string) => {
    // 在新窗口打开图片
    window.open(imageUrl, '_blank')
  }

  // 打开PDF导入对话框
  const handleOpenPdfImport = () => {
    // 检查考试是否已有题目
    if (questions.length > 0) {
      toast({
        title: '无法导入',
        description: '只有空的考试才能使用批量导入功能，请先删除所有题目后再试',
        variant: 'destructive',
      })
      return
    }
    
    setPdfImportDialogOpen(true)
  }

  // 处理PDF导入完成
  const handlePdfImportComplete = (importedQuestions: Question[]) => {
    onQuestionsUpdate(importedQuestions)
  }

  // 打开批量赋分对话框
  const handleOpenBulkScore = () => {
    // 检查考试是否有题目
    if (questions.length === 0) {
      toast({
        title: '无题目可赋分',
        description: '请先添加题目后再使用批量赋分功能',
        variant: 'destructive',
      })
      return
    }
    
    setBulkScoreDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>题目管理</CardTitle>
        <div className="flex gap-2">
          {/* 批量导入按钮 */}
          <Button 
            variant="outline"
            onClick={handleOpenPdfImport} 
            disabled={isLoading || questions.length > 0}
            title={questions.length > 0 ? "只有空的考试才能使用批量导入" : "导入PDF自动识别题目"}
          >
            <FileUp className="mr-2 h-4 w-4" />
            批量导入
          </Button>
          
          {/* 批量赋分按钮 */}
          <Button 
            variant="outline"
            onClick={handleOpenBulkScore} 
            disabled={isLoading || questions.length === 0}
          >
            <Calculator className="mr-2 h-4 w-4" />
            批量赋分
          </Button>
          
          {/* 添加题目按钮 */}
          <Button 
            onClick={() => handleAddEditQuestion()} 
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            添加题目
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>暂无题目</AlertTitle>
            <AlertDescription>
              该考试还没有添加任何题目，点击"添加题目"按钮开始创建，或使用"批量导入"功能导入PDF试卷。
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>题号</TableHead>
                    <TableHead>学业目标</TableHead>
                    <TableHead>分值</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>图片</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => {
                    const objective = getLearningObjectiveDetail(question.learningObjective)
                    
                    return (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">{question.questionNumber}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{question.learningObjective}</span>
                            {objective && (
                              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {objective.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{question.score}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {question.description || '-'}
                        </TableCell>
                        <TableCell>
                          {question.imageUrl ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewImage(question.imageUrl!)}
                              title="查看图片"
                            >
                              <ImageIcon className="h-4 w-4 text-blue-500" />
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">无</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAddEditQuestion(question)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">编辑</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteQuestion(question.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">删除</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-md">
              <span className="text-sm text-muted-foreground">总题数: {questions.length}</span>
              <span className="font-medium text-primary">总分: {questions.reduce((sum, q) => sum + q.score, 0)} 分</span>
            </div>
          </div>
        )}
        
        {/* 题目编辑对话框 */}
        <QuestionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          question={selectedQuestion}
          learningObjectives={learningObjectives}
          isLoading={isLoading}
          examSubject={examInfo?.subject || examSubject}
          onSubmit={handleQuestionDialogSubmit}
        />
        
        {/* PDF导入对话框 */}
        <PdfImportDialog
          examId={examId}
          open={pdfImportDialogOpen}
          onOpenChange={setPdfImportDialogOpen}
          onQuestionsImport={handlePdfImportComplete}
        />
        
        {/* 批量赋分对话框 */}
        <BulkScoreDialog
          examId={examId}
          questions={questions}
          open={bulkScoreDialogOpen}
          onOpenChange={setBulkScoreDialogOpen}
          onQuestionsUpdate={onQuestionsUpdate}
        />
      </CardContent>
    </Card>
  )
} 