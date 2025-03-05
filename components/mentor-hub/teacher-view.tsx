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
  FilterIcon,
  SearchIcon,
  AlertCircle,
  CheckCircle,
  BarChart2,
  Info,
  Heart,
  Award,
  FileText,
  History,
  Star,
  ClipboardEdit,
  FilePlus2,
  Pencil,
  Trash2,
  BarChart3,
  RefreshCw,
  Search,
  User
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Skeleton } from "../ui/skeleton";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Textarea } from "../ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Label } from "../ui/label";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  PieChart, Pie, Cell
} from 'recharts';
import { StudentCompetencyOverview } from "./student-competency-overview";
import {
  LineChart,
  Legend,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

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

// 修改StudentList组件，改为垂直滚动的简化版
function StudentList({ 
  students, 
  onSelectStudent,
  selectedStudentId
}: { 
  students: EnrichedStudent[], 
  onSelectStudent: (student: EnrichedStudent) => void,
  selectedStudentId: string | null
}) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // 过滤学生列表
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-l-xl shadow-sm border border-gray-100 overflow-hidden h-full">
        <div className="px-3 py-2 border-b border-gray-100 bg-slate-50/80">
          <h2 className="text-xs font-semibold text-gray-800 flex items-center">
            <User className="mr-1.5 h-3.5 w-3.5 text-primary" />
            学生列表
          </h2>
        </div>
        <div className="p-4 text-center py-10 bg-white">
          <User className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground text-sm">暂无分配学生</p>
          <p className="text-muted-foreground text-xs mt-1">请联系管理员分配学生</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-l-xl shadow-sm border border-r-0 border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="px-3 py-2 border-b border-gray-100 bg-slate-50/80 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-gray-800 flex items-center">
          <User className="mr-1.5 h-3.5 w-3.5 text-primary" />
          学生列表 <span className="ml-1 text-[10px] text-muted-foreground">({filteredStudents.length}/{students.length})</span>
        </h2>
        <div className="flex items-center">
          <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-gray-50 border-gray-200">
            {students.length} 人
          </Badge>
        </div>
      </div>
      
      <div className="px-2 py-1.5 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="搜索学生姓名或学号..." 
            className="h-7 text-xs pl-9 rounded-md border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground hover:text-gray-700 transition-colors"
              onClick={() => setSearchQuery("")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 py-1 student-list-scroll">
        {filteredStudents.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <SearchIcon className="h-5 w-5 text-muted-foreground opacity-20 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">未找到匹配的学生</p>
            <button 
              className="mt-2 text-xs text-primary hover:underline"
              onClick={() => setSearchQuery("")}
            >
              清除搜索
            </button>
          </div>
        ) : (
          filteredStudents.map((student, index) => (
            <div 
              key={student.id} 
              className={`px-2 py-2 ${index !== filteredStudents.length - 1 ? 'border-b border-gray-100/70' : ''} flex items-center cursor-pointer transition-all duration-200 group ${
                selectedStudentId === student.id 
                  ? 'bg-primary/5 border-l-3 border-l-primary' 
                  : 'hover:bg-slate-50 border-l-3 border-l-transparent hover:border-l-primary/30'
              }`}
              onClick={() => onSelectStudent(student)}
            >
              <Avatar className="h-9 w-9 mr-2.5 ring-1 ring-gray-100 transition-shadow group-hover:ring-2 group-hover:ring-primary/10">
                <AvatarImage src={student.avatar} alt={student.name} />
                <AvatarFallback className="text-xs bg-slate-100 text-slate-500">{student.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-slate-700 truncate group-hover:text-primary transition-colors">
                    {student.name}
                    <span className="ml-1.5 font-normal text-xs text-muted-foreground">
                      {student.studentId}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground bg-gray-50 px-1.5 py-0.5 rounded">
                    {student.grade}{student.class}班
                  </p>
                </div>
                <div className="flex mt-2 space-x-2">
                  {student.indicators.map((indicator, idx) => {
                    // Define colors based on indicator name and value
                    let bgColor = "bg-blue-500";
                    let lightBgColor = "bg-blue-100";
                    let borderColor = "border-blue-200";
                    let textColor = "text-blue-700";
                    
                    if (indicator.name === '学习态度') {
                      bgColor = "bg-emerald-500";
                      lightBgColor = "bg-emerald-100";
                      borderColor = "border-emerald-200";
                      textColor = "text-emerald-700";
                    } else if (indicator.name === '参与度') {
                      bgColor = "bg-amber-500";
                      lightBgColor = "bg-amber-100";
                      borderColor = "border-amber-200";
                      textColor = "text-amber-700";
                    }
                    
                    // Calculate percentage for filling the hexagon
                    const percentage = (indicator.value / indicator.maxValue) * 100;
                    
                    return (
                      <Tooltip key={indicator.id}>
                        <TooltipTrigger>
                          <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform">
                            <div className={`hexagon w-6 h-6 flex items-center justify-center text-xs font-medium border ${borderColor}`}>
                              <div className={`hexagon-background ${lightBgColor}`}></div>
                              <div 
                                className={`hexagon-fill ${bgColor}`} 
                                style={{ height: `${percentage}%` }}
                              ></div>
                              <span className={`relative z-10 text-[10px] font-semibold ${textColor}`}>
                                {indicator.value}
                              </span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="center" className="p-2 max-w-xs">
                          <p className="font-semibold text-xs flex items-center">
                            {indicator.name} 
                            <span className="ml-1 px-1 rounded bg-slate-100 text-[10px]">
                              {indicator.value}/{indicator.maxValue}
                            </span>
                          </p>
                          {indicator.description && (
                            <p className="text-[10px] opacity-80 mt-1">{indicator.description}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <style jsx global>{`
        .hexagon {
          position: relative;
          overflow: hidden;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
        
        .hexagon-background,
        .hexagon-fill {
          position: absolute;
          width: 100%;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          left: 0;
          right: 0;
        }
        
        .hexagon-background {
          height: 100%;
        }
        
        .hexagon-fill {
          bottom: 0;
          transition: height 0.3s ease-in-out;
        }
        
        .border-l-3 {
          border-left-width: 3px;
        }
        
        .student-list-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(203, 213, 225, 0.4) transparent;
        }
        
        .student-list-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .student-list-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .student-list-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(203, 213, 225, 0.4);
          border-radius: 6px;
        }
        
        .student-list-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(148, 163, 184, 0.6);
        }
      `}</style>
    </div>
  );
}

// 修改StudentDetail组件，移除返回按钮
function StudentDetail({ 
  student
}: { 
  student: EnrichedStudent
}) {
  const [newNote, setNewNote] = useState("");
  
  // 处理添加笔记
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    // 实际项目中应该通过API保存笔记
    toast.success("笔记已添加");
    setNewNote("");
  };

  return (
    <div className="space-y-8">
      {/* 学生基本信息 */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-20 w-20 border-2 border-blue-100">
            <AvatarImage src={student.avatar || undefined} alt={student.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {student.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h2 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                {student.name}
                <Badge variant="outline" className="ml-2 text-xs font-normal">
                  {student.grade} {student.class}
                </Badge>
              </h2>
              <p className="text-muted-foreground">学号: {student.studentId}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-muted-foreground mb-1">班主任评价</p>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                  <Star className="h-4 w-4 text-gray-200 mr-1" />
                  <span className="ml-1 font-medium">4.0</span>
                </div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-muted-foreground mb-1">教师评价</p>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                  <span className="ml-1 font-medium">5.0</span>
                </div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-muted-foreground mb-1">学生自评</p>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                  <Star className="h-4 w-4 text-gray-200 mr-1" />
                  <Star className="h-4 w-4 text-gray-200 mr-1" />
                  <span className="ml-1 font-medium">3.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 学生素养与能力概览 */}
      <div>
        <h3 className="font-medium text-md flex items-center mb-4">
          <Star className="mr-2 h-5 w-5 text-amber-500" />
          学生素养与能力概览
        </h3>
        <StudentCompetencyOverview />
      </div>      
      
      {/* 学习数据统计 */}
      <div className="space-y-4">
        <h3 className="font-medium text-md flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
          学习数据统计
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="overflow-hidden border-gray-200/80 hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/80">
              <CardTitle className="text-sm font-medium flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-primary" />
                学科成绩趋势
              </CardTitle>
              <CardDescription>主要学科的学习表现趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: '9月', 数学: 85, 语文: 78, 英语: 92, 科学: 68 },
                      { month: '10月', 数学: 82, 语文: 80, 英语: 90, 科学: 72 },
                      { month: '11月', 数学: 88, 语文: 84, 英语: 91, 科学: 77 },
                      { month: '12月', 数学: 90, 语文: 82, 英语: 94, 科学: 80 },
                      { month: '1月', 数学: 92, 语文: 85, 英语: 92, 科学: 84 },
                    ]}
                    margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis domain={[60, 100]} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Line type="monotone" dataKey="数学" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="语文" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="英语" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="科学" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-gray-200/80 hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/80">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                学习参与度
              </CardTitle>
              <CardDescription>各类学习活动的参与情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart 
                    outerRadius="80%" 
                    data={[
                      { subject: '课堂参与', A: 90, fullMark: 100 },
                      { subject: '课后作业', A: 85, fullMark: 100 },
                      { subject: '讨论发言', A: 65, fullMark: 100 },
                      { subject: '合作学习', A: 80, fullMark: 100 },
                      { subject: '项目完成', A: 75, fullMark: 100 },
                      { subject: '自主学习', A: 70, fullMark: 100 },
                    ]}
                  >
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tickSize={10} stroke="#9ca3af" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#e5e7eb" />
                    <Radar name="学生" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-gray-200/80 hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/80">
              <CardTitle className="text-sm font-medium flex items-center">
                <PieChart className="h-4 w-4 mr-2 text-primary" />
                可持续发展的素养表现
              </CardTitle>
              <CardDescription>学生核心素养的持续性发展状况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: '创新思维', value: 85, color: '#4f46e5' },
                        { name: '沟通能力', value: 75, color: '#0ea5e9' },
                        { name: '团队协作', value: 80, color: '#10b981' },
                        { name: '自主学习', value: 70, color: '#f59e0b' },
                        { name: '问题解决', value: 65, color: '#ef4444' },
                        { name: '批判性思考', value: 60, color: '#8b5cf6' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                      animationBegin={0}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {[
                        { name: '创新思维', value: 85, color: '#4f46e5' },
                        { name: '沟通能力', value: 75, color: '#0ea5e9' },
                        { name: '团队协作', value: 80, color: '#10b981' },
                        { name: '自主学习', value: 70, color: '#f59e0b' },
                        { name: '问题解决', value: 65, color: '#ef4444' },
                        { name: '批判性思考', value: 60, color: '#8b5cf6' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* 导师笔记 */}
      <div className="space-y-4">
        <h3 className="font-medium text-md flex items-center">
          <ClipboardEdit className="mr-2 h-5 w-5 text-green-500" />
          导师笔记
        </h3>
        
        <Card className="border-gray-200/80">
          <CardContent className="p-4 space-y-4">
            <Textarea
              placeholder="添加新的导师笔记..."
              className="min-h-[120px] focus-visible:ring-primary"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <div className="flex justify-end">
              <Button 
                className="gap-1" 
                disabled={!newNote.trim()}
                onClick={handleAddNote}
              >
                <FilePlus2 className="h-4 w-4" />
                添加笔记
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-4 pt-2">
              {[
                {
                  id: 1,
                  date: "2024-01-15",
                  content: "学生在数学学科表现出色，特别是几何和代数方面。建议进一步加强统计学的学习。"
                },
                {
                  id: 2,
                  date: "2023-12-10",
                  content: "期中考试后与学生进行了辅导，发现学生在学习方法上需要调整，已提供相关建议。"
                },
                {
                  id: 3,
                  date: "2023-11-05",
                  content: "学生展示出良好的团队合作能力，在小组项目中表现积极主动，能够帮助其他同学。"
                }
              ].map((note) => (
                <div key={note.id} className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground">{note.date}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm">{note.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 骨架屏组件
function TeacherViewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-end">
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      <div className="flex h-[calc(100vh-12rem)]">
        <div className="w-1/5 pr-2">
          <Skeleton className="h-full rounded-lg" />
        </div>
        <div className="w-4/5">
          <Skeleton className="h-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// 修改TeacherView组件，使用并排布局
export default function TeacherView() {
  const [students, setStudents] = useState<EnrichedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<EnrichedStudent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 获取教师管理的学生列表
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/teacher/mentored-students');
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const data = await response.json();
      
      // 转换数据格式以符合EnrichedStudent类型
      const enrichedStudents: EnrichedStudent[] = data.map((student: any) => ({
        id: student.id,
        name: student.name,
        avatar: student.avatar,
        studentId: student.studentId,
        grade: student.grade,
        class: student.class,
        gender: student.gender,
        indicators: [
          {
            id: `academic-${student.id}`,
            name: '学术素养',
            value: student.competencyStatus.academic,
            maxValue: 100,
            description: '学术和学科知识掌握程度'
          },
          {
            id: `social-${student.id}`,
            name: '社交素养',
            value: student.competencyStatus.social,
            maxValue: 100,
            description: '人际交往和团队协作能力'
          },
          {
            id: `personal-${student.id}`,
            name: '个人素养',
            value: student.competencyStatus.personal,
            maxValue: 100,
            description: '自我管理和个人发展能力'
          },
          {
            id: `engineering-${student.id}`,
            name: '工程素养',
            value: student.competencyStatus.engineering,
            maxValue: 100,
            description: '实践能力和解决实际问题的能力'
          }
        ]
      }));
      
      setStudents(enrichedStudents);
      
      // 如果有学生数据，默认选择第一个学生
      if (enrichedStudents.length > 0 && !selectedStudent) {
        fetchStudentDetail(enrichedStudents[0].id);
      }
    } catch (error) {
      console.error('获取学生列表失败:', error);
      toast.error('获取学生列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取学生详细信息
  const fetchStudentDetail = async (studentId: string) => {
    try {
      const response = await fetch(`/api/teacher/student/${studentId}`);
      
      if (!response.ok) {
        throw new Error('获取学生详细信息失败');
      }
      
      const data = await response.json();
      
      // 将API返回的数据转换成组件需要的格式
      const enrichedStudent: EnrichedStudent = {
        id: data.id,
        name: data.name,
        avatar: data.avatar,
        studentId: data.studentId,
        grade: data.grade,
        class: data.class,
        gender: data.gender,
        birthday: data.birthday,
        contact: data.contact,
        address: data.address,
        interests: data.interests,
        strengths: data.strengths,
        areasToImprove: data.areasToImprove,
        notes: data.notes,
        academicRecords: data.academicRecords,
        indicators: [
          {
            id: 'academic',
            name: '学术素养',
            value: data.competencyDetail.academic.progress,
            maxValue: 100,
            description: data.competencyDetail.academic.description
          },
          {
            id: 'social',
            name: '社交素养',
            value: data.competencyDetail.social.progress,
            maxValue: 100,
            description: data.competencyDetail.social.description
          },
          {
            id: 'personal',
            name: '个人素养',
            value: data.competencyDetail.personal.progress,
            maxValue: 100,
            description: data.competencyDetail.personal.description
          },
          {
            id: 'engineering',
            name: '工程素养',
            value: data.competencyDetail.engineering.progress,
            maxValue: 100,
            description: data.competencyDetail.engineering.description
          }
        ]
      };
      
      setSelectedStudent(enrichedStudent);
    } catch (error) {
      console.error('获取学生详细信息失败:', error);
      toast.error('获取学生详细信息失败');
    }
  };

  // 处理学生选择
  const handleSelectStudent = (student: EnrichedStudent) => {
    fetchStudentDetail(student.id);
  };

  // 组件挂载时获取学生列表
  useEffect(() => {
    fetchStudents();
  }, []);

  // 处理刷新
  const handleRefresh = () => {
    fetchStudents();
    if (selectedStudent) {
      fetchStudentDetail(selectedStudent.id);
    }
    toast.success('数据已刷新');
  };

  if (isLoading) {
    return <TeacherViewSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
          <h2 className="text-lg font-semibold">学生列表</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索学生..."
              className="pl-9"
            />
          </div>
        </div>
        <StudentList 
          students={students} 
          onSelectStudent={handleSelectStudent}
          selectedStudentId={selectedStudent?.id || null}
        />
      </div>
      
      <div className="col-span-1 lg:col-span-3">
        {selectedStudent ? (
          <StudentDetail student={selectedStudent} />
        ) : (
          <div className="flex h-[300px] items-center justify-center bg-white rounded-xl shadow border border-gray-100">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium">请选择一名学生</h3>
              <p className="text-sm text-muted-foreground mt-1">
                从左侧列表选择一名学生查看详情
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 