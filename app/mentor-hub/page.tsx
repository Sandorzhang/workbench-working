"use client";

import React from "react";
import { MentorHub } from "@/components/mentor-hub/mentor-hub";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MentorHubPage() {
  return (
    <div className="h-full flex flex-col">
      {/* 页面标题区域 */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center">
          <div className="bg-white p-4 shadow-sm rounded-2xl mr-6 border border-gray-100/80">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">全员导师管理系统</h1>
            <p className="text-gray-500 mt-1.5 text-sm font-normal">浏览、管理和分配导师资源</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium"
          >
            <Users className="mr-2 h-4 w-4" />
            分配导师
          </Button>
        </div>
      </div>
      
      {/* 主要内容区域 */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100/60 overflow-hidden shadow-sm">
        <MentorHub />
      </div>
    </div>
  );
} 