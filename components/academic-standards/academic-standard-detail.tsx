"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/ui/page-container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { StandardNavigation } from "@/components/academic-standards/standard-navigation";
import { StandardDetails } from "@/components/academic-standards/standard-details";
import { KnowledgeGraph } from "@/components/academic-standards/knowledge-graph";
import { Input } from "@/components/ui/input";

// 核心概念关系图数据类型
interface GraphData {
  nodes: {
    id: string;
    label: string;
    type: "core" | "concept" | "skill" | "knowledge";
    level?: number;
  }[];
  links: {
    source: string;
    target: string;
    label?: string;
  }[];
}

// 标准详情类型
interface StandardDetail {
  id: string;
  title: string;
  category: string;
  subject: string;
  subjectName: string;
  grade: string;
  description: string;
  code: string;
  domain: string;
  objectives: {
    id: string;
    content: string;
    type: "knowledge" | "skill" | "attitude";
    code: string;
  }[];
  conceptMap?: GraphData;
}

// 标准导航项目类型
interface StandardNavItem {
  id: string;
  title: string;
  type: "standard" | "domain";
  grade: string;
  code: string;
}

// 年级组类型
interface GradeGroup {
  grade: string;
  items: StandardNavItem[];
}

export default function AcademicStandardDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const standardId = id;

  const [standard, setStandard] = useState<StandardDetail | null>(null);
  const [navigationData, setNavigationData] = useState<GradeGroup[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("math");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGraphDialogOpen, setIsGraphDialogOpen] = useState<boolean>(false);

  // 检查认证状态
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error("请先登录");
        router.push("/login");
      }
    }
  }, [authLoading, isAuthenticated, router]);

  // 获取学业标准详情
  useEffect(() => {
    const fetchStandardDetail = async () => {
      setIsLoading(true);

      try {
        if (!standardId) return;

        const response = await fetch(`/api/academic-standards/${standardId}`);
        if (!response.ok) {
          throw new Error("获取标准详情失败");
        }

        const data = await response.json();
        setStandard(data);

        // 如果有主题ID，则同时加载导航数据
        fetchNavigationData(data.subject);

        setSelectedSubject(data.subject);
        setIsLoading(false);
      } catch (error) {
        console.error("获取学业标准详情失败:", error);
        toast.error("获取学业标准详情失败");
        setIsLoading(false);
      }
    };

    fetchStandardDetail();
  }, [standardId]);

  // 获取导航数据
  const fetchNavigationData = async (subject: string) => {
    try {
      const response = await fetch(
        `/api/academic-standards/navigation?subject=${subject}`
      );
      if (!response.ok) {
        throw new Error("获取导航数据失败");
      }

      const data = await response.json();
      setNavigationData(data);
    } catch (error) {
      console.error("获取导航数据失败:", error);
      toast.error("获取导航数据失败");
    }
  };

  // 处理学科切换
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    fetchNavigationData(value);
  };

  // 处理标准点击
  const handleStandardSelect = (id: string) => {
    router.push(`/academic-standards/${id}`);
  };

  // 打开/关闭图谱对话框
  const toggleGraphDialog = () => {
    setIsGraphDialogOpen(!isGraphDialogOpen);
  };

  return (
    <PageContainer>
      <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:space-x-8">
        {/* 左侧导航区域 */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-4 space-y-4">
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                onClick={() => router.push("/academic-standards")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Select
                value={selectedSubject}
                onValueChange={handleSubjectChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择学科" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">数学</SelectItem>
                  <SelectItem value="chinese">语文</SelectItem>
                  <SelectItem value="english">英语</SelectItem>
                  <SelectItem value="science">科学</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="搜索标准" className="pl-9" />
            </div>

            <div className="border rounded-md">
              <StandardNavigation
                data={navigationData}
                isLoading={isLoading}
                selectedId={standardId as string}
                onSelectStandard={handleStandardSelect}
                subject={selectedSubject}
              />
            </div>
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-grow">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : standard ? (
            <div className="space-y-6">
              {/* 知识图谱 */}
              <KnowledgeGraph
                data={standard.conceptMap}
                onFullscreen={toggleGraphDialog}
              />

              {/* 标准详情 */}
              <StandardDetails
                data={{
                  id: standard.id,
                  title: standard.title,
                  description: standard.description,
                  code: standard.code || standard.id,
                  grade: standard.grade,
                  domain: standard.domain || standard.category,
                  objectives: standard.objectives || [],
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">未找到标准详情</p>
              <Button
                onClick={() => router.push("/academic-standards")}
                variant="outline"
                className="mt-4"
              >
                返回列表
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 全屏图谱对话框 */}
      <Dialog open={isGraphDialogOpen} onOpenChange={setIsGraphDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>概念关系图谱</DialogTitle>
          </DialogHeader>
          <div className="h-[70vh]">
            {standard && <KnowledgeGraph data={standard.conceptMap} title="" />}
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
