'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExamTable } from '@/components/exam-management/exam-table'
import { BreadcrumbNav } from '@/components/exam-management/bread-crumb-nav'
import { PageContainer } from '@/components/ui/page-container'
import { PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Exam } from '@/types/exam'

export default function ExamManagementPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchExams = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/exams')
      if (!response.ok) {
        throw new Error('Failed to fetch exams')
      }
      const data = await response.json()
      setExams(data.exams || [])
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredExams = exams.filter(exam => 
    exam.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddExam = () => {
    router.push('/exam-management/create')
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <BreadcrumbNav 
          items={[
            { title: '考试管理', href: '/exam-management' },
            { title: '考试', href: '/exam-management', isCurrentPage: true }
          ]} 
        />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">考试</h1>
          <Button onClick={handleAddExam}>
            <PlusCircle className="h-4 w-4 mr-2" />
            新增考试
          </Button>
        </div>
        <div className="flex w-full max-w-xs items-center space-x-2">
          <Input
            placeholder="试卷名称"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <ExamTable exams={filteredExams} isLoading={isLoading} onRefresh={fetchExams} />
      </div>
    </PageContainer>
  )
} 