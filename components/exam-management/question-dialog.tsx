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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Question, LearningObjective } from '@/types/question'
import { CheckCircle2, Image, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

// 表单验证架构
const questionSchema = z.object({
  questionNumber: z.string().min(1, '题号不能为空'),
  learningObjective: z.string().min(1, '请选择学业目标'),
  score: z.coerce.number().min(0.5, '分值不能小于0.5').max(100, '分值不能超过100'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
})

type QuestionFormValues = z.infer<typeof questionSchema>

const defaultValues: Partial<QuestionFormValues> = {
  questionNumber: '',
  learningObjective: '',
  score: 1,
  description: '',
  imageUrl: '',
}

interface QuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: Question | null
  learningObjectives: LearningObjective[]
  isLoading: boolean
  examSubject: string // 添加考试学科属性
  onSubmit: (data: Partial<Question>) => void
}

export function QuestionDialog({
  open,
  onOpenChange,
  question,
  learningObjectives,
  isLoading,
  examSubject,
  onSubmit,
}: QuestionDialogProps) {
  const isEditing = Boolean(question?.id)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // 设置表单
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues,
    mode: 'onChange',
  })

  // 当对话框打开或题目变化时重置表单
  useEffect(() => {
    if (open) {
      if (question) {
        form.reset({
          questionNumber: question.questionNumber,
          learningObjective: question.learningObjective,
          score: question.score,
          description: question.description || '',
          imageUrl: question.imageUrl || '',
        })
        setImagePreview(question.imageUrl || null)
      } else {
        form.reset(defaultValues)
        setImagePreview(null)
      }
    }
  }, [open, question, form])

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: '文件类型错误',
        description: '请上传图片文件',
        variant: 'destructive',
      })
      return
    }

    // 检查文件大小（限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '图片大小不能超过2MB',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)

    try {
      // 在实际应用中，这里应该上传图片到服务器
      // 这里我们模拟上传过程，并使用本地URL预览
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setImagePreview(imageUrl)
        form.setValue('imageUrl', imageUrl)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('图片上传失败:', error)
      toast({
        title: '图片上传失败',
        description: '请稍后再试',
        variant: 'destructive',
      })
      setIsUploading(false)
    }
  }

  // 移除图片
  const handleRemoveImage = () => {
    setImagePreview(null)
    form.setValue('imageUrl', '')
  }

  // 处理表单提交
  const handleSubmit = (data: QuestionFormValues) => {
    const submissionData: Partial<Question> = {
      ...data,
    }

    if (isEditing && question?.id) {
      submissionData.id = question.id
    }

    onSubmit(submissionData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '编辑题目' : '添加题目'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? '修改题目信息和分值' : '添加新题目并设置学业目标和分值'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="questionNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>题号</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：1、2a、3-1" {...field} />
                  </FormControl>
                  <FormDescription>
                    输入题目的编号，可以是数字或字母组合（同一考试中题号不能重复）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="learningObjective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>学业目标</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择学业目标" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {learningObjectives.length === 0 ? (
                        <div className="p-2 text-center text-muted-foreground">
                          {isLoading ? '加载中...' : '暂无学业目标数据'}
                        </div>
                      ) : (
                        learningObjectives.map((objective) => (
                          <SelectItem key={objective.id || objective.code} value={objective.code}>
                            <div className="flex flex-col">
                              <span className="font-medium">{objective.code}</span>
                              <span className="text-xs text-muted-foreground truncate max-w-[320px]">
                                {objective.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    选择对应的学业目标，这些目标与{examSubject}学科的教学内容和评价标准相关联
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分值</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0.5}
                      max={100}
                      step={0.5}
                      placeholder="输入分值"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    设置题目的分值，最小0.5分，最大100分
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>题目描述（可选）</FormLabel>
                  <FormControl>
                    <Input placeholder="简要描述题目内容" {...field} />
                  </FormControl>
                  <FormDescription>
                    可选填写题目的简要描述，便于识别
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>题目图片（可选）</FormLabel>
                  <div className="space-y-2">
                    {!imagePreview ? (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 bg-gray-50">
                        <Label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          <Image className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm font-medium text-gray-600">点击上传图片</span>
                          <span className="text-xs text-gray-400 mt-1">支持 JPG, PNG, GIF 格式</span>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                        </Label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="题目图片"
                          className="max-h-[200px] rounded-md mx-auto object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={handleRemoveImage}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {isUploading && (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">上传中...</span>
                      </div>
                    )}
                    <input type="hidden" {...field} />
                  </div>
                  <FormDescription>
                    可选上传题目相关的图片，如题目图表、公式等
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading || isUploading}
              >
                取消
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isUploading}
                className={cn(
                  isLoading ? "opacity-80" : ""
                )}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditing ? '保存中...' : '添加中...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {isEditing ? '保存题目' : '添加题目'}
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 