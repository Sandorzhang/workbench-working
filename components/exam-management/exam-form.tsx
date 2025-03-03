'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Exam } from '@/types/exam'

const examSchema = z.object({
  name: z.string().min(1, '考试名称不能为空'),
  subject: z.string().min(1, '学科不能为空'),
  grade: z.string().min(1, '年级不能为空'),
  semester: z.string().min(1, '学期不能为空'),
  startTime: z.string().min(1, '开始时间不能为空'),
  endTime: z.string().min(1, '结束时间不能为空'),
  status: z.enum(['published', 'draft']),
})

type ExamFormValues = z.infer<typeof examSchema>

const defaultValues: Partial<ExamFormValues> = {
  name: '',
  subject: '',
  grade: '',
  semester: '',
  startTime: '',
  endTime: '',
  status: 'draft',
}

interface ExamFormProps {
  examId?: string
}

export function ExamForm({ examId }: ExamFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = Boolean(examId)

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues,
  })

  // 如果是编辑模式，获取考试信息
  useEffect(() => {
    if (examId) {
      setIsLoading(true)
      fetch(`/api/exams/${examId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch exam')
          }
          return response.json()
        })
        .then(data => {
          // 忽略id字段，使用表单中的其他字段
          const { id, ...formData } = data
          
          // 调整时间格式以适应输入框
          const formattedData = {
            ...formData,
            startTime: formData.startTime ? formData.startTime.replace(' ', 'T').slice(0, 16) : '',
            endTime: formData.endTime ? formData.endTime.replace(' ', 'T').slice(0, 16) : '',
          }
          
          form.reset(formattedData)
        })
        .catch(error => {
          console.error('Error fetching exam:', error)
          toast({
            title: '获取考试信息失败',
            description: '请稍后再试',
            variant: 'destructive',
          })
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [examId, form])

  const onSubmit = async (data: ExamFormValues) => {
    setIsLoading(true)
    
    try {
      // 将日期格式转换回后端期望的格式
      const formattedData = {
        ...data,
        startTime: data.startTime.replace('T', ' '),
        endTime: data.endTime.replace('T', ' '),
      }
      
      const url = isEditing ? `/api/exams/${examId}` : '/api/exams'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      if (!response.ok) {
        throw new Error('Failed to save exam')
      }

      toast({
        title: isEditing ? '考试更新成功' : '考试创建成功',
        description: isEditing ? '考试信息已更新' : '新考试已创建',
      })

      router.push('/exam-management')
    } catch (error) {
      console.error('Error saving exam:', error)
      toast({
        title: '保存失败',
        description: '保存考试信息时出错',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三']
  const subjects = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '综合']
  const semesters = ['第一学期', '第二学期']

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>考试名称</FormLabel>
              <FormControl>
                <Input placeholder="请输入考试名称" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>学科</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择学科" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>年级</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择年级" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {grades.map(grade => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>学期</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择学期" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {semesters.map(semester => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>发布状态</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>开始时间</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>结束时间</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/exam-management')}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '保存中...' : isEditing ? '更新考试' : '创建考试'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 