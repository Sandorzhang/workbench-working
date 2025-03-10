'use client';

import React, { useRef, useEffect } from 'react';
import { MultiDirectedGraph } from "graphology";
import { 
  SigmaContainer, 
  useSigma
} from "@react-sigma/core";
import { Maximize2, ZoomIn, ZoomOut, Move } from 'lucide-react';
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

// 组件属性
interface SigmaGraphComponentProps {
  data: ConceptMapData;
  onNodeClick: (node: ConceptNode) => void;
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

// 添加基本样式
const sigmaStyles = {
  container: {
    height: '100%',
    width: '100%',
    position: 'relative' as 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // 半透明白色背景
    borderRadius: '0.75rem',
  },
  controls: {
    position: 'absolute' as 'absolute',
    bottom: '16px',
    right: '16px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '8px',
    zIndex: 2
  },
  controlButton: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(209, 213, 219, 0.6)',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
    color: '#4f46e5',
  },
  controlButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-1px)',
  },
  legendContainer: {
    position: 'absolute' as 'absolute',
    top: '16px',
    left: '16px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '8px',
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(209, 213, 219, 0.6)',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
  },
  legendTitle: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#4b5563',
    marginBottom: '6px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  legendCircle: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  }
};

// 初始化图形组件 - 用于首次加载图形
function LoadGraph({ data, onNodeClick }: SigmaGraphComponentProps) {
  const sigma = useSigma();
  
  // 将概念图数据转换为图形
  useEffect(() => {
    try {
      // 获取图
      const graph = sigma.getGraph();
      // 清除现有图形
      graph.clear();
  
      if (data && data.nodes.length > 0) {
        console.log("处理概念图数据:", data.nodes.length, "个节点", data.links.length, "个关系");
        
        // 初始化网格布局
        const nodeCount = data.nodes.length;
        const gridSize = Math.ceil(Math.sqrt(nodeCount));
        const spacing = 10;
        
        // 添加节点 - 使用网格初始布局
        data.nodes.forEach((node, index) => {
          try {
            // 计算网格位置
            const col = index % gridSize;
            const row = Math.floor(index / gridSize);
            
            // 设置颜色和大小
            let nodeColor;
            let nodeSize;
            let labelSize;
            
            if (node.type === 'big') {
              // 大概念用深浅不同的绿色
              nodeColor = '#10b981'; // 绿色
              nodeSize = 18;
              labelSize = 16;
            } else {
              // 小概念用深浅不同的蓝色
              nodeColor = '#3b82f6'; // 蓝色
              nodeSize = 12;
              labelSize = 14;
            }
            
            graph.addNode(node.id, {
              label: node.name,
              description: node.description,
              nodeCategory: node.type, // 保留类型信息但使用不同的属性名
              size: nodeSize,
              color: nodeColor,
              labelSize: labelSize,
              // 使用网格位置而不是随机位置
              x: col * spacing, 
              y: row * spacing,
              // 添加边框和阴影效果
              borderSize: 2,
              borderColor: node.type === 'big' ? '#059669' : '#2563eb', // 稍深一些的边框色
              hoverBorderSize: 4,
              hoverBorderColor: node.type === 'big' ? '#047857' : '#1d4ed8', // 深色悬停边框
              // 强调文本可读性
              labelColor: '#111827', // 深灰色标签
              labelWeight: 500,
            });
          } catch (e) {
            console.error(`添加节点失败: ${node.id}`, e);
          }
        });
        
        // 添加边
        data.links.forEach(link => {
          try {
            // 获取关系类型的颜色
            // 将关系类型映射到不同颜色
            const relationColorMap: Record<number, string> = {
              1: '#8b5cf6', // 包含关系 - 紫色
              2: '#8b5cf6', // 属于关系 - 紫色
              3: '#3b82f6', // 相关关系 - 蓝色
              4: '#ef4444', // 先决条件 - 红色
              5: '#f59e0b', // 应用关系 - 橙色
              6: '#10b981', // 衍生关系 - 绿色
              7: '#6366f1', // 对比关系 - 靛蓝色
              8: '#6366f1', // 类似关系 - 靛蓝色
              9: '#8b5cf6', // 定义关系 - 紫色
              10: '#f59e0b', // 实例关系 - 橙色
              11: '#3b82f6', // 解释关系 - 蓝色
              12: '#10b981', // 过程关系 - 绿色
            };
            
            // 获取关系颜色，如果没有特定颜色则使用默认颜色
            const edgeColor = relationColorMap[link.relationType] || '#9ca3af'; // 默认灰色
            
            // 直接尝试添加边，如果节点不存在会抛出错误，我们在catch中处理
            graph.addEdge(link.source, link.target, {
              id: link.id,
              relationType: link.relationType,
              label: relationTypeMap[link.relationType] || `关系${link.relationType}`,
              size: 1.5,
              color: edgeColor,
              type: 'arrow', // 箭头样式
              labelSize: 12,
              labelColor: '#4b5563', // 灰色标签
            });
          } catch (e) {
            console.error(`添加边失败: ${link.source} -> ${link.target}`, e);
          }
        });
        
        console.log("应用力导向布局...");
        // 应用力导向布局
        applyForceLayout(graph, 50);
        
        // 设置点击事件
        sigma.on('clickNode', (event: { node: string }) => {
          const nodeData = data.nodes.find(n => n.id === event.node);
          if (nodeData) {
            onNodeClick(nodeData);
          }
        });
        
        // 应用布局并刷新
        sigma.refresh();
        
        // 居中显示
        setTimeout(() => {
          try {
            // 通过设置zoom和x/y位置手动重置视图
            const camera = sigma.getCamera();
            // 使用任何格式的类型断言以避免TypeScript错误
            (camera as any).setSettings({
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            });
            sigma.refresh();
          } catch (e) {
            console.error("居中相机视图失败:", e);
          }
        }, 100);
      } else {
        console.warn("没有有效的概念图数据");
      }
    } catch (e) {
      console.error("概念图渲染失败:", e);
    }
    
    // 组件卸载时清理事件
    return () => {
      try {
        sigma.removeAllListeners();
      } catch (e) {
        console.error("清理事件失败:", e);
      }
    };
  }, [data, sigma, onNodeClick]);
  
  return null;
}

