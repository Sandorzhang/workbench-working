'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Exam } from '@/types/exam'
import { useRouter } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

interface ExamTableProps {
  exams: Exam[]
  isLoading: boolean
  onRefresh: () => void
}

export function ExamTable({ exams, isLoading, onRefresh }: ExamTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleEdit = (id: string) => {
    router.push(`/exam-management/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除此考试吗？')) {
      setDeletingId(id)
      try {
        const response = await fetch(`/api/exams/${id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('删除考试失败')
        }
        
        toast({
          title: '删除成功',
          description: '考试已成功删除',
        })
        onRefresh()
      } catch (error) {
        console.error('Error deleting exam:', error)
        toast({
          title: '删除失败',
          description: '删除考试时出错',
          variant: 'destructive',
        })
      } finally {
        setDeletingId(null)
      }
    }
  }

  const statusMap = {
    published: '已发布',
    draft: '草稿',
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>考试ID</TableHead>
            <TableHead>考试名称</TableHead>
            <TableHead>学科</TableHead>
            <TableHead>年级</TableHead>
            <TableHead>学期</TableHead>
            <TableHead>考试开始时间</TableHead>
            <TableHead>考试截止时间</TableHead>
            <TableHead>发布状态</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-10">
                暂无考试数据
              </TableCell>
            </TableRow>
          ) : (
            exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell>{exam.id}</TableCell>
                <TableCell>{exam.name}</TableCell>
                <TableCell>{exam.subject}</TableCell>
                <TableCell>{exam.grade}</TableCell>
                <TableCell>{exam.semester}</TableCell>
                <TableCell>{formatDateTime(exam.startTime)}</TableCell>
                <TableCell>{formatDateTime(exam.endTime)}</TableCell>
                <TableCell>{statusMap[exam.status]}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">操作</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(exam.id)}>
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDelete(exam.id)}
                        disabled={deletingId === exam.id}
                      >
                        {deletingId === exam.id ? '删除中...' : '删除'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 