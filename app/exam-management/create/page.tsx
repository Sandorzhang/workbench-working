'use client'

import { ExamForm } from '@/components/exam-management/exam-form'
import { BreadcrumbNav } from '@/components/exam-management/bread-crumb-nav'
import { PageContainer } from '@/components/ui/page-container'

export default function CreateExamPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <BreadcrumbNav 
          items={[
            { title: '考试管理', href: '/exam-management' },
            { title: '考试', href: '/exam-management' },
            { title: '创建考试', href: '/exam-management/create', isCurrentPage: true }
          ]} 
        />
        <h1 className="text-2xl font-bold">创建考试</h1>
        <ExamForm />
      </div>
    </PageContainer>
  )
} 