'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { Question } from '@/types/question'
import { Input } from '@/components/ui/input'
import { Loader2, Save } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface BulkScoreDialogProps {
  examId: string
  questions: Question[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onQuestionsUpdate: (questions: Question[]) => void
}

export function BulkScoreDialog({
  examId,
  questions,
  open,
  onOpenChange,
  onQuestionsUpdate,
}: BulkScoreDialogProps) {
  const [scores, setScores] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalScore, setTotalScore] = useState(0)

  // 初始化分数
  useEffect(() => {
    if (open && questions.length > 0) {
      const initialScores: Record<string, number> = {}
      questions.forEach(question => {
        initialScores[question.id] = question.score
      })
      setScores(initialScores)
      updateTotalScore(initialScores)
    }
  }, [open, questions])

  // 更新总分
  const updateTotalScore = (currentScores: Record<string, number>) => {
    const total = Object.values(currentScores).reduce((sum, score) => sum + (score || 0), 0)
    setTotalScore(total)
  }

  // 处理分数变更
  const handleScoreChange = (questionId: string, value: string) => {
    // 验证并解析分数
    let score = parseFloat(value)
    if (isNaN(score)) score = 0
    if (score < 0) score = 0
    if (score > 100) score = 100

    const newScores = {
      ...scores,
      [questionId]: score,
    }
    
    setScores(newScores)
    updateTotalScore(newScores)
  }

  // 处理确认更新
  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // 准备提交数据
      const updatedQuestionsData = questions.map(question => ({
        ...question,
        score: scores[question.id] || 0
      }))
      
      // 调用批量更新API
      const response = await fetch(`/api/questions/bulk-update-scores`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId,
          questions: updatedQuestionsData.map(q => ({
            id: q.id,
            score: q.score
          }))
        }),
      })
      
      if (!response.ok) {
        throw new Error('更新分数失败')
      }
      
      // 更新本地题目列表
      onQuestionsUpdate(updatedQuestionsData)
      
      toast({
        title: '分数已更新',
        description: `已成功更新 ${questions.length} 道题目的分数，总分为 ${totalScore} 分`,
      })
      
      // 关闭对话框
      onOpenChange(false)
    } catch (error) {
      console.error('批量更新分数出错:', error)
      toast({
        title: '更新失败',
        description: error instanceof Error ? error.message : '更新分数时出现错误，请稍后再试',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 处理单个题目分值设置
  const handleApplyScoreToAll = (value: string) => {
    const score = parseFloat(value)
    if (isNaN(score) || score < 0 || score > 100) {
      toast({
        title: '无效的分值',
        description: '请输入0-100之间的有效分值',
        variant: 'destructive',
      })
      return
    }
    
    // 将所有题目设置为相同分值
    const newScores: Record<string, number> = {}
    questions.forEach(question => {
      newScores[question.id] = score
    })
    
    setScores(newScores)
    updateTotalScore(newScores)
    
    toast({
      title: '批量设置完成',
      description: `已将所有题目分值设置为 ${score} 分`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>批量设置分值</DialogTitle>
          <DialogDescription>
            快速为所有题目设置分值，修改后点击保存以更新所有题目
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
            <div className="text-sm">
              <span className="font-medium">统一设置分值: </span>
              <span className="text-muted-foreground">(将所有题目设为相同分值)</span>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                className="w-20"
                placeholder="分值"
                min="0"
                max="100"
                step="0.5"
                onBlur={(e) => handleApplyScoreToAll(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyScoreToAll((e.target as HTMLInputElement).value)}
              />
              <Button 
                variant="secondary" 
                size="sm"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement
                  handleApplyScoreToAll(input.value)
                }}
              >
                应用
              </Button>
            </div>
          </div>
          
          <div className="border rounded-md max-h-[40vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-16">题号</TableHead>
                  <TableHead>学业目标</TableHead>
                  <TableHead className="w-32 text-right">分值</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{question.questionNumber}</TableCell>
                    <TableCell className="max-w-md truncate">
                      <div className="flex flex-col">
                        <span>{question.learningObjective}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {question.description || '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={scores[question.id] || 0}
                        onChange={(e) => handleScoreChange(question.id, e.target.value)}
                        min="0"
                        max="100"
                        step="0.5"
                        className="w-20 ml-auto"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-md">
            <span className="text-sm">题目总数: <strong>{questions.length}</strong></span>
            <span className="text-lg font-medium">总分: <strong>{totalScore}</strong> 分</span>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存分值
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 