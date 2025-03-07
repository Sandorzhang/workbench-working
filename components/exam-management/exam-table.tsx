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
import { MoreHorizontal, Edit, Trash, FileText } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Exam } from '@/features/exam-management/types'
import { useRouter } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { FileSpreadsheet } from 'lucide-react'

interface ExamTableProps {
  exams: Exam[]
  isLoading: boolean
  onRefresh: () => void
  onEdit: (examId: string) => void
}

export function ExamTable({ exams, isLoading, onRefresh, onEdit }: ExamTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleEdit = (id: string) => {
    onEdit(id)
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

  const handleViewDetails = (id: string) => {
    router.push(`/exam-management/detail/${id}`)
  }

  const getStatusBadge = (status: string) => {
    if (status === 'published') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">已发布</Badge>
    }
    return <Badge variant="secondary">草稿</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-sm text-muted-foreground">加载中...</span>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="font-medium">考试名称</TableHead>
            <TableHead className="font-medium">学科</TableHead>
            <TableHead className="font-medium">年级</TableHead>
            <TableHead className="font-medium">学期</TableHead>
            <TableHead className="font-medium">考试时间</TableHead>
            <TableHead className="font-medium">状态</TableHead>
            <TableHead className="text-right font-medium">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                <div className="flex flex-col items-center space-y-2">
                  <div className="rounded-full bg-muted p-4">
                    <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p>暂无考试数据</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEdit('')}
                    className="mt-2"
                  >
                    新增考试
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            exams.map((exam) => (
              <TableRow 
                key={exam.id} 
                className="group hover:bg-muted/40 cursor-pointer transition-colors"
                onClick={() => handleViewDetails(exam.id)}
              >
                <TableCell className="font-medium">{exam.name}</TableCell>
                <TableCell>{exam.subject}</TableCell>
                <TableCell>{exam.grade}</TableCell>
                <TableCell>{exam.semester}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">开始: {formatDateTime(exam.startTime)}</span>
                    <span className="text-xs text-muted-foreground mt-1">结束: {formatDateTime(exam.endTime)}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(exam.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">操作</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(exam.id)
                        }}
                        className="cursor-pointer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        详情
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(exam.id)
                        }}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(exam.id)
                        }}
                        disabled={deletingId === exam.id}
                      >
                        <Trash className="mr-2 h-4 w-4" />
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