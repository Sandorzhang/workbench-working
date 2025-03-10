"use client";

import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Search, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// 概念节点类型
interface ConceptNode {
  id: string;
  name: string;
  description: string;
  type: string; // 'big' | 'small'
  targets: string[];
  subject: string;
}

// 概念关系类型
interface ConceptLink {
  id: string;
  source: string;
  target: string;
  relationType: number; // 1-12
}

// 概念地图数据类型
interface ConceptMapData {
  nodes: ConceptNode[];
  links: ConceptLink[];
}

interface ConceptMapViewProps {
  subject?: string;
  isLoading?: boolean;
  onFullscreen?: () => void;
}

// 关系类型映射
const relationTypeMap: Record<number, string> = {
  1: "包含",
  2: "属于",
  3: "相关",
  4: "先决条件",
  5: "应用",
  6: "衍生",
  7: "对比",
  8: "类似",
  9: "定义",
  10: "实例",
  11: "解释",
  12: "过程",
};

// 使用动态导入，禁用SSR
const SigmaGraphComponent = dynamic(
  () =>
    import("@/components/concept-map/sigma-graph-component").then((mod) => {
      // 确保mod和SigmaGraphComponent都存在
      if (!mod || !mod.SigmaGraphComponent) {
        console.error("SigmaGraphComponent导入失败:", mod);
      }
      return mod.SigmaGraphComponent;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-[300px] w-[500px] rounded-md" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
      </div>
    ),
  }
) as React.ComponentType<{
  data: ConceptMapData;
  onNodeClick: (node: ConceptNode) => void;
}>;

export function ConceptMapView({
  subject = "数学",
  isLoading = false,
  onFullscreen,
}: ConceptMapViewProps) {
  const [mapData, setMapData] = useState<ConceptMapData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(subject);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);

  // 获取概念地图数据
  useEffect(() => {
    const fetchConceptMap = async () => {
      setIsMapLoading(true);
      try {
        const response = await fetch(`/api/concept-map/${selectedSubject}`);
        if (!response.ok) {
          throw new Error("获取概念地图数据失败");
        }
        const data = await response.json();
        setMapData(data);
      } catch (error) {
        console.error("获取概念地图数据错误:", error);
        toast.error("获取概念地图数据失败，请稍后再试");
      } finally {
        setIsMapLoading(false);
      }
    };

    fetchConceptMap();
  }, [selectedSubject]);

  // 搜索概念
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `/api/concept-map/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) {
        throw new Error("搜索概念失败");
      }
      const data = await response.json();
      if (data.length > 0) {
        toast.success(`找到 ${data.length} 个相关概念`);
        if (data[0]) {
          setSelectedNode(data[0]);
        }
      } else {
        toast.info("未找到相关概念");
      }
    } catch (error) {
      console.error("搜索概念错误:", error);
      toast.error("搜索失败，请稍后再试");
    }
  };

  // 处理学科变更
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    setSelectedNode(null);
  };

  // 处理节点点击
  const handleNodeClick = (node: ConceptNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-medium">概念地图</h2>
          <Select value={selectedSubject} onValueChange={handleSubjectChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择学科" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="数学">数学</SelectItem>
              <SelectItem value="物理">物理</SelectItem>
              <SelectItem value="化学">化学</SelectItem>
              <SelectItem value="生物">生物</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索概念..."
              className="pr-10 w-64"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Search
              className="absolute right-3 h-4 w-4 text-muted-foreground cursor-pointer"
              onClick={handleSearch}
            />
          </div>

          {onFullscreen && (
            <Button variant="outline" size="icon" onClick={onFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1 p-4">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-card rounded-lg border overflow-hidden relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-[300px] w-[500px] rounded-md" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
            </div>
          ) : (
            <div className="w-full h-full min-h-[500px] concept-map-container">
              {/* 客户端渲染的SigmaJS组件 */}
              {mapData && !isMapLoading && (
                <SigmaGraphComponent
                  data={mapData}
                  onNodeClick={handleNodeClick}
                />
              )}

              {isMapLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-[300px] w-[500px] rounded-md" />
                    <Skeleton className="h-4 w-[250px]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="col-span-1 flex flex-col gap-4">
          <div className="bg-card rounded-lg border p-4 concept-detail-panel">
            <h3 className="text-lg font-medium mb-2">概念详情</h3>
            {selectedNode ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-base font-medium">{selectedNode.name}</h4>
                  <Badge
                    variant={
                      selectedNode.type === "big" ? "default" : "secondary"
                    }
                  >
                    {selectedNode.type === "big" ? "大概念" : "小概念"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedNode.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-sm font-medium">三维目标:</span>
                  {selectedNode.targets.map((target) => (
                    <Badge key={target} variant="outline">
                      {target}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>点击概念节点查看详情</p>
              </div>
            )}
          </div>

          <div className="bg-card rounded-lg border p-4">
            <h3 className="text-lg font-medium mb-2">图例</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#34a853]" />
                <span className="text-sm">大概念</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#4285f4]" />
                <span className="text-sm">小概念</span>
              </div>
            </div>

            <h4 className="text-base font-medium mt-4 mb-2">关系类型</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(relationTypeMap).map(([id, name]) => (
                <div key={id} className="flex items-center gap-1.5 text-xs">
                  <span className="font-medium">{id}:</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
