'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExamTable } from '@/components/exam-management/exam-table'
import { HeroSection } from '@/components/ui/hero-section'
import { PlusCircle, FileSpreadsheet, Search } from 'lucide-react'
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
    <div className="h-full flex flex-col">
      <HeroSection
        title="考试管理"
        description="创建、编辑和管理各类考试及试卷，支持考试数据分析和成绩管理。"
        icon={FileSpreadsheet}
        gradient="from-amber-50 to-orange-50"
      />
      
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-xs">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="搜索考试..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        <Button onClick={handleAddExam} className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium">
          <PlusCircle className="h-4 w-4 mr-2" />
          新增考试
        </Button>
      </div>
      <ExamTable exams={filteredExams} isLoading={isLoading} onRefresh={fetchExams} />
    </div>
  )
} 