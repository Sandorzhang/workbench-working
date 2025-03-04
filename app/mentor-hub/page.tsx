"use client";

import React from "react";
import { MentorHub } from "@/components/mentor-hub/mentor-hub";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/ui/hero-section";

export default function MentorHubPage() {
  return (
    <div className="h-full flex flex-col">
      {/* 页面标题区域 */}
      <HeroSection
        title="全员导师管理系统"
        description="浏览、管理和分配导师资源"
        icon={Users}
        gradient="from-amber-50 to-yellow-50"
      />
      
      <div className="flex items-center space-x-3 -mt-2 mb-6">
        <Button 
          className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium"
        >
          <Users className="mr-2 h-4 w-4" />
          分配导师
        </Button>
      </div>
      
      {/* 主要内容区域 */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100/60 overflow-hidden shadow-sm">
        <MentorHub />
      </div>
    </div>
  );
} 