// 力导向布局
function applyForceLayout(graph: MultiDirectedGraph, iterations: number = 50) {
  try {
    console.log("开始力导向布局计算...");
    
    // 创建一个保存节点位置的Map
    const positions = new Map();
    
    // 力导向布局参数
    const repulsionStrength = 3;
    const attractionStrength = 0.8;
    const maxDisplacement = 5;
    const minDistance = 0.1;
    
    // 初始化位置
    graph.forEachNode((node: string) => {
      const x = graph.getNodeAttribute(node, 'x') || 0;
      const y = graph.getNodeAttribute(node, 'y') || 0;
      positions.set(node, { x, y });
    });
    
    console.log(`开始布局迭代，总计 ${iterations} 次...`);
    
    // 迭代应用力导向布局
    for (let i = 0; i < iterations; i++) {
      // 记录布局的总移动量
      let totalDisplacement = 0;
      
      graph.forEachNode((node: string) => {
        try {
          // 获取当前节点位置
          const pos = positions.get(node) || { x: 0, y: 0 };
          
          let dx = 0, dy = 0;
          
          // 计算节点间的斥力
          graph.forEachNode((other: string) => {
            if (other === node) return;
            
            try {
              // 获取其他节点位置
              const otherPos = positions.get(other) || { x: 0, y: 0 };
              
              // 计算距离
              const xDist = pos.x - otherPos.x;
              const yDist = pos.y - otherPos.y;
              const dist = Math.sqrt(xDist * xDist + yDist * yDist);
              
              // 避免距离过小导致的数值问题
              if (dist < minDistance) return;
              
              // 计算斥力
              const force = repulsionStrength / (dist * dist);
              dx += (xDist / dist) * force;
              dy += (yDist / dist) * force;
            } catch (e) {
              // 忽略可能的错误
            }
          });
          
          // 计算边的引力
          graph.forEachEdge([node, null], (edge: string, attrs: any, source: string, target: string) => {
            try {
              // 确保是从当前节点出发的边
              if (source !== node) return;
              
              // 获取目标节点位置
              const targetPos = positions.get(target) || { x: 0, y: 0 };
              
              // 计算距离
              const xDist = pos.x - targetPos.x;
              const yDist = pos.y - targetPos.y;
              const dist = Math.sqrt(xDist * xDist + yDist * yDist);
              
              // 避免距离过小导致的数值问题
              if (dist < minDistance) return;
              
              // 计算引力
              const force = attractionStrength * dist;
              dx -= (xDist / dist) * force;
              dy -= (yDist / dist) * force;
            } catch (e) {
              // 忽略可能的错误
            }
          });
          
          // 限制最大位移
          const displacement = Math.sqrt(dx * dx + dy * dy);
          if (displacement > maxDisplacement) {
            const scaleFactor = maxDisplacement / displacement;
            dx *= scaleFactor;
            dy *= scaleFactor;
          }
          
          // 更新位置
          const newPos = { x: pos.x + dx, y: pos.y + dy };
          positions.set(node, newPos);
          
          // 累计总位移
          totalDisplacement += Math.sqrt(dx * dx + dy * dy);
        } catch (e) {
          console.error(`节点 ${node} 力布局计算失败`, e);
        }
      });
      
      // 如果总位移足够小，提前结束迭代
      if (totalDisplacement / graph.order < 0.01) {
        console.log(`力布局在第 ${i + 1} 次迭代后提前收敛`);
        break;
      }
    }
    
    console.log("力布局计算完成，开始更新节点位置...");
    
    // 将计算得到的位置应用到图中
    positions.forEach((pos, node) => {
      try {
        graph.setNodeAttribute(node, 'x', pos.x);
        graph.setNodeAttribute(node, 'y', pos.y);
      } catch (e) {
        console.error(`更新节点 ${node} 位置失败`, e);
      }
    });
    
    console.log("力布局应用完成");
  } catch (e) {
    console.error("力导向布局计算失败", e);
  }
}

