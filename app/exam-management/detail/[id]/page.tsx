'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'
import { QuestionManagement } from '@/components/exam-management/question-management'
import { Question } from '@/types/question'
import { Exam } from '@/types/exam'

interface DetailPageProps {
  params: {
    id: string
  }
}

export default function ExamDetailPage({ params }: DetailPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [totalScore, setTotalScore] = useState(0)

  // 获取考试详情和题目
  useEffect(() => {
    const fetchExamDetails = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/exams/${params.id}/details`)
        if (!response.ok) {
          throw new Error('获取考试详情失败')
        }
        
        const data = await response.json()
        setExam(data)
        setQuestions(data.questions || [])
        setTotalScore(data.totalScore || 0)
      } catch (error) {
        console.error('获取考试详情出错:', error)
        toast({
          title: '获取考试详情失败',
          description: '请稍后再试',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchExamDetails()
  }, [params.id])

  // 处理题目更新
  const handleQuestionsUpdate = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions)
    // 重新计算总分
    const newTotalScore = updatedQuestions.reduce((sum, q) => sum + q.score, 0)
    setTotalScore(newTotalScore)
  }

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    if (status === 'published') {
      return <Badge className="bg-green-500">已发布</Badge>
    }
    return <Badge variant="outline">草稿</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">加载考试详情...</p>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">未找到考试</h2>
        <p className="text-muted-foreground">该考试可能已被删除或不存在</p>
        <Button onClick={() => router.push('/exam-management')}>返回考试列表</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">考试名称</h3>
              <p className="mt-1 text-lg font-medium">{exam.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">科目</h3>
              <p className="mt-1 text-lg font-medium">{exam.subject}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">年级</h3>
              <p className="mt-1 text-lg font-medium">{exam.grade}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">学期</h3>
              <p className="mt-1 text-lg font-medium">{exam.semester}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">状态</h3>
              <p className="mt-1">{getStatusBadge(exam.status)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">总分</h3>
              <p className="mt-1 text-lg font-medium text-primary">{totalScore} 分</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">开始时间</h3>
              <p className="mt-1">
                {exam.startTime ? format(new Date(exam.startTime), 'yyyy-MM-dd HH:mm') : '未设置'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">结束时间</h3>
              <p className="mt-1">
                {exam.endTime ? format(new Date(exam.endTime), 'yyyy-MM-dd HH:mm') : '未设置'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">题目管理</TabsTrigger>
          <TabsTrigger value="scores" disabled>学生成绩</TabsTrigger>
          <TabsTrigger value="analysis" disabled>成绩分析</TabsTrigger>
        </TabsList>
        <TabsContent value="questions" className="mt-4">
          <QuestionManagement
            examId={params.id}
            questions={questions}
            examSubject={exam.subject}
            onQuestionsUpdate={handleQuestionsUpdate}
          />
        </TabsContent>
        <TabsContent value="scores">
          <Card>
            <CardHeader>
              <CardTitle>学生成绩</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">此功能正在开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>成绩分析</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">此功能正在开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 