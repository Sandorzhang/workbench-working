'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
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
import { Info, Search, Maximize2, Network, Zap, ArrowRight, Book } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

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
  1: '包含',
  2: '属于',
  3: '相关',
  4: '先决条件',
  5: '应用',
  6: '衍生',
  7: '对比',
  8: '类似',
  9: '定义',
  10: '实例',
  11: '解释',
  12: '过程'
};

// 使用动态导入，禁用SSR
const SigmaGraphComponent = dynamic(
  () => import('@/components/concept-map/sigma-graph-component').then((mod) => {
    // 确保mod和SigmaGraphComponent都存在
    if (!mod || !mod.SigmaGraphComponent) {
      console.error('SigmaGraphComponent导入失败:', mod);
    }
    return mod.SigmaGraphComponent;
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-[300px] w-[500px] rounded-xl" />
          <Skeleton className="h-5 w-[250px]" />
        </div>
      </div>
    ) 
  }
) as React.ComponentType<{ data: ConceptMapData; onNodeClick: (node: ConceptNode) => void }>;

export function ConceptMapView({ 
  subject = '数学',
  isLoading = false,
  onFullscreen 
}: ConceptMapViewProps) {
  const [mapData, setMapData] = useState<ConceptMapData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
          throw new Error('获取概念地图数据失败');
        }
        const data = await response.json();
        setMapData(data);
      } catch (error) {
        console.error('获取概念地图数据错误:', error);
        toast.error('获取概念地图数据失败，请稍后再试');
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
      const response = await fetch(`/api/concept-map/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('搜索概念失败');
      }
      const data = await response.json();
      if (data.length > 0) {
        toast.success(`找到 ${data.length} 个相关概念`);
        if (data[0]) {
          setSelectedNode(data[0]);
        }
      } else {
        toast.info('未找到相关概念');
      }
    } catch (error) {
      console.error('搜索概念错误:', error);
      toast.error('搜索失败，请稍后再试');
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
      <div className={cn(
        "flex items-center justify-between p-4 md:p-5",
        "border-b border-gray-100/80 dark:border-gray-800/60",
        "bg-gradient-to-r from-gray-50/60 via-white/30 to-gray-50/60",
        "dark:from-gray-900/60 dark:via-gray-800/40 dark:to-gray-900/60",
        "backdrop-blur-sm backdrop-filter"
      )}>
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Network className="h-5 w-5 text-indigo-500" />
            <span>概念地图</span>
            <Badge className="ml-1 bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200/80 border-indigo-200/50">
              {selectedSubject}
            </Badge>
          </h2>
          <Select value={selectedSubject} onValueChange={handleSubjectChange}>
            <SelectTrigger className="w-[180px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200/80 dark:border-gray-700/60">
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
        
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索概念..."
              className="pr-10 w-64 border-gray-200/80 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search 
              className="absolute right-3 h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors"
              onClick={handleSearch}
            />
          </div>
          
          {onFullscreen && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onFullscreen}
              className="border-gray-200/80 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white/95 dark:hover:bg-gray-800/95"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 flex-1 p-4 md:p-5 bg-gradient-to-br from-indigo-50/20 to-white/60 dark:from-indigo-950/10 dark:to-gray-900/80">
        <div className={cn(
          "col-span-1 md:col-span-3 rounded-xl overflow-hidden relative",
          "border border-gray-100/60 dark:border-gray-800/40",
          "bg-white/80 dark:bg-gray-900/80",
          "shadow-md backdrop-blur-sm backdrop-filter"
        )}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-[300px] w-[500px] rounded-xl" />
                <Skeleton className="h-5 w-[250px]" />
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
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-[300px] w-[500px] rounded-xl" />
                    <Skeleton className="h-5 w-[250px]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="col-span-1 flex flex-col gap-5">
          <div className={cn(
            "flex-1 rounded-xl p-5 relative overflow-hidden",
            "border border-gray-100/60 dark:border-gray-800/40",
            "bg-gradient-to-br from-white/80 to-gray-50/30 dark:from-gray-900/80 dark:to-gray-800/30",
            "shadow-md backdrop-blur-sm backdrop-filter"
          )}>
            {/* 装饰性背景元素 */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-200/20 to-transparent rounded-full -mr-20 -mt-20 blur-3xl opacity-50 dark:opacity-30"></div>
            <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-[1px] backdrop-filter z-0"></div>
            
            <div className="relative z-10 h-full flex flex-col">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-1.5 text-gray-900 dark:text-gray-100">
                <Zap className="h-4 w-4 text-indigo-500" />
                概念详情
              </h3>
              
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">{selectedNode.name}</h4>
                    <Badge variant={selectedNode.type === 'big' ? 'default' : 'secondary'} className={cn(
                      selectedNode.type === 'big' 
                        ? 'bg-green-100/80 text-green-700 hover:bg-green-200/80 border-green-200/50'
                        : 'bg-blue-100/80 text-blue-700 hover:bg-blue-200/80 border-blue-200/50'
                    )}>
                      {selectedNode.type === 'big' ? '大概念' : '小概念'}
                    </Badge>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100/60 dark:border-gray-800/40">
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {selectedNode.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <Book className="h-3.5 w-3.5 text-indigo-500" />
                      三维目标:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.targets.map((target) => (
                        <Badge 
                          key={target} 
                          variant="outline"
                          className="bg-white/70 dark:bg-gray-800/70 border-gray-200/60 dark:border-gray-700/40 text-gray-700 dark:text-gray-300"
                        >
                          {target}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full border-indigo-200/50 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/60 dark:border-indigo-800/30 dark:text-indigo-400 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/40"
                  >
                    探索相关概念
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-indigo-50/80 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                    <Info className="h-8 w-8 text-indigo-400 dark:text-indigo-500" />
                  </div>
                  <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1.5">选择概念节点</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    点击左侧图谱中的节点查看详细信息
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className={cn(
            "rounded-xl p-4 relative overflow-hidden",
            "border border-gray-100/60 dark:border-gray-800/40",
            "bg-gradient-to-r from-white/80 to-gray-50/30 dark:from-gray-900/80 dark:to-gray-800/30",
            "shadow-md backdrop-blur-sm backdrop-filter"
          )}>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">关系类型说明</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {Object.entries(relationTypeMap).map(([key, value]) => (
                <div key={key} className="flex items-center text-xs">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mr-1.5">
                    {key}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 