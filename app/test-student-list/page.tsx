'use client';

import { useState } from 'react';
import { StudentListMobile } from '@/components/mentor-hub/student-list-mobile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TestStudentListPage() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">学生列表测试页面</h1>
      
      <div className="flex gap-6">
        {/* 学生列表组件 - 占据1/5的宽度 */}
        <div className="w-1/5">
          <StudentListMobile 
            title="学生列表"
            onSelectStudent={setSelectedStudent}
          />
        </div>
        
        {/* 右侧内容区域 - 占据4/5的宽度 */}
        <div className="w-4/5">
          <Card>
            <CardHeader>
              <CardTitle>学生详情</CardTitle>
              <CardDescription>
                选择左侧学生查看详细信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedStudent ? (
                <div>
                  <h2 className="text-xl font-semibold mb-2">{selectedStudent.name}</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    学号: {selectedStudent.studentId} | 班级: {selectedStudent.grade}{selectedStudent.class}班
                  </p>
                  
                  <h3 className="text-md font-medium mb-2">能力指标</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedStudent.indicators.map((indicator: any) => (
                      <div key={indicator.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{indicator.name}</span>
                          <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {indicator.value}/{indicator.maxValue}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${(indicator.value / indicator.maxValue) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  请从左侧列表选择一名学生查看详情
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 