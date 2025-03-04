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
import { AlertCircle, Edit, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Question, LearningObjective } from '@/types/question'
import { QuestionDialog } from './question-dialog'
import { Exam } from '@/types/exam'

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
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>([])
  const [isLoadingObjectives, setIsLoadingObjectives] = useState(false)
  const [examInfo, setExamInfo] = useState<Partial<Exam> | null>(null)

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
    setIsLoadingObjectives(true)
    try {
      // 使用考试学科或传入的学科参数
      const subject = examInfo?.subject || examSubject
      const response = await fetch(`/api/learning-objectives?subject=${encodeURIComponent(subject)}`)
      if (!response.ok) {
        throw new Error('获取学业目标失败')
      }
      const data = await response.json()
      setLearningObjectives(data)
    } catch (error) {
      console.error('获取学业目标出错:', error)
      toast({
        title: '获取学业目标失败',
        description: '请稍后再试',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingObjectives(false)
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
    setIsLoading(true)
    try {
      let updatedQuestion: Question
      
      if (data.id) {
        // 更新现有题目
        const response = await fetch(`/api/questions/${data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        
        if (!response.ok) {
          // 尝试详细记录错误响应
          const responseText = await response.text();
          console.error('错误响应原始内容:', responseText);
          
          let errorMessage = '更新题目失败';
          try {
            const errorData = JSON.parse(responseText);
            if (errorData && errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (parseError) {
            console.error('解析错误响应失败:', parseError);
          }
          
          throw new Error(errorMessage);
        }
        
        updatedQuestion = await response.json()
        
        // 更新本地题目列表
        const updatedQuestions = questions.map(q => 
          q.id === updatedQuestion.id ? updatedQuestion : q
        )
        
        onQuestionsUpdate(updatedQuestions)
        toast({
          title: '题目已更新',
          description: '题目信息已成功更新',
        })
      } else {
        // 创建新题目
        const response = await fetch('/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            examId,
          }),
        })
        
        if (!response.ok) {
          // 尝试详细记录错误响应
          const responseText = await response.text();
          console.error('错误响应原始内容:', responseText);
          
          let errorMessage = '创建题目失败';
          try {
            const errorData = JSON.parse(responseText);
            if (errorData && errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (parseError) {
            console.error('解析错误响应失败:', parseError);
          }
          
          throw new Error(errorMessage);
        }
        
        updatedQuestion = await response.json()
        
        // 更新本地题目列表
        onQuestionsUpdate([...questions, updatedQuestion])
        toast({
          title: '题目已添加',
          description: '新题目已成功添加到考试中',
        })
      }
      
      // 关闭对话框
      setDialogOpen(false)
    } catch (error) {
      console.error('保存题目出错:', error);
      
      // 确保错误消息正确显示
      let errorMessage = '保存题目时出现错误，请稍后再试';
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      
      // 使用具体的错误消息
      toast({
        title: '操作失败',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 删除题目
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('确定要删除这个题目吗？此操作无法撤销。')) {
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('删除题目失败')
      }
      
      // 更新本地题目列表
      const updatedQuestions = questions.filter(q => q.id !== questionId)
      onQuestionsUpdate(updatedQuestions)
      
      toast({
        title: '题目已删除',
        description: '题目已成功从考试中移除',
      })
    } catch (error) {
      console.error('删除题目出错:', error)
      toast({
        title: '删除失败',
        description: '删除题目时出现错误，请稍后再试',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>题目管理</CardTitle>
        <Button 
          onClick={() => handleAddEditQuestion()} 
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          添加题目
        </Button>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>暂无题目</AlertTitle>
            <AlertDescription>
              该考试还没有添加任何题目，点击"添加题目"按钮开始创建。
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
        
        <QuestionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          question={selectedQuestion}
          learningObjectives={learningObjectives}
          isLoading={isLoading}
          examSubject={examInfo?.subject || examSubject}
          onSubmit={handleQuestionDialogSubmit}
        />
      </CardContent>
    </Card>
  )
} 