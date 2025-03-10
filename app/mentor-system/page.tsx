"use client";

import React, { useState, useEffect } from "react";
import { MentorHub } from "@/components/mentor-hub/mentor-hub";
import { Users, UserCircle, UserCog, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HeroSection } from "@/components/ui/hero-section";
import TeacherView from "@/components/mentor-hub/teacher-view";
import { PageContainer } from "@/components/ui/page-container";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

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
        title: "全员导师系统",
        description: "查看和管理您指导的学生信息，跟踪学生进度，提供个性化指导和支持。",
        icon: UserCircle,
        iconColor: "text-blue-600",
        iconBgColor: "bg-blue-50/90",
        gradient: "from-blue-50/40 via-blue-50/20 to-transparent",
        actions: (
          <Button className="gap-1 shadow-sm">
            <Plus className="h-4 w-4" />
            添加学生
          </Button>
        )
      };
    }
    
    // 默认管理员视图
    return {
      title: "全员导师系统",
      description: "浏览、管理和分配导师资源，实现全校师生高效协作，打造全方位育人体系。",
      icon: Users,
      iconColor: "text-amber-600",
      iconBgColor: "bg-amber-50/90",
      gradient: "from-amber-50/40 via-amber-50/20 to-transparent",
      actions: (
        <Button className="gap-1 shadow-sm">
          <Plus className="h-4 w-4" />
          添加导师
        </Button>
      )
    };
  };
  
  const content = getRoleBasedContent();
  
  // 加载状态
  if (isLoading) {
    return (
      <PageContainer>
        <div className="h-full flex flex-col">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl"></div>
            <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm h-[500px]"></div>
          </div>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <div className="h-full flex flex-col">
        {/* Hero Section */}
        <div className="mb-8">
          <HeroSection
            title={content.title}
            description={content.description}
            icon={content.icon}
            size="md"
            iconColor={content.iconColor}
            iconBgColor={content.iconBgColor}
            gradient={content.gradient}
            shadow="md"
            actions={content.actions}
          />
        </div>
        
        {/* 内容区域 */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {userRole === 'teacher' ? <TeacherView /> : <MentorHub />}
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
} 