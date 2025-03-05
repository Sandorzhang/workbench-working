"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  UserCircle, 
  Users, 
  BookOpen, 
  Award, 
  Calendar,
  GraduationCap,
  Star,
  Heart,
  Filter,
  Mail,
  ArrowUpRight,
  Search
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { StudentCompetencyOverview } from "./student-competency-overview";
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';

// 导师类型定义
interface Mentor {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  specialties: string[];
}

// 学生类型
interface Student {
  id: string;
  name: string;
  studentId: string;
  grade: string;
  class: string;
  mentorId: string;
  avatar?: string;
  mentor?: Mentor;
}

// 学生视图负责展示学生的导师信息和统计数据
export function StudentView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [studentInfo, setStudentInfo] = useState<{
    totalMentors: number;
    myMentor: Mentor | null;
    stats: any;
  }>({
    totalMentors: 0,
    myMentor: null,
    stats: {
      mentorDistribution: [],
      mentoringsStats: [],
      activityData: []
    }
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 获取导师列表
        const mentorsResponse = await fetch('/api/mentors');
        if (!mentorsResponse.ok) {
          throw new Error(`获取导师数据失败: ${mentorsResponse.status}`);
        }
        
        const mentorsData = await mentorsResponse.json();
        setMentors(mentorsData);
        
        // 获取当前学生信息
        const studentResponse = await fetch('/api/student/me');
        if (!studentResponse.ok) {
          throw new Error(`获取学生数据失败: ${studentResponse.status}`);
        }
        
        const studentData = await studentResponse.json();
        
        // 找到学生的导师
        const myMentor = mentorsData.find((mentor: Mentor) => mentor.id === studentData.mentorId) || null;
        
        // 准备统计数据
        const departmentCounts: Record<string, number> = {};
        mentorsData.forEach((mentor: Mentor) => {
          const dept = mentor.department;
          departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
        });
        
        const mentorDistribution = Object.entries(departmentCounts).map(([name, value]) => ({
          name,
          value
        }));
        
        // 模拟辅导统计数据
        const mentoringsStats = [
          { name: '本月辅导', value: Math.floor(Math.random() * 5) + 1 },
          { name: '本学期已辅导', value: Math.floor(Math.random() * 15) + 5 },
          { name: '待完成辅导', value: Math.floor(Math.random() * 3) }
        ];
        
        // 模拟活动数据
        const activityData = [
          { name: '讨论', 本月: Math.floor(Math.random() * 10), 上月: Math.floor(Math.random() * 10) },
          { name: '辅导', 本月: Math.floor(Math.random() * 8), 上月: Math.floor(Math.random() * 8) },
          { name: '作业', 本月: Math.floor(Math.random() * 15), 上月: Math.floor(Math.random() * 15) },
          { name: '答疑', 本月: Math.floor(Math.random() * 12), 上月: Math.floor(Math.random() * 12) }
        ];
        
        setStudentInfo({
          totalMentors: mentorsData.length,
          myMentor,
          stats: {
            mentorDistribution,
            mentoringsStats,
            activityData
          }
        });
      } catch (err) {
        console.error('数据获取错误:', err);
        setError(`获取数据失败: ${err instanceof Error ? err.message : '未知错误'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudentData();
  }, []);
  
  // 渲染加载中状态
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-20 bg-slate-100 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-60 bg-slate-100 rounded-lg"></div>
            <div className="h-60 bg-slate-100 rounded-lg"></div>
          </div>
          <div className="h-80 bg-slate-100 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  // 渲染错误状态
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 text-center">
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              重试
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 为饼图准备不同的颜色
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div className="space-y-6">
      {/* 顶部搜索和快速导航 */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索导师..."
            className="pl-8 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-muted-foreground hidden sm:flex"
        >
          <Filter className="h-4 w-4" />
          筛选
        </Button>
      </div>

      {/* 学生信息概览卡片 */}
      {isLoading ? (
        <StudentInfoSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 导师信息卡片 */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden h-full">
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
                <CardTitle className="text-sm font-medium">我的导师</CardTitle>
                {studentInfo.myMentor ? (
                  <CardDescription>
                    {studentInfo.myMentor.title} - {studentInfo.myMentor.department}
                  </CardDescription>
                ) : (
                  <CardDescription>暂未分配导师</CardDescription>
                )}
              </CardHeader>
              
              {studentInfo.myMentor ? (
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12 border border-blue-100 bg-blue-50/80">
                      <AvatarImage src={studentInfo.myMentor.avatar} alt={studentInfo.myMentor.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700">
                        {studentInfo.myMentor.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-base font-medium">{studentInfo.myMentor.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {studentInfo.myMentor.specialties?.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50/80">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 mt-3">
                        <Button size="sm" variant="outline" className="h-8 gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">联系</span>
                        </Button>
                        <Button size="sm" className="h-8 gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">预约</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <UserCircle className="h-8 w-8 text-blue-300" />
                  </div>
                  <p className="text-muted-foreground mb-4">您还没有分配导师</p>
                  <Button size="sm" className="mx-auto gap-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    申请导师
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
          
          {/* 导师活动统计 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100/50">
                <CardTitle className="text-sm font-medium">导师辅导统计</CardTitle>
                <CardDescription>导师辅导和学习活动数据统计</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {/* 统计信息 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-amber-50/50 rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">导师辅导总数</div>
                    <div className="text-xl font-semibold flex items-center">
                      {studentInfo.stats.mentorings.total}
                      <Badge className="ml-2 h-5" variant="outline">
                        本周 {studentInfo.stats.mentorings.lastWeek}
                      </Badge>
                    </div>
                    <div className="text-xs text-green-600 mt-1 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      增长 {studentInfo.stats.mentorings.growth}%
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50/50 rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">学习计划完成度</div>
                    <div className="text-xl font-semibold">
                      {studentInfo.stats.progress.completed}%
                    </div>
                    <div className="mt-2">
                      <Progress value={studentInfo.stats.progress.completed} className="h-1" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      目标: {studentInfo.stats.progress.target}%
                    </div>
                  </div>
                  
                  <div className="bg-blue-50/50 rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">学习活动统计</div>
                    <div className="h-16">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={studentInfo.stats.activities}
                          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        >
                          <Bar dataKey="count" fill="#4f46e5" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 text-center">
                      近6个月活动趋势
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 素养能力概览卡片 */}
      <div className="mt-6">
        <h3 className="font-medium text-md flex items-center mb-4">
          <Star className="mr-2 h-5 w-5 text-amber-500" />
          学生素养与能力概览
        </h3>
        <StudentCompetencyOverview isLoading={isLoading} />
      </div>

      {/* 其他统计图表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">导师院系分布</CardTitle>
            <CardDescription>各院系导师人数分布情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentInfo.stats.mentorDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {studentInfo.stats.mentorDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">导师辅导类型分布</CardTitle>
            <CardDescription>不同类型的导师辅导活动占比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={studentInfo.stats.mentoringsStats}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function StudentViewWrapper() {
  return <StudentView />;
}

// 添加学生信息骨架屏组件
function StudentInfoSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="overflow-hidden h-full">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 