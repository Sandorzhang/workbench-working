'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Maximize2 } from 'lucide-react';

// 图谱节点类型
interface GraphNode {
  id: string;
  label: string;
  type: 'core' | 'concept' | 'skill' | 'knowledge';
  level?: number;
}

// 图谱连接类型
interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

// 完整图谱数据类型
interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface KnowledgeGraphProps {
  data?: GraphData;
  title?: string;
  isLoading?: boolean;
  onFullscreen?: () => void;
}

export function KnowledgeGraph({ 
  data, 
  title = "关系视图",
  isLoading = false,
  onFullscreen
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphInitialized, setGraphInitialized] = useState(false);
  
  // 模拟图谱数据（当没有提供数据时使用）
  const defaultData: GraphData = {
    nodes: [
      { id: 'core', label: '数与代数', type: 'core' },
      { id: '1', label: '数的认识', type: 'concept', level: 1 },
      { id: '2', label: '10以内的数', type: 'knowledge', level: 1 },
      { id: '3', label: '数的组成', type: 'knowledge', level: 2 },
      { id: '4', label: '数的比较', type: 'skill', level: 2 },
      { id: '5', label: '位值', type: 'concept', level: 1 },
      { id: '6', label: '个位', type: 'knowledge', level: 2 },
      { id: '7', label: '十位', type: 'knowledge', level: 2 },
      { id: '8', label: '写数字', type: 'skill', level: 1 },
      { id: '9', label: '读数字', type: 'skill', level: 1 },
      { id: '10', label: '0的认识', type: 'knowledge', level: 1 },
    ],
    links: [
      { source: 'core', target: '1' },
      { source: 'core', target: '5' },
      { source: 'core', target: '8' },
      { source: 'core', target: '9' },
      { source: 'core', target: '10' },
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '2', target: '4' },
      { source: '5', target: '6' },
      { source: '5', target: '7' },
    ]
  };

  // 绘制图谱的函数
  const renderGraph = () => {
    if (!containerRef.current || graphInitialized) return;
    
    const graphData = data || defaultData;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // 在实际项目中，这里应该使用 D3.js 或其他图谱库
    // 由于我们没有实际引入库，这里只是绘制一个简单的模拟图谱
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `-${width/2} -${height/2} ${width} ${height}`);
    
    // 创建一个简单的放射状布局
    const nodeRadius = 30;
    const totalNodes = graphData.nodes.length;
    const coreNode = graphData.nodes.find(node => node.type === 'core');
    
    // 绘制连接线
    graphData.links.forEach((link, index) => {
      const sourceNode = graphData.nodes.find(n => n.id === link.source);
      const targetNode = graphData.nodes.find(n => n.id === link.target);
      
      if (sourceNode && targetNode) {
        const sourceLevel = sourceNode.level || 0;
        const targetLevel = targetNode.level || 0;
        
        // 计算节点位置（简化的径向布局）
        const sourceIndex = graphData.nodes.indexOf(sourceNode);
        const targetIndex = graphData.nodes.indexOf(targetNode);
        
        const sourceAngle = (sourceIndex / totalNodes) * Math.PI * 2;
        const targetAngle = (targetIndex / totalNodes) * Math.PI * 2;
        
        const sourceRadius = sourceLevel * 100 || 0;
        const targetRadius = targetLevel * 100 || 0;
        
        const sourceX = Math.cos(sourceAngle) * sourceRadius;
        const sourceY = Math.sin(sourceAngle) * sourceRadius;
        
        const targetX = Math.cos(targetAngle) * targetRadius;
        const targetY = Math.sin(targetAngle) * targetRadius;
        
        // 创建连接线
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', `M${sourceX},${sourceY} L${targetX},${targetY}`);
        line.setAttribute('stroke', '#88a0b9');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('fill', 'none');
        
        svg.appendChild(line);
      }
    });
    
    // 绘制节点
    graphData.nodes.forEach((node, index) => {
      const level = node.level || 0;
      const angle = (index / totalNodes) * Math.PI * 2;
      const nodeRadius = node.type === 'core' ? 40 : 30;
      
      // 为核心节点指定中心位置，其他节点围绕它
      let x = 0, y = 0;
      if (node.type !== 'core') {
        const radius = level * 100;
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
      }
      
      // 创建节点圆形
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(x));
      circle.setAttribute('cy', String(y));
      circle.setAttribute('r', String(nodeRadius));
      circle.setAttribute('data-id', node.id);
      
      // 根据节点类型设置不同的颜色
      let fillColor = '#4285f4';
      if (node.type === 'concept') fillColor = '#34a853';
      else if (node.type === 'skill') fillColor = '#fbbc05';
      else if (node.type === 'knowledge') fillColor = '#ea4335';
      
      circle.setAttribute('fill', fillColor);
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '2');
      
      // 添加鼠标悬停效果
      circle.addEventListener('mouseover', () => {
        circle.setAttribute('stroke-width', '4');
        const text = document.querySelector(`text[data-id="${node.id}"]`);
        if (text) {
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('font-size', '14');
        }
      });
      
      circle.addEventListener('mouseout', () => {
        circle.setAttribute('stroke-width', '2');
        const text = document.querySelector(`text[data-id="${node.id}"]`);
        if (text) {
          text.setAttribute('font-weight', 'normal');
          text.setAttribute('font-size', '12');
        }
      });
      
      svg.appendChild(circle);
      
      // 创建节点文本
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(x));
      text.setAttribute('y', String(y + nodeRadius + 15));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#333');
      text.setAttribute('font-size', '12');
      text.setAttribute('data-id', node.id);
      text.textContent = node.label;
      
      svg.appendChild(text);
    });
    
    container.appendChild(svg);
    setGraphInitialized(true);
  };
  
  // 初始渲染后绘制图谱
  useEffect(() => {
    if (!isLoading) {
      // 短暂延迟确保DOM已完全渲染
      const timer = setTimeout(() => {
        renderGraph();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);
  
  // 窗口尺寸变化时重新绘制
  useEffect(() => {
    const handleResize = () => {
      setGraphInitialized(false);
      setTimeout(renderGraph, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-[240px] w-[240px] rounded-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onFullscreen}
          title="全屏模式"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="relative">
        <div 
          ref={containerRef} 
          className="h-[300px] relative overflow-hidden rounded-md bg-slate-50"
        />
        <div className="absolute bottom-4 right-4 flex flex-wrap gap-2">
          <Badge className="bg-[#4285f4]">核心概念</Badge>
          <Badge className="bg-[#34a853]">概念</Badge>
          <Badge className="bg-[#fbbc05]">技能</Badge>
          <Badge className="bg-[#ea4335]">知识点</Badge>
        </div>
        <div className="absolute bottom-4 left-4 text-sm text-gray-500">
          点击左边概念/概念关系，查看详细信息
        </div>
      </div>
    </div>
  );
} 