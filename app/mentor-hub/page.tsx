"use client";

import React, { useState, useEffect } from "react";
import { MentorHub } from "@/components/mentor-hub/mentor-hub";
import { Users, Plus, UserCircle, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/ui/hero-section";
import TeacherView from "@/components/mentor-hub/teacher-view";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// 用户角色类型
type UserRole = 'admin' | 'teacher' | 'student';

export default function MentorHubPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 检查用户角色
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        setIsLoading(true);
        // 尝试获取教师信息
        const teacherResponse = await fetch('/api/teacher/me');
        
        if (teacherResponse.ok) {
          setUserRole('teacher');
        } else {
          // 这里可以添加学生角色检查逻辑
          // 暂时默认为管理员
          setUserRole('admin');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserRole('admin'); // 出错时默认为管理员
        toast.error("获取用户角色失败，使用默认视图");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserRole();
  }, []);
  
  // 根据角色返回不同的页面标题和操作按钮
  const getRoleBasedContent = () => {
    if (userRole === 'teacher') {
      return {
        title: "我的学生",
        description: "查看和管理您指导的学生信息",
        icon: UserCircle,
        gradient: "from-blue-50 to-indigo-50",
        actions: (
          <Button 
            className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium"
          >
            <Plus className="mr-2 h-4 w-4" />
            添加笔记
          </Button>
        )
      };
    }
    
    // 默认管理员视图
    return {
      title: "全员导师",
      description: "浏览、管理和分配导师资源",
      icon: Users,
      gradient: "from-amber-50 to-yellow-50",
      actions: (
        <Button 
          className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium"
        >
          <UserCog className="mr-2 h-4 w-4" />
          分配导师
        </Button>
      )
    };
  };
  
  const content = getRoleBasedContent();
  
  // 加载状态
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl"></div>
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm h-[500px]"></div>
        </div>
      </div>
    );
  }
  
  // 如果用户是教师，直接渲染TeacherView组件
  if (userRole === 'teacher') {
    return (
      <div className="h-full flex flex-col">
        {/* 页面标题区域 */}
        <HeroSection
          title={content.title}
          description={content.description}
          icon={content.icon}
          gradient={content.gradient}
          actions={content.actions}
          className="mb-6"
        />
        
        {/* 教师视图直接显示 */}
        <div className="flex-1">
          <TeacherView />
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* 页面标题区域 */}
      <HeroSection
        title={content.title}
        description={content.description}
        icon={content.icon}
        gradient={content.gradient}
        actions={content.actions}
        className="mb-6"
      />
      
      {/* 主要内容区域 */}
      <div className="flex-1">
        <MentorHub />
      </div>
    </div>
  );
} 