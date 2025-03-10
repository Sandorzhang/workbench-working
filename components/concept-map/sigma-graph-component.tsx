"use client";

import React, { useRef, useEffect } from "react";
import { MultiDirectedGraph } from "graphology";
import { SigmaContainer, useSigma } from "@react-sigma/core";
import { Maximize2 } from "lucide-react";

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

// 添加基本样式
const sigmaStyles = {
  container: {
    height: "100%",
    width: "100%",
    position: "relative" as const,
    overflow: "hidden",
    backgroundColor: "white",
  },
  controls: {
    position: "absolute" as const,
    bottom: "10px",
    right: "10px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "5px",
    zIndex: 1,
  },
  controlButton: {
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
  },
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
        // console.log("处理概念图数据:", data.nodes.length, "个节点", data.links.length, "个关系");

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

            graph.addNode(node.id, {
              label: node.name,
              description: node.description,
              nodeCategory: node.type, // 保留类型信息但使用不同的属性名
              size: node.type === "big" ? 15 : 10,
              color: node.type === "big" ? "#34a853" : "#4285f4",
              // 使用网格位置而不是随机位置
              x: col * spacing,
              y: row * spacing,
            });
          } catch (e) {
            // console.error(`添加节点失败: ${node.id}`, e);
          }
        });

        // 添加边
        data.links.forEach((link) => {
          try {
            // 直接尝试添加边，如果节点不存在会抛出错误，我们在catch中处理
            graph.addEdge(link.source, link.target, {
              id: link.id,
              relationType: link.relationType,
              label:
                relationTypeMap[link.relationType] ||
                `关系${link.relationType}`,
              size: 2,
              color: "#999",
            });
          } catch (e) {
            // console.error(`添加边失败: ${link.source} -> ${link.target}`, e);
          }
        });

        // console.log("应用力导向布局...");
        // 应用力导向布局
        applyForceLayout(graph, 50);

        // 设置点击事件
        sigma.on("clickNode", (event: { node: string }) => {
          const nodeData = data.nodes.find((n) => n.id === event.node);
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
              angle: 0,
            });
            sigma.refresh();
          } catch (e) {
            // console.error("居中相机视图失败:", e);
          }
        }, 100);
      } else {
        // console.warn("没有有效的概念图数据");
      }
    } catch (e) {
      // console.error("概念图渲染失败:", e);
    }

    // 组件卸载时清理事件
    return () => {
      try {
        sigma.removeAllListeners();
      } catch (e) {
        // console.error("清理事件失败:", e);
      }
    };
  }, [data, sigma, onNodeClick]);

  return null;
}

// 力导向布局
function applyForceLayout(graph: MultiDirectedGraph, iterations: number = 50) {
  try {
    // console.log("开始力导向布局计算...");

    // 创建一个保存节点位置的Map
    const positions = new Map();

    // 力导向布局参数
    const repulsionStrength = 3;
    const attractionStrength = 0.8;
    const maxDisplacement = 5;
    const minDistance = 0.1;

    // 初始化位置
    graph.forEachNode((node: string) => {
      const x = graph.getNodeAttribute(node, "x") || 0;
      const y = graph.getNodeAttribute(node, "y") || 0;
      positions.set(node, { x, y });
    });

    // console.log(`开始布局迭代，总计 ${iterations} 次...`);

    // 迭代应用力导向布局
    for (let i = 0; i < iterations; i++) {
      // 记录布局的总移动量
      let totalDisplacement = 0;

      graph.forEachNode((node: string) => {
        try {
          // 获取当前节点位置
          const pos = positions.get(node) || { x: 0, y: 0 };

          let dx = 0,
            dy = 0;

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

              // 累加力的分量
              dx += (xDist / dist) * force;
              dy += (yDist / dist) * force;
            } catch (e) {
              // 忽略单个节点计算错误
            }
          });

          // 计算连接节点之间的引力
          graph.forEachNeighbor(node, (neighbor: string) => {
            try {
              // 获取邻居节点位置
              const neighborPos = positions.get(neighbor) || { x: 0, y: 0 };

              // 计算距离
              const xDist = pos.x - neighborPos.x;
              const yDist = pos.y - neighborPos.y;
              const dist = Math.sqrt(xDist * xDist + yDist * yDist);

              // 避免距离过小导致的数值问题
              if (dist < minDistance) return;

              // 计算引力
              const force = attractionStrength * Math.log(dist);

              // 累加力的分量
              dx -= (xDist / dist) * force;
              dy -= (yDist / dist) * force;
            } catch (e) {
              // 忽略单个节点计算错误
            }
          });

          // 限制移动距离
          const displacement = Math.sqrt(dx * dx + dy * dy);
          if (displacement > 0) {
            const factor =
              Math.min(displacement, maxDisplacement) / displacement;
            dx *= factor;
            dy *= factor;
          }

          // 更新位置
          const newPos = { x: pos.x + dx, y: pos.y + dy };
          positions.set(node, newPos);

          // 记录总移动量
          totalDisplacement += displacement;
        } catch (e) {
          // 忽略单个节点计算错误
        }
      });

      // 应用新位置
      positions.forEach((pos, node) => {
        try {
          graph.setNodeAttribute(node, "x", pos.x);
          graph.setNodeAttribute(node, "y", pos.y);
        } catch (e) {
          // 忽略单个节点更新错误
        }
      });

      // 如果总移动量很小，提前退出迭代
      // 获取节点数量
      let nodeCount = 0;
      graph.forEachNode(() => nodeCount++);

      if (totalDisplacement < 0.1 * nodeCount) {
        // console.log(`力导向布局在第 ${i+1}/${iterations} 次迭代后收敛`);
        break;
      }
    }

    // console.log("力导向布局计算完成");
  } catch (e) {
    // console.error("力导向布局计算失败:", e);
  }
}

// 自定义控制组件
function SigmaControls() {
  const sigma = useSigma();

  const handleZoomIn = () => {
    const camera = sigma.getCamera();
    camera.animatedZoom({ duration: 300 });
  };

  const handleZoomOut = () => {
    const camera = sigma.getCamera();
    camera.animatedUnzoom({ duration: 300 });
  };

  return (
    <div style={sigmaStyles.controls}>
      <button
        style={sigmaStyles.controlButton}
        onClick={handleZoomIn}
        title="放大"
      >
        <Maximize2 size={16} />
      </button>
      <button
        style={sigmaStyles.controlButton}
        onClick={handleZoomOut}
        title="缩小"
      >
        <Maximize2 size={16} style={{ transform: "rotate(180deg)" }} />
      </button>
    </div>
  );
}

// 导出的图形组件
export const SigmaGraphComponent = ({
  data,
  onNodeClick,
}: SigmaGraphComponentProps) => {
  // 确保仅在客户端渲染
  if (typeof window === "undefined") {
    return null;
  }

  return (
    <SigmaContainer
      style={sigmaStyles.container}
      settings={{
        renderLabels: true,
        defaultNodeColor: "#999",
        defaultEdgeColor: "#ddd",
        labelDensity: 0.07,
        labelGridCellSize: 60,
        labelRenderedSizeThreshold: 6,
        labelFont: "Inter, sans-serif",
        zIndex: true,
      }}
    >
      <LoadGraph data={data} onNodeClick={onNodeClick} />
      <SigmaControls />
    </SigmaContainer>
  );
};
