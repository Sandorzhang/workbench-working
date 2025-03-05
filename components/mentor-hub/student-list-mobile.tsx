'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, RefreshCw } from 'lucide-react';

// 学生类型定义
interface Student {
  id: string;
  name: string;
  studentId: string;
  grade: string;
  class: string;
  avatar?: string;
  indicators: {
    id: string;
    name: string;
    value: number;
    maxValue: number;
    color?: string;
  }[];
}

interface StudentListMobileProps {
  title?: string;
  onSelectStudent?: (student: Student) => void;
  className?: string;
}

export function StudentListMobile({
  title = "学生列表",
  onSelectStudent,
  className
}: StudentListMobileProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    // 从API获取学生数据
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // 实际项目中应该使用API获取数据
        const response = await fetch('/api/mentor/students');
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (error) {
        console.error('获取学生列表失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);
  
  // 过滤学生
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // 刷新数据
  const handleRefresh = async () => {
    try {
      setLoading(true);
      // 实际项目中应该使用API获取数据
      const response = await fetch('/api/mentor/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('获取学生列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className={`max-w-[280px] h-full flex flex-col ${className}`}>
      <CardHeader className="px-3 py-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium flex items-center">
          {title}
          <Badge variant="outline" className="ml-2 text-[10px] h-4 px-1.5">
            {filteredStudents.length}/{students.length}
          </Badge>
        </CardTitle>
        <button 
          onClick={handleRefresh} 
          className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>
      
      <div className="px-3 py-1.5 border-b border-t border-gray-100">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="搜索学生..." 
            className="h-7 text-xs pl-7 pr-2 rounded-md border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground hover:text-gray-700 transition-colors"
              onClick={() => setSearchQuery("")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <CardContent className="flex-1 p-0 overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-2 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="student-list">
            {filteredStudents.map((student, index) => (
              <div 
                key={student.id} 
                className={`p-2 ${index !== filteredStudents.length - 1 ? 'border-b border-gray-100' : ''} flex items-center cursor-pointer hover:bg-slate-50 transition-all duration-200`}
                onClick={() => onSelectStudent && onSelectStudent(student)}
              >
                <Avatar className="h-8 w-8 mr-2 ring-1 ring-gray-100">
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback className="text-xs bg-slate-100 text-slate-500">{student.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-slate-700 truncate">
                      {student.name}
                      <span className="ml-1.5 font-normal text-xs text-muted-foreground">
                        {student.studentId}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground bg-gray-50 px-1 py-0.5 rounded whitespace-nowrap">
                      {student.grade}{student.class}班
                    </p>
                  </div>
                  <div className="flex mt-1.5 space-x-1.5">
                    {student.indicators.map((indicator) => {
                      // 定义颜色
                      const bgColor = indicator.color || "bg-blue-500";
                      const lightBgColor = indicator.color?.replace("500", "100") || "bg-blue-100";
                      const borderColor = indicator.color?.replace("500", "200") || "border-blue-200";
                      const textColor = indicator.color?.replace("500", "700") || "text-blue-700";
                      
                      // 计算百分比
                      const percentage = (indicator.value / indicator.maxValue) * 100;
                      
                      return (
                        <div key={indicator.id} className="relative flex items-center justify-center">
                          <div className={`hexagon w-5 h-5 flex items-center justify-center text-xs font-medium border ${borderColor}`}>
                            <div className={`hexagon-background ${lightBgColor}`}></div>
                            <div 
                              className={`hexagon-fill ${bgColor}`} 
                              style={{ height: `${percentage}%` }}
                            ></div>
                            <span className={`relative z-10 text-[9px] font-semibold ${textColor}`}>
                              {indicator.value}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 p-4">
            <Search className="h-5 w-5 text-muted-foreground opacity-20 mb-2" />
            <p className="text-xs text-muted-foreground text-center">未找到匹配的学生</p>
            {searchQuery && (
              <button 
                className="mt-2 text-xs text-primary hover:underline"
                onClick={() => setSearchQuery("")}
              >
                清除搜索
              </button>
            )}
          </div>
        )}
      </CardContent>
      
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
        
        .student-list::-webkit-scrollbar {
          width: 3px;
        }
        
        .student-list::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .student-list::-webkit-scrollbar-thumb {
          background-color: rgba(203, 213, 225, 0.4);
          border-radius: 3px;
        }
        
        .student-list::-webkit-scrollbar-thumb:hover {
          background-color: rgba(148, 163, 184, 0.6);
        }
      `}</style>
    </Card>
  );
} 