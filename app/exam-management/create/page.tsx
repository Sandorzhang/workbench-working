'use client'

import { ExamForm } from '@/components/exam-management/exam-form'
import { PageContainer } from '@/components/ui/page-container'

export default function CreateExamPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">创建考试</h1>
        <ExamForm />
      </div>
    </PageContainer>
  )
} 