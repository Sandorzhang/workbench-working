'use client'

import { ExamForm } from '@/components/exam-management/exam-form'
import { PageContainer } from '@/components/ui/page-container'

interface EditExamPageProps {
  params: {
    id: string
  }
}

export default function EditExamPage({ params }: EditExamPageProps) {
  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">编辑考试</h1>
        <ExamForm examId={params.id} />
      </div>
    </PageContainer>
  )
} 