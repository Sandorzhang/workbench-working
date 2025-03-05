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
  CheckCircle,
  BarChart2,
  Info,
  Heart,
  Award,
  FileText,
  History
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
          <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="搜索学生姓名或学号..." 
            className="h-7 text-xs pl-7 rounded-md border-gray-200"
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
    <div className="bg-white rounded-r-xl shadow-md border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-slate-50/90 to-white flex items-center">
        <Badge variant="outline" className="bg-white mr-2.5 border-primary/20 shadow-sm">学生档案</Badge>
        <h2 className="text-base font-semibold text-gray-800 flex items-center">
          {student.name}
          <span className="ml-2 text-xs font-normal text-muted-foreground bg-gray-50 px-2 py-0.5 rounded-full">
            {student.grade}{student.class}班
          </span>
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 student-detail-scroll">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-5 bg-gray-50/80 p-1.5 rounded-lg w-full border border-gray-200/80 shadow-sm">
            <TabsTrigger 
              value="overview" 
              className="text-sm data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md transition-all"
            >
              概览
            </TabsTrigger>
            <TabsTrigger 
              value="personal-info" 
              className="text-sm data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md transition-all"
            >
              个人信息
            </TabsTrigger>
            <TabsTrigger 
              value="academic" 
              className="text-sm data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md transition-all"
            >
              学术记录
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="text-sm data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md transition-all"
            >
              教师笔记
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="focus-visible:outline-none focus-visible:ring-0 space-y-6">
            {/* 学生画像展示 */}
            <div className="grid grid-cols-1 gap-6">
              {/* 学生基本信息卡片 */}
              <Card className="overflow-hidden border-gray-200/80 hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/80">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    个人信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-muted-foreground">
                      <div className="grid grid-cols-3 gap-1 py-1 border-b border-dashed border-gray-100">
                        <div className="font-medium text-gray-500">姓名</div>
                        <div className="col-span-2">{student.name}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 py-1 border-b border-dashed border-gray-100">
                        <div className="font-medium text-gray-500">学号</div>
                        <div className="col-span-2">{student.studentId}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 py-1 border-b border-dashed border-gray-100">
                        <div className="font-medium text-gray-500">班级</div>
                        <div className="col-span-2">{student.grade}{student.class}班</div>
                      </div>
                      {student.gender && (
                        <div className="grid grid-cols-3 gap-1 py-1 border-b border-dashed border-gray-100">
                          <div className="font-medium text-gray-500">性别</div>
                          <div className="col-span-2">{student.gender === 'male' ? '男' : '女'}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-muted-foreground">
                      {student.birthday && (
                        <div className="grid grid-cols-3 gap-1 py-1 border-b border-dashed border-gray-100">
                          <div className="font-medium text-gray-500">生日</div>
                          <div className="col-span-2">{student.birthday}</div>
                        </div>
                      )}
                      {student.contact && (
                        <div className="grid grid-cols-3 gap-1 py-1 border-b border-dashed border-gray-100">
                          <div className="font-medium text-gray-500">联系方式</div>
                          <div className="col-span-2">{student.contact}</div>
                        </div>
                      )}
                      {student.interests && student.interests.length > 0 && (
                        <div className="grid grid-cols-3 gap-1 py-1 border-b border-dashed border-gray-100">
                          <div className="font-medium text-gray-500">兴趣爱好</div>
                          <div className="col-span-2">
                            <div className="flex flex-wrap gap-1">
                              {student.interests.map((interest, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-primary/5 text-xs">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 可持续发展的素养表现旭日图 */}
              <Card className="overflow-hidden border-gray-200/80 hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/80">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <PieChart className="h-4 w-4 mr-2 text-primary" />
                    可持续发展的素养表现
                  </CardTitle>
                  <CardDescription>学生核心素养的持续性发展状况</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 p-2">
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
                          outerRadius={130}
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
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              stroke="#ffffff" 
                              strokeWidth={1}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value, name) => [`${value}分`, name]} 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '6px',
                            border: '1px solid #f3f4f6',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                            padding: '8px 12px'
                          }}
                          wrapperStyle={{ outline: 'none' }}
                          itemStyle={{ color: '#4b5563', fontSize: '12px' }}
                          labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* 阶段性测量的素养条形图 */}
              <Card className="overflow-hidden border-gray-200/80 hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/80">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                    阶段性素养测量
                  </CardTitle>
                  <CardDescription>学生近期素养水平测量结果</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={[
                          { name: '语言表达', 本学期: 85, 上学期: 75 },
                          { name: '数学思维', 本学期: 70, 上学期: 65 },
                          { name: '科学探究', 本学期: 75, 上学期: 60 },
                          { name: '艺术素养', 本学期: 90, 上学期: 80 },
                          { name: '身心健康', 本学期: 80, 上学期: 75 },
                          { name: '社会责任', 本学期: 65, 上学期: 60 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                        barGap={0}
                        barCategoryGap={16}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          dy={8}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          dx={-8}
                        />
                        <RechartsTooltip
                          formatter={(value, name) => [`${value}分`, name === '本学期' ? '本学期' : '上学期']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '6px',
                            border: '1px solid #f3f4f6',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                            padding: '8px 12px'
                          }}
                          itemStyle={{ color: '#4b5563', fontSize: '12px' }}
                          labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                        />
                        <Bar 
                          dataKey="上学期" 
                          stackId="a" 
                          fill="#c7d2fe" 
                          stroke="#4f46e5" 
                          strokeWidth={0.5}
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="本学期" 
                          stackId="a" 
                          fill="#4f46e5" 
                          radius={[4, 4, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* 保留原有的CSS样式 */}
            <style jsx global>{`
              .hexagon-lg {
                position: relative;
                width: 70px;
                height: 80px;
                overflow: hidden;
              }
              
              .hexagon-background-lg,
              .hexagon-fill-lg {
                position: absolute;
                width: 100%;
                clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
              }
              
              .hexagon-background-lg {
                height: 100%;
              }
              
              .hexagon-fill-lg {
                bottom: 0;
                transition: height 0.3s ease-in-out;
              }
            `}</style>
          </TabsContent>
          
          <TabsContent value="personal-info" className="focus-visible:outline-none focus-visible:ring-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">学生个人档案</CardTitle>
                <CardDescription>详细的学生个人信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 pb-1 border-b">基本信息</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">姓名</div>
                        <div className="font-medium">{student.name}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">学号</div>
                        <div className="font-medium">{student.studentId}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">年级班级</div>
                        <div className="font-medium">{student.grade}{student.class}班</div>
                      </div>
                      {student.gender && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">性别</div>
                          <div className="font-medium">{student.gender === 'male' ? '男' : '女'}</div>
                        </div>
                      )}
                      {student.birthday && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">出生日期</div>
                          <div className="font-medium">{student.birthday}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {student.contact && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 pb-1 border-b">联系方式</h4>
                      <div className="space-y-1">
                        <div className="font-medium">{student.contact}</div>
                      </div>
                    </div>
                  )}
                  
                  {student.address && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 pb-1 border-b">家庭住址</h4>
                      <div className="space-y-1">
                        <div className="font-medium">{student.address}</div>
                      </div>
                    </div>
                  )}
                  
                  {student.interests && student.interests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 pb-1 border-b">兴趣爱好</h4>
                      <div className="flex flex-wrap gap-2">
                        {student.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary" className="bg-primary/5">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {student.strengths && student.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 pb-1 border-b">个人优势</h4>
                      <div className="flex flex-wrap gap-2">
                        {student.strengths.map((strength, index) => (
                          <Badge key={index} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {student.areasToImprove && student.areasToImprove.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 pb-1 border-b">需要改进的领域</h4>
                      <div className="flex flex-wrap gap-2">
                        {student.areasToImprove.map((area, index) => (
                          <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="academic" className="focus-visible:outline-none focus-visible:ring-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">学术记录</CardTitle>
                <CardDescription>学生的学术表现和成绩记录</CardDescription>
              </CardHeader>
              <CardContent>
                {student.academicRecords && student.academicRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>科目</TableHead>
                        <TableHead>成绩</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>日期</TableHead>
                        <TableHead className="hidden md:table-cell">评价</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.academicRecords.map((record) => {
                        // 根据成绩生成不同的颜色
                        let scoreClass = "text-gray-800";
                        if (record.score >= 90) scoreClass = "text-emerald-600 font-semibold";
                        else if (record.score >= 80) scoreClass = "text-blue-600 font-semibold";
                        else if (record.score >= 70) scoreClass = "text-amber-600 font-semibold";
                        else if (record.score < 60) scoreClass = "text-red-600 font-semibold";
                        
                        return (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.subject}</TableCell>
                            <TableCell className={scoreClass}>{record.score}</TableCell>
                            <TableCell>{record.type}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{record.date}</TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[300px] truncate">
                              {record.comment && (
                                <Tooltip>
                                  <TooltipTrigger className="cursor-help underline decoration-dotted">
                                    查看评价
                                  </TooltipTrigger>
                                  <TooltipContent className="w-[300px]">
                                    <p className="text-sm">{record.comment}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">暂无学术记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes" className="focus-visible:outline-none focus-visible:ring-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">教师笔记</CardTitle>
                <CardDescription>记录与学生相关的重要信息和观察</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleNoteSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="note">添加新笔记</Label>
                    <Textarea 
                      id="note"
                      placeholder="输入有关该学生的笔记..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[100px] resize-y max-h-[300px]"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      笔记将以教师的名义保存
                    </p>
                    <Button type="submit" disabled={!newNote.trim()}>保存笔记</Button>
                  </div>
                  {noteSubmitted && (
                    <div className="bg-green-50 text-green-700 text-sm p-2 rounded-md border border-green-200 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      笔记已成功保存
                    </div>
                  )}
                </form>
                
                <div className="space-y-3 pt-4">
                  <h4 className="font-medium text-sm flex items-center border-b pb-2">
                    <History className="h-4 w-4 mr-2 text-muted-foreground" />
                    历史笔记
                  </h4>
                  
                  {student.notes && student.notes.length > 0 ? (
                    <div className="space-y-2">
                      {student.notes.map((note, index) => (
                        <div 
                          key={note.id || index} 
                          className="bg-gray-50 p-3 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors cursor-default"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full border">
                              {note.date}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {note.author}
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-line">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>暂无笔记记录</p>
                      <p className="text-xs">添加第一条笔记来记录学生情况</p>
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
        // 默认选中第一个学生
        if (data.length > 0 && !selectedStudent) {
          setSelectedStudent(data[0]);
        }
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
        <h1 className="text-2xl font-bold text-gray-800">我的学生</h1>
        <div className="flex h-[calc(100vh-12rem)] bg-gray-50/50 rounded-xl overflow-hidden">
          <div className="w-1/4 bg-white/80">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2 p-3">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-3/4">
            <Skeleton className="h-10 w-full" />
            <div className="p-5">
              <Skeleton className="h-8 w-full mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          </div>
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

  return (
    <div className="space-y-6">
      <div className="flex h-[calc(100vh-8rem)]">
        <div className="w-1/5">
          <StudentList 
            students={students} 
            onSelectStudent={setSelectedStudent}
            selectedStudentId={selectedStudent?.id || null}
          />
        </div>
        <div className="w-4/5">
          {selectedStudent ? (
            <StudentDetail student={selectedStudent} />
          ) : (
            <div className="bg-white rounded-r-xl shadow-sm border border-gray-100 h-full flex items-center justify-center">
              <div className="text-center p-8">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">请从左侧选择一名学生查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 