// Sigma图形控制组件
function SigmaControls() {
  const sigma = useSigma();
  
  const handleZoomIn = () => {
    const camera = sigma.getCamera();
    sigma.zoom(camera.getState().ratio / 1.2);
  };
  
  const handleZoomOut = () => {
    const camera = sigma.getCamera();
    sigma.zoom(camera.getState().ratio * 1.2);
  };
  
  const handleReset = () => {
    const camera = sigma.getCamera();
    (camera as any).setSettings({
      x: 0,
      y: 0,
      ratio: 1,
      angle: 0
    });
    sigma.refresh();
  };

  // 新增处理器函数：鼠标悬停样式
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    Object.entries(sigmaStyles.controlButtonHover).forEach(([key, value]) => {
      (target.style as any)[key] = value;
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    Object.entries(sigmaStyles.controlButtonHover).forEach(([key]) => {
      if (key === 'backgroundColor') {
        (target.style as any)[key] = sigmaStyles.controlButton.backgroundColor;
      } else if (key === 'boxShadow') {
        (target.style as any)[key] = sigmaStyles.controlButton.boxShadow;
      } else if (key === 'transform') {
        (target.style as any)[key] = 'none';
      }
    });
  };

  return (
    <div style={sigmaStyles.controls}>
      <div 
        style={sigmaStyles.controlButton} 
        onClick={handleZoomIn}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="放大"
        className="sigma-control"
      >
        <ZoomIn size={16} />
      </div>
      <div 
        style={sigmaStyles.controlButton} 
        onClick={handleZoomOut}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="缩小"
        className="sigma-control"
      >
        <ZoomOut size={16} />
      </div>
      <div 
        style={sigmaStyles.controlButton} 
        onClick={handleReset}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="重置视图"
        className="sigma-control"
      >
        <Move size={16} />
      </div>
    </div>
  );
}

// 图例组件
function LegendComponent() {
  return (
    <div style={sigmaStyles.legendContainer}>
      <div style={sigmaStyles.legendTitle}>图例</div>
      <div style={sigmaStyles.legendItem}>
        <div style={{...sigmaStyles.legendCircle, backgroundColor: '#10b981'}}></div>
        <span>大概念</span>
      </div>
      <div style={sigmaStyles.legendItem}>
        <div style={{...sigmaStyles.legendCircle, backgroundColor: '#3b82f6'}}></div>
        <span>小概念</span>
      </div>
    </div>
  );
}

// 暴露给外部使用的组件
export const SigmaGraphComponent = ({ data, onNodeClick }: SigmaGraphComponentProps) => {
  return (
    <>
      <style jsx global>{`
        .sigma-scene canvas {
          background-color: transparent !important;
        }
        .sigma-control {
          opacity: 0.8;
          transition: opacity 0.2s ease-in-out;
        }
        .sigma-control:hover {
          opacity: 1;
        }
      `}</style>
      <SigmaContainer style={sigmaStyles.container}>
        <LoadGraph data={data} onNodeClick={onNodeClick} />
        <SigmaControls />
        <LegendComponent />
      </SigmaContainer>
    </>
  );
}; 