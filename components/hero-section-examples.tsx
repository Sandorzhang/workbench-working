'use client';

import React from 'react';
import { HeroSection } from '@/components/ui/hero-section';
import { Button } from '@/components/ui/button';
import { Book, Sparkles, ArrowRight, ChevronRight, Globe, Users, Award, LightbulbIcon, Clock, Bell } from 'lucide-react';

export function HeroSectionExamples() {
  return (
    <div className="space-y-8 py-6">
      {/* 基本的Hero Section - 现在默认更紧凑 */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-800">默认尺寸的Hero Section</h2>
        <HeroSection
          title="课程学习中心"
          description="探索和管理您的学习旅程，跟踪进度，并发现新的学习资源。"
          icon={Book}
          actions={
            <Button size="sm">
              开始学习
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          }
        />
      </div>

      {/* 超小尺寸的Hero Section */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-800">超小尺寸的Hero Section</h2>
        <HeroSection
          title="通知中心"
          description="查看您最新的系统通知和重要更新。"
          icon={Bell}
          size="xs"
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50/80 dark:bg-rose-900/20"
          gradient="from-rose-50/40 via-rose-50/20 to-transparent"
          actions={
            <Button variant="outline" size="sm">
              查看全部
            </Button>
          }
        />
      </div>

      {/* 紧凑模式的Hero Section */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-800">紧凑模式的Hero Section</h2>
        <HeroSection
          title="时间管理"
          description="高效安排您的学习计划，合理分配时间。"
          icon={Clock}
          compact
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50/80 dark:bg-emerald-900/20"
          gradient="from-emerald-50/40 via-emerald-50/20 to-transparent"
          actions={
            <Button variant="outline" size="sm">
              设置提醒
            </Button>
          }
        />
      </div>

      {/* 小尺寸的Hero Section */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-800">常规尺寸的Hero Section</h2>
        <HeroSection
          title="全球视野"
          description="连接世界各地的教育资源，开阔您的国际化视野。"
          icon={Globe}
          size="md"
          iconColor="text-blue-600"
          gradient="from-blue-50/40 via-blue-50/20 to-transparent"
          actions={
            <Button>
              浏览课程
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          }
        />
      </div>

      {/* 大尺寸的Hero Section */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-800">大尺寸的Hero Section</h2>
        <HeroSection
          title="学习成就展示"
          description="查看您的学习成就，证书和徽章。持续学习，不断积累新的技能和知识。"
          icon={Award}
          size="lg"
          shadow="md"
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50/80 dark:bg-amber-900/20"
          gradient="from-amber-50/40 via-amber-50/20 to-transparent"
          actions={
            <>
              <Button>
                查看成就
              </Button>
              <Button variant="outline">
                分享成就
              </Button>
            </>
          }
        />
      </div>

      {/* 紧凑 + 装饰元素关闭的Hero Section */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-800">无装饰元素的紧凑型Hero Section</h2>
        <HeroSection
          title="创新思维实验室"
          description="激发您的创造力和批判性思维，培养解决问题的能力。"
          icon={LightbulbIcon}
          decorative={false}
          compact
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-50/80 dark:bg-yellow-900/20"
          gradient="from-yellow-50/40 to-transparent"
          actions={
            <Button variant="secondary" size="sm">
              探索工具
            </Button>
          }
        />
      </div>

      {/* 比较：不同大小的紧凑型Hero Section */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-800">尺寸对比：紧凑模式</h2>
        <div className="space-y-4">
          {/* 超小 */}
          <HeroSection
            title="XS尺寸 + 紧凑"
            description="最小、最节省空间的Hero Section变体。"
            icon={Users}
            size="xs"
            compact
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50/80 dark:bg-purple-900/20"
            gradient="from-purple-50/30 to-transparent"
            decorative={false}
          />
          
          {/* 小 */}
          <HeroSection
            title="SM尺寸 + 紧凑"
            description="小巧但有足够信息量的Hero Section。"
            icon={Users}
            size="sm"
            compact
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50/80 dark:bg-indigo-900/20"
            gradient="from-indigo-50/30 to-transparent"
            decorative={false}
          />
          
          {/* 中 */}
          <HeroSection
            title="MD尺寸 + 紧凑"
            description="标准大小但采用紧凑布局的Hero Section。"
            icon={Users}
            size="md"
            compact
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50/80 dark:bg-blue-900/20"
            gradient="from-blue-50/30 to-transparent"
            decorative={false}
          />
        </div>
      </div>
    </div>
  );
} 