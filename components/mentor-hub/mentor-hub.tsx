"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { MentorList } from "./mentor-list";
import { MentorDetail } from "./mentor-detail";
import { Button } from "../ui/button";
import { Mentor } from "@/types/student";
import { Loader2 } from "lucide-react";
import { 
  TabsSkeleton, 
  ListSkeleton,
  DetailSkeleton 
} from "../ui/skeleton-loader";
import TeacherView from "./teacher-view";

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
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={handleRetry} 
              className="mt-4"
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
            className="mb-6 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 group-hover:-translate-x-0.5 transition-transform">
              <path d="m15 18-6-6 6-6"/>
            </svg>
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
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <CardContent className="p-0">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start bg-slate-50/80 px-6 pt-4 border-b border-gray-100">
            <TabsTrigger 
              value="all" 
              className="rounded-t-lg rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-white"
            >
              全部导师
            </TabsTrigger>
            <TabsTrigger 
              value="with-students" 
              className="rounded-t-lg rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-white"
            >
              有学生
            </TabsTrigger>
            <TabsTrigger 
              value="without-students" 
              className="rounded-t-lg rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-white"
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
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100">
                  <p>{error}</p>
                  <Button variant="outline" onClick={handleRetry} className="mt-4">重试</Button>
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
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100">
                  <p>{error}</p>
                  <Button variant="outline" onClick={handleRetry} className="mt-4">重试</Button>
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