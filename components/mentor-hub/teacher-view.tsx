"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { 
  BarChart,
  BookOpen,
  Calendar,
  ChevronLeft,
  User,
  FilterIcon,
  SearchIcon,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Skeleton } from "../ui/skeleton";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Textarea } from "../ui/textarea";

// 基础学生类型
interface Student {
  id: string;
  name: string;
}

// 指标类型
interface Indicator {
  id: string;
  name: string;
  value: number;
  maxValue: number;
  description?: string;
}

// 笔记类型
interface Note {
  id?: string;
  date: string;
  content: string;
  author: string;
}

// 学业记录类型
interface AcademicRecord {
  id?: string;
  subject: string;
  score: number;
  date: string;
  type: string;
  rank?: string;
  comment?: string;
}

// 学生类型定义（丰富了lib/types中的Student）
interface EnrichedStudent {
  id: string;
  name: string;
  avatar: string;
  indicators: Indicator[];
  notes?: Note[];
  academicRecords?: AcademicRecord[];
  // K12学生属性
  studentId: string;
  grade: string;
  class: string;
  gender?: 'male' | 'female';
  birthday?: string;
  contact?: string;
  address?: string;
  interests?: string[];
  strengths?: string[];
  areasToImprove?: string[];
}

// 学生列表组件
function StudentList({ 
  students, 
  onSelectStudent 
}: { 
  students: EnrichedStudent[], 
  onSelectStudent: (student: EnrichedStudent) => void 
}) {
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-slate-50/80">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            学生列表
          </h2>
        </div>
        <div className="p-8 text-center py-20 bg-white">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground font-medium">暂无分配学生</p>
          <p className="text-muted-foreground text-sm mt-1">请联系管理员分配学生</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-slate-50/80">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <User className="mr-2 h-5 w-5 text-primary" />
          学生列表
        </h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <Card 
              key={student.id} 
              className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md overflow-hidden"
              onClick={() => onSelectStudent(student)}
            >
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {student.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-800">{student.name}</h4>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <div className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                          {student.grade}{student.class}班
                        </div>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-xs">学号: {student.studentId}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {student.indicators.map((indicator) => {
                    // 根据指标类型选择不同的颜色
                    let colorClass = "bg-blue-500";
                    if (indicator.name === '学习态度') colorClass = "bg-emerald-500";
                    if (indicator.name === '参与度') colorClass = "bg-amber-500";
                    
                    return (
                      <div key={indicator.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-600">{indicator.name}</span>
                          <span className="font-semibold">
                            {indicator.value}/{indicator.maxValue}
                          </span>
                        </div>
                        <Progress 
                          value={(indicator.value / indicator.maxValue) * 100} 
                          className={`h-2 ${colorClass}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// 学生详情视图
function StudentDetail({ 
  student, 
  onBack 
}: { 
  student: EnrichedStudent, 
  onBack: () => void 
}) {
  const [newNote, setNewNote] = useState("");
  const [noteSubmitted, setNoteSubmitted] = useState(false);
  
  const handleNoteSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    setNoteSubmitted(true);
    setTimeout(() => {
      setNoteSubmitted(false);
      setNewNote("");
    }, 2000);
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="mr-2 group bg-white hover:bg-gray-50 border border-gray-100 shadow-sm"
        >
          <ChevronLeft className="mr-1 h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
          返回
        </Button>
        <Badge variant="outline" className="ml-2 bg-primary/5 text-primary">
          学生档案
        </Badge>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 flex items-center">
          <Avatar className="h-20 w-20 border-2 border-white shadow-sm mr-6">
            <AvatarImage src={student.avatar} alt={student.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {student.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{student.name}</h2>
            <div className="flex items-center text-sm text-gray-600">
              <div className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                {student.grade}{student.class}班
              </div>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-xs">学号: {student.studentId}</span>
              {student.gender && (
                <>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-xs">{student.gender === 'male' ? '男' : '女'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start px-6 pt-4 border-b bg-gray-50/50">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              概览
            </TabsTrigger>
            <TabsTrigger 
              value="personal" 
              className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              个人信息
            </TabsTrigger>
            <TabsTrigger 
              value="academic" 
              className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              学业记录
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              教师笔记
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-6 space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 个人信息卡片 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-800 flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    个人信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3 pt-2">
                  {student.birthday && (
                    <div className="flex justify-between py-1.5 border-b border-dashed border-gray-100 last:border-0">
                      <span className="text-gray-500">出生日期</span>
                      <span className="font-medium">{student.birthday}</span>
                    </div>
                  )}
                  {student.contact && (
                    <div className="flex justify-between py-1.5 border-b border-dashed border-gray-100 last:border-0">
                      <span className="text-gray-500">联系方式</span>
                      <span className="font-medium">{student.contact}</span>
                    </div>
                  )}
                  {student.address && (
                    <div className="flex justify-between py-1.5 border-b border-dashed border-gray-100 last:border-0">
                      <span className="text-gray-500">家庭住址</span>
                      <span className="font-medium">{student.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* 兴趣与能力卡片 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-800 flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-primary" />
                    兴趣与能力
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm pt-2">
                  {student.interests && (
                    <div className="mb-4">
                      <h4 className="text-gray-500 mb-2 text-xs font-medium">兴趣爱好</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {student.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {student.strengths && (
                    <div>
                      <h4 className="text-gray-500 mb-2 text-xs font-medium">优势</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {student.strengths.map((strength, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* 核心指标卡片 */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-800">教师评估指标</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {student.indicators.map((indicator) => {
                      // 根据指标类型选择不同的颜色
                      let colorClass = "bg-blue-500";
                      if (indicator.name === '学习态度') colorClass = "bg-emerald-500";
                      if (indicator.name === '参与度') colorClass = "bg-amber-500";
                      
                      return (
                        <Card key={indicator.id} className="overflow-hidden border-0 shadow-sm">
                          <div className={`h-1 ${colorClass}`} />
                          <CardContent className="p-4">
                            <div className="mb-2">
                              <div className="flex justify-between text-sm font-medium mb-0.5">
                                <span className="text-gray-700">{indicator.name}</span>
                                <span className="text-gray-800">{indicator.value}/{indicator.maxValue}</span>
                              </div>
                              <Progress 
                                value={(indicator.value / indicator.maxValue) * 100} 
                                className={`h-2 ${colorClass}`} 
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{indicator.description}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              {/* 最近学业记录 */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-800 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    最近学业记录
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {student.academicRecords && student.academicRecords.length > 0 ? (
                    <div className="space-y-4">
                      {student.academicRecords.slice(0, 3).map((record, index) => (
                        <div key={index} className="flex items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                          <div className="w-16 mr-4">
                            <div className={`
                              px-2 py-1 text-center rounded-md text-xs font-medium
                              ${record.score >= 90 ? 'bg-green-50 text-green-700' : 
                                record.score >= 75 ? 'bg-blue-50 text-blue-700' : 
                                record.score >= 60 ? 'bg-amber-50 text-amber-700' : 
                                'bg-red-50 text-red-700'}
                            `}>
                              {record.score}分
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-800">{record.subject}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {record.date} · {record.type}
                            </p>
                            {record.comment && (
                              <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-1.5 rounded">
                                {record.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">暂无学业记录</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="personal" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <Card>
              <CardHeader>
                <CardTitle>完整个人信息</CardTitle>
                <CardDescription>学生的详细个人背景信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">姓名</h4>
                    <p className="text-gray-800">{student.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">学号</h4>
                    <p className="text-gray-800">{student.studentId}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">班级</h4>
                    <p className="text-gray-800">{student.grade}{student.class}班</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">性别</h4>
                    <p className="text-gray-800">{student.gender === 'male' ? '男' : '女'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">出生日期</h4>
                    <p className="text-gray-800">{student.birthday || '未知'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">联系方式</h4>
                    <p className="text-gray-800">{student.contact || '未知'}</p>
                  </div>
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">家庭住址</h4>
                    <p className="text-gray-800">{student.address || '未知'}</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">兴趣爱好</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {student.interests ? 
                      student.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                          {interest}
                        </Badge>
                      )) : 
                      <p className="text-gray-500 text-sm">未记录</p>
                    }
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">优势</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {student.strengths ? 
                      student.strengths.map((strength, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-50 text-green-700">
                          {strength}
                        </Badge>
                      )) : 
                      <p className="text-gray-500 text-sm">未记录</p>
                    }
                  </div>
                </div>
                
                {student.areasToImprove && (
                  <div className="pt-3 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">需要提升的方面</h4>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {student.areasToImprove.map((area, index) => (
                        <Badge key={index} variant="secondary" className="bg-amber-50 text-amber-700">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="academic" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <Card>
              <CardHeader>
                <CardTitle>学业记录</CardTitle>
                <CardDescription>学生的考试和作业成绩记录</CardDescription>
              </CardHeader>
              <CardContent>
                {student.academicRecords && student.academicRecords.length > 0 ? (
                  <div className="space-y-6">
                    {student.academicRecords.map((record, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <div className={`
                              px-2.5 py-1 text-center rounded-md text-sm font-medium mr-3
                              ${record.score >= 90 ? 'bg-green-50 text-green-700' : 
                                record.score >= 75 ? 'bg-blue-50 text-blue-700' : 
                                record.score >= 60 ? 'bg-amber-50 text-amber-700' : 
                                'bg-red-50 text-red-700'}
                            `}>
                              {record.score}分
                            </div>
                            <h4 className="font-medium text-gray-800">{record.subject}</h4>
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.date}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Badge variant="outline" className="mr-2">
                            {record.type}
                          </Badge>
                          {record.rank && (
                            <span className="text-xs">班级排名: {record.rank}</span>
                          )}
                        </div>
                        {record.comment && (
                          <div className="text-sm bg-gray-50 p-3 rounded-md">
                            <p className="text-gray-700">{record.comment}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>暂无学业记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <Card className="border bg-card">
              <CardHeader>
                <CardTitle>教师笔记</CardTitle>
                <CardDescription>关于该学生的教学笔记和观察</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleNoteSubmit} className="space-y-4">
                  <div>
                    <Textarea
                      placeholder="添加新笔记..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-20 resize-none focus-visible:ring-primary"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!newNote.trim() || noteSubmitted}
                      className="flex items-center"
                    >
                      {noteSubmitted ? (
                        <>
                          <span>已提交</span>
                          <CheckCircle className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        "提交笔记"
                      )}
                    </Button>
                  </div>
                </form>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-medium">历史笔记</h3>
                  
                  {student.notes && student.notes.length > 0 ? (
                    <div className="space-y-4">
                      {student.notes.map((note, index) => (
                        <div key={index} className="bg-muted/10 border rounded-lg p-4 space-y-2 hover:bg-muted/20 transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm text-gray-800">{note.author}</span>
                            <span className="text-xs text-gray-500">{note.date}</span>
                          </div>
                          <p className="text-sm text-gray-700">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted/10 rounded-lg">
                      <Calendar className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-muted-foreground">暂无笔记记录</p>
                      <p className="text-xs text-muted-foreground mt-1">添加第一条笔记来开始记录</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// 骨架屏组件
function TeacherViewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[200px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// 主教师视图组件
export default function TeacherView() {
  const [selectedStudent, setSelectedStudent] = useState<EnrichedStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<EnrichedStudent[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/teacher/students');
        
        if (!response.ok) {
          throw new Error('获取学生列表失败，请稍后重试');
        }
        
        const data = await response.json();
        setStudents(data);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('获取学生列表失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="h-24 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (selectedStudent) {
    return (
      <div>
        <StudentDetail
          student={selectedStudent}
          onBack={() => setSelectedStudent(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">我的学生</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
          >
            <FilterIcon className="h-3 w-3 mr-1" />
            筛选
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
          >
            <SearchIcon className="h-3 w-3 mr-1" />
            搜索
          </Button>
        </div>
      </div>
      
      <StudentList
        students={students}
        onSelectStudent={setSelectedStudent}
      />
    </div>
  );
} 