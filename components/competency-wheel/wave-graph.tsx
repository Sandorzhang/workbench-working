import React, { useState, useRef, useMemo } from 'react';
import { WaveGraphProps, Point } from './types';
import { SvgFrame } from './svg-frame';
import { useHighlightIndex, useLayerValue, useResize } from './hooks';
import { renderSectors, getLabelPosList } from './formula';
import { LabelFrame, LabelItem } from './label-frame';

export function WaveGraph(props: WaveGraphProps) {
    const {
        height = 400,
        grayColor = '#f0f0f0',
        shortestRadius = 100,
        segments = [],
        selectedId,
        onSelect,
        title,
        layers = 3,
        sectorSpacing = 2,
        layerSpacing = 25
    } = props;

    // 使用响应式宽度
    const width = useResize(props.width);
    
    // 获取高亮索引
    const { hoverIndex, highlightAt, cancelHighlight } = useHighlightIndex(segments, selectedId);
    
    // 计算最大层数
    const layerCount = useLayerValue(segments, layers);
    
    // SVG元素引用
    const svgRef = useRef<SVGSVGElement>(null);
    
    // 中心点和半径
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 20; // 留出边距
    
    // 渲染扇区数据
    const { sectors, separateLines } = useMemo(() => {
        console.log('渲染扇区:', {
            segmentCount: segments.length,
            segmentLayers: segments.map(s => s.layers),
            layerCount: layerCount 
        });
        
        return renderSectors({
            cx,
            cy,
            segmentCount: segments.length,
            layerCount,
            layerSpacing,
            sectorSpacing,
            radius,
            labelPosOffset: 30
        });
    }, [cx, cy, segments.length, layerCount, layerSpacing, sectorSpacing, radius]);
    
    // 计算标签位置
    const labelPositions = useMemo(() => {
        return getLabelPosList(cx, cy, segments.length, radius, 30);
    }, [cx, cy, segments.length, radius]);
    
    // 构建标签数据
    const labels: LabelItem[] = useMemo(() => {
        return segments.map((segment, i) => ({
            x: labelPositions[i].x,
            y: labelPositions[i].y,
            label: segment.label,
            content: segment.content,
            isAdvanced: segment.isAdvanced
        }));
    }, [segments, labelPositions]);
    
    // 处理标签点击
    const handleLabelClick = (index: number) => {
        const id = segments[index]?.id;
        if (id && onSelect) {
            onSelect(selectedId === id ? undefined : id);
        }
    };
    
    // 处理环路径
    const renderArcPath = (start: Point, end: Point, r: number, index: number, segmentIndex: number) => {
        // 计算弧形路径
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 如果距离太小，不绘制弧线
        if (distance < 1) return null;
        
        const segment = segments[segmentIndex];
        
        // 检查当前层是否应该为此段落显示
        // 如果index大于或等于此段落的layers值，不显示这一层
        if (segment.layers !== undefined && index >= segment.layers) {
            return null;
        }
        
        // 获取虚线设置
        const dashArray = segment.dash || [];
        const visible = segment.visible || [];
        const isVisible = visible.length === 0 || visible.includes(index);
        
        // 如果不可见，不绘制
        if (!isVisible) return null;
        
        // 判断是否是灰色区域
        const grayAreas = segment.gray || [];
        const isGray = grayAreas.includes(index);
        
        // 颜色设置
        const color = isGray ? grayColor : segment.color;
        const pathOpacity = segment.disabled ? 0.5 : 0.85;
        const isHighlighted = hoverIndex === segmentIndex;
        const strokeWidth = isHighlighted ? 3 : 2;
        
        // 获取当前层的dash样式
        // 支持新的二维dash数组格式
        let dashStyle = '';
        if (Array.isArray(dashArray[0])) {
            // 处理二维数组情况 - 每层有独立的dash样式
            const currentLayerDash = index < (dashArray as number[][]).length 
                ? (dashArray as number[][])[index] 
                : [];
            dashStyle = currentLayerDash.join(' ');
            
            // 调试日志
            if (segmentIndex === 0 && (index === 0 || index === dashArray.length - 1)) {
                console.log(`段落${segmentIndex} 层级${index} dash样式:`, {
                    dashStyle,
                    原始: currentLayerDash,
                    总层数: dashArray.length
                });
            }
        } else {
            // 向后兼容处理一维数组情况 - 所有层使用相同dash样式
            dashStyle = (dashArray as number[]).join(' ');
        }
        
        return (
            <path
                key={`arc-${segmentIndex}-${index}`}
                d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={dashStyle}
                fill="none"
                opacity={pathOpacity}
                className="transition-all duration-200"
            />
        );
    };
    
    return (
        <SvgFrame
            ref={svgRef}
            width={width}
            height={height}
            title={title}
        >
            {/* 不再渲染灰色分隔线 */}
            
            {/* 扇区环弧 */}
            {sectors.map((sector, segmentIndex) => (
                <g
                    key={`sector-${segmentIndex}`}
                    onMouseEnter={() => highlightAt(segmentIndex)}
                    onMouseLeave={cancelHighlight}
                    onClick={() => handleLabelClick(segmentIndex)}
                    style={{ cursor: 'pointer' }}
                >
                    {sector.map((arc, arcIndex) => 
                        renderArcPath(arc.start, arc.end, arc.radius, arcIndex, segmentIndex)
                    )}
                </g>
            ))}
            
            {/* 标签 */}
            <LabelFrame
                xAxis={cx}
                labels={labels}
                highlightIndex={hoverIndex}
                handleLabelClick={handleLabelClick}
                onMouseEnter={highlightAt}
                onMouseLeave={cancelHighlight}
            />
        </SvgFrame>
    );
} 