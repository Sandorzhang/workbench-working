'use client'

import { ExamForm } from '@/components/exam-management/exam-form'
import { PageContainer } from '@/components/ui/page-container'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateExamPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-6">
          <Link 
            href="/exam-management" 
            className="text-muted-foreground hover:text-foreground flex items-center text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回考试列表
          </Link>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">创建考试</h1>
        <p className="text-muted-foreground">填写考试信息以创建新的考试记录</p>
        <ExamForm />
      </div>
    </PageContainer>
  )
} 