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
import { Progress } from '@/components/ui/progress'
import { FileUp, File, Loader2, CheckCircle2 } from 'lucide-react'
import { Question } from '@/features/exam-management/question-types'
import { cn } from '@/shared/lib/utils'
import { api } from '@/shared/api'

interface PdfImportDialogProps {
  examId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onQuestionsImport: (questions: Question[]) => void
}

export function PdfImportDialog({
  examId,
  open,
  onOpenChange,
  onQuestionsImport,
}: PdfImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processStatus, setProcessStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')
  const [importedQuestions, setImportedQuestions] = useState<Question[]>([])

  // 重置状态当对话框关闭
  useEffect(() => {
    if (!open) {
      setSelectedFile(null)
      setIsUploading(false)
      setIsProcessing(false)
      setProgress(0)
      setProcessStatus('idle')
      setImportedQuestions([])
    }
  }, [open])

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (file.type !== 'application/pdf') {
      toast({
        title: '文件类型错误',
        description: '请上传PDF文件',
        variant: 'destructive',
      })
      return
    }

    // 检查文件大小（限制为10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: 'PDF大小不能超过10MB',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)
    setProcessStatus('idle')
  }

  // 处理文件上传和处理
  const handleImport = async () => {
    if (!selectedFile) return

    try {
      // 第一步：上传文件
      setIsUploading(true)
      setProcessStatus('uploading')
      setProgress(0)

      // 模拟上传进度
      const uploadProgressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(uploadProgressInterval)
            return 95
          }
          return prev + 5
        })
      }, 200)

      // 模拟上传网络请求
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      clearInterval(uploadProgressInterval)
      setProgress(100)
      setIsUploading(false)
      
      // 第二步：处理PDF识别题目
      setIsProcessing(true)
      setProcessStatus('processing')
      setProgress(0)

      // 模拟处理进度
      const processProgressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(processProgressInterval)
            return 95
          }
          return prev + 2
        })
      }, 300)

      // 使用新的API客户端处理PDF导入
      const response = await api.examManagement.importQuestionsFromPdf(examId, selectedFile)

      clearInterval(processProgressInterval)
      setProgress(100)

      // 处理识别结果
      setImportedQuestions(response.data.questions)
      setProcessStatus('success')

      toast({
        title: 'PDF处理成功',
        description: `已成功识别 ${response.data.questions.length} 道题目`,
      })

      // 通知父组件更新题目列表
      onQuestionsImport(response.data.questions)
      
      // 完成后1.5秒关闭对话框
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)
    } catch (error) {
      console.error('PDF导入出错:', error)
      setProcessStatus('error')
      
      toast({
        title: '导入失败',
        description: error instanceof Error ? error.message : '处理PDF时出现错误，请稍后再试',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>导入试卷PDF</DialogTitle>
          <DialogDescription>
            上传PDF文件，系统将自动识别题目并创建题目数据
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {processStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium">导入成功</h3>
              <p className="text-sm text-muted-foreground mt-1">
                已成功导入 {importedQuestions.length} 道题目
              </p>
            </div>
          ) : (
            <>
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors",
                  processStatus !== 'idle' && "pointer-events-none opacity-60"
                )}
                onClick={() => document.getElementById('pdf-upload')?.click()}
              >
                {selectedFile ? (
                  <>
                    <File className="h-10 w-10 text-primary mb-2" />
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="font-medium">点击选择PDF文件</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      支持最大10MB的PDF文件
                    </p>
                  </>
                )}
                <input
                  id="pdf-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  disabled={isUploading || isProcessing}
                />
              </div>

              {(processStatus === 'uploading' || processStatus === 'processing') && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {processStatus === 'uploading' ? '上传中...' : '处理中...'}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {processStatus === 'uploading'
                      ? '正在上传PDF文件...'
                      : '正在分析试卷并识别题目...'}
                  </p>
                </div>
              )}

              {processStatus === 'error' && (
                <div className="text-sm text-red-500 text-center p-2">
                  处理失败，请重试或选择其他PDF文件
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isUploading || isProcessing}
          >
            {processStatus === 'success' ? '关闭' : '取消'}
          </Button>
          
          {processStatus !== 'success' && (
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || isUploading || isProcessing}
            >
              {(isUploading || isProcessing) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isUploading ? '上传中' : isProcessing ? '处理中' : '开始导入'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 