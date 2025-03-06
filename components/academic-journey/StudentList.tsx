'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StudentSummary } from '@/features/academic-journey/types';
import { api } from '@/shared/api';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/components/ui/button';
import { MasteryBadge } from './MasteryLegend';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface StudentListProps {
  classId: string;
  className?: string;
}

export function StudentList({ classId, className }: StudentListProps) {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.academicJourney.getStudentList(classId, currentPage, pageSize);
        const data = response.data;
        setStudents(data.students);
        setTotalStudents(data.total);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setError('加载学生列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalStudents / pageSize);

  if (loading) {
    return (
      <Card className={cn("w-full h-full", className)}>
        <CardHeader>
          <CardTitle>学生列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>学生姓名</TableHead>
                    <TableHead>掌握进度</TableHead>
                    <TableHead className="text-right">总体掌握率</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-9 w-24" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full h-full", className)}>
        <CardHeader>
          <CardTitle>学生列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full h-full", className)}>
      <CardHeader>
        <CardTitle>学生列表</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>学生姓名</TableHead>
                  <TableHead>掌握进度</TableHead>
                  <TableHead className="text-right">总体掌握率</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs">
                          <span>掌握情况</span>
                          <span className="text-muted-foreground">
                            已掌握 {student.standardsCounts.mastered} / 
                            进行中 {student.standardsCounts.progressing} / 
                            需提高 {student.standardsCounts.needsImprovement} / 
                            未开始 {student.standardsCounts.notStarted}
                          </span>
                        </div>
                        <Progress 
                          value={student.overallMastery} 
                          className="h-2"
                        />
                        <div className="flex gap-2 mt-1">
                          {student.recentProgress.slice(0, 2).map(progress => (
                            <div key={`${progress.standardId}-${progress.date}`} className="flex gap-1 items-center text-xs">
                              <MasteryBadge level={progress.currentLevel} />
                              <span className="text-muted-foreground">{progress.date}</span>
                            </div>
                          ))}
                          {student.recentProgress.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{student.recentProgress.length - 2} 更多
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {student.overallMastery.toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Link href={`/academic-journey/students/${student.id}`}>
                        <Button variant="ghost" size="sm">
                          详情 <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      没有学生数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                第 {currentPage} 页，共 {totalPages} 页
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 