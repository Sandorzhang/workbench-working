"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { MentorList } from "./mentor-list";
import { MentorDetail } from "./mentor-detail";
import { Button } from "../ui/button";
import { Mentor } from "@/types/models/mentor";
import { Loader2, ArrowLeft } from "lucide-react";
import { 
  TabsSkeleton, 
  ListSkeleton,
  DetailSkeleton 
} from "../ui/skeleton-loader";
import TeacherView from "./teacher-view";
import { cn } from "@/lib/utils";

// 角色类型
type UserRole = 'admin' | 'teacher' | 'student';

export function MentorHub() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [userRole, setUserRole] = useState<UserRole>('admin'); // 默认为管理员视图
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  // 检查当前用户角色
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // 从 API 获取当前用户信息
        const response = await fetch('/api/teacher/me');
        
        // 如果成功，则用户是教师
        if (response.ok) {
          setUserRole('teacher');
        } else {
          // 这里可以添加学生角色检查逻辑
          // 暂时默认为管理员
          setUserRole('admin');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserRole('admin'); // 出错时默认为管理员
      } finally {
        setIsCheckingRole(false);
      }
    };
    
    checkUserRole();
  }, []);

  useEffect(() => {
    // 如果是教师角色，不需要加载导师列表
    if (userRole === 'teacher' && !isCheckingRole) {
      setIsLoading(false);
      return;
    }
    
    const fetchMentors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`尝试获取导师数据... (尝试: ${retryCount + 1})`);
        const response = await fetch('/api/mentors');
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error(`获取导师数据失败 (状态: ${response.status}):`, errorText);
          throw new Error(`获取导师数据失败 (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        console.log('成功获取导师数据:', data);
        setMentors(data);
      } catch (err) {
        console.error('导师数据获取错误:', err);
        setError(`获取导师数据失败: ${err instanceof Error ? err.message : '未知错误'}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isCheckingRole) {
      fetchMentors();
    }
  }, [retryCount, userRole, isCheckingRole]);

  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

  const handleSelectMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
  };

  const handleBackToList = () => {
    setSelectedMentor(null);
  };

  // 教师视图渲染
  if (userRole === 'teacher' && !isCheckingRole) {
    return <TeacherView />;
  }

  // 管理员视图渲染
  const renderContent = () => {
    if (isCheckingRole || isLoading) {
      return (
        <div className="p-6 animate-fadeIn">
          <TabsSkeleton tabCount={3} className="mb-6" />
          {selectedMentor ? <DetailSkeleton /> : <ListSkeleton className="space-y-4" />}
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="p-6 text-center">
          <div className="bg-red-50/80 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-100/80 dark:border-red-800/30 backdrop-blur-sm">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={handleRetry} 
              className="mt-4 bg-white/90 dark:bg-gray-800/90"
            >
              重试
            </Button>
          </div>
        </div>
      );
    }
    
    if (selectedMentor) {
      return (
        <div className="p-6">
          <Button 
            variant="outline" 
            onClick={handleBackToList} 
            className="mb-6 group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90 border-gray-100/80 dark:border-gray-700/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            返回列表
          </Button>
          <MentorDetail mentor={selectedMentor} onBack={handleBackToList} />
        </div>
      );
    }
    
    return (
      <div className="p-6">
        <MentorList mentors={mentors} onSelectMentor={handleSelectMentor} />
      </div>
    );
  };

  return (
    <div className={cn(
      "rounded-xl border border-gray-100/60 dark:border-gray-800/40 overflow-hidden",
      "bg-gradient-to-b from-white/90 to-white/95 dark:from-gray-900/90 dark:to-gray-900/95",
      "backdrop-blur-sm backdrop-filter",
      "shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
    )}>
      <CardContent className="p-0">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className={cn(
            "w-full justify-start px-6 pt-4 border-b",
            "border-gray-100/80 dark:border-gray-800/60",
            "bg-gradient-to-b from-gray-50/90 to-gray-100/30 dark:from-gray-800/50 dark:to-gray-900/30"
          )}>
            <TabsTrigger 
              value="all" 
              className={cn(
                "rounded-t-lg rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80",
                "data-[state=active]:backdrop-blur-sm data-[state=active]:backdrop-filter",
                "transition-all duration-200"
              )}
            >
              全部导师
            </TabsTrigger>
            <TabsTrigger 
              value="with-students" 
              className={cn(
                "rounded-t-lg rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80",
                "data-[state=active]:backdrop-blur-sm data-[state=active]:backdrop-filter",
                "transition-all duration-200"
              )}
            >
              有学生
            </TabsTrigger>
            <TabsTrigger 
              value="without-students" 
              className={cn(
                "rounded-t-lg rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80",
                "data-[state=active]:backdrop-blur-sm data-[state=active]:backdrop-filter",
                "transition-all duration-200"
              )}
            >
              无学生
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="focus-visible:outline-none focus-visible:ring-0">
            {renderContent()}
          </TabsContent>
          
          <TabsContent value="with-students" className="focus-visible:outline-none focus-visible:ring-0">
            {isLoading ? (
              <div className="p-6 animate-fadeIn">
                <ListSkeleton className="space-y-4" />
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="bg-red-50/80 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-100/80 dark:border-red-800/30 backdrop-blur-sm">
                  <p>{error}</p>
                  <Button variant="outline" onClick={handleRetry} className="mt-4 bg-white/90 dark:bg-gray-800/90">重试</Button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <MentorList 
                  mentors={mentors.filter(mentor => mentor.students && mentor.students.length > 0)} 
                  onSelectMentor={handleSelectMentor} 
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="without-students" className="focus-visible:outline-none focus-visible:ring-0">
            {isLoading ? (
              <div className="p-6 animate-fadeIn">
                <ListSkeleton className="space-y-4" />
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="bg-red-50/80 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-100/80 dark:border-red-800/30 backdrop-blur-sm">
                  <p>{error}</p>
                  <Button variant="outline" onClick={handleRetry} className="mt-4 bg-white/90 dark:bg-gray-800/90">重试</Button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <MentorList 
                  mentors={mentors.filter(mentor => !mentor.students || mentor.students.length === 0)} 
                  onSelectMentor={handleSelectMentor} 
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  );
} 