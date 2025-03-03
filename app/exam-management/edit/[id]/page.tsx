'use client'

import { ExamForm } from '@/components/exam-management/exam-form'
import { BreadcrumbNav } from '@/components/exam-management/bread-crumb-nav'
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
        <BreadcrumbNav 
          items={[
            { title: '考试管理', href: '/exam-management' },
            { title: '考试', href: '/exam-management' },
            { title: '编辑考试', href: `/exam-management/edit/${params.id}`, isCurrentPage: true }
          ]} 
        />
        <h1 className="text-2xl font-bold">编辑考试</h1>
        <ExamForm examId={params.id} />
      </div>
    </PageContainer>
  )
} 