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
        layerSpacing = 18
    } = props;

    // 使用响应式宽度
    const { width, containerRef } = useResize(props.width);
    
    // 获取高亮索引
    const { hoverIndex, highlightAt, cancelHighlight } = useHighlightIndex(segments, selectedId);
    
    // 计算最大层数
    const layerCount = useLayerValue(segments, layers);
    
    // SVG元素引用
    const svgRef = useRef<SVGSVGElement>(null);
    
    // 中心点和半径
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 40; // 增加边距，确保标签不会超出边界
    
    // 渲染扇区数据
    const { sectors, separateLines, rings } = useMemo(() => {
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
            labelPosOffset: 20
        });
    }, [cx, cy, segments.length, layerCount, layerSpacing, sectorSpacing, radius]);
    
    // 标签位置
    const labelPositions = useMemo(() => {
        // 提取每个段落的层数信息和对应的最外层半径
        const layerCounts = segments.map(segment => segment.layers || 1);
        
        // 计算每个段落的最外层弧线半径
        const outerRadii: number[] = [];
        
        // 添加调试日志，查看rings的结构
        console.log('环结构:', {
            环数量: rings.length,
            环半径: rings.map(ring => ring.radius)
        });
        
        if (rings.length > 0) {
            // 假设rings是按照从内到外排序的
            // 遍历每个段落
            for (let i = 0; i < segments.length; i++) {
                const segmentLayers = layerCounts[i];
                
                // 如果段落有多层，使用对应的最外层环半径
                // 注意：rings是从内到外排序的，0是最内层
                const outerRingIndex = Math.min(segmentLayers - 1, rings.length - 1);
                
                // 确保最小索引为0
                const safeRingIndex = Math.max(0, outerRingIndex);
                
                // 使用对应的环半径
                const outerRadius = rings[safeRingIndex].radius;
                
                // 为了防止遮挡，确保使用的是段落实际对应的外层环半径
                outerRadii.push(outerRadius);
                
                // 添加调试信息，查看每个段落的外层环计算
                console.log(`段落${i} (${segments[i].label})计算:`, {
                    层数: segmentLayers,
                    最外层环索引: safeRingIndex,
                    使用的半径: outerRadius
                });
            }
        } else {
            // 如果没有rings数据，则所有段落都使用基础半径
            outerRadii.fill(radius, 0, segments.length);
        }
        
        console.log('计算标签位置:', {
            段落数: segments.length,
            每个段落层数: layerCounts,
            每个段落最外层半径: outerRadii
        });
        
        // 增加偏移量，确保标签不会遮挡弧线
        // 使用6px偏移，而不是4px
        return getLabelPosList(cx, cy, segments.length, radius, 6, layerCounts, outerRadii);
    }, [cx, cy, segments.length, radius, segments, rings]);
    
    // 处理标签点击
    const handleLabelClick = (index: number) => {
        const segment = segments[index];
        if (segment && !segment.disabled && onSelect) {
            onSelect(segment.id === selectedId ? undefined : segment.id);
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
        const isSelected = selectedId === segment.id;
        const isHovered = hoverIndex === segmentIndex;
        const highlight = isSelected || isHovered;
        const pathOpacity = segment.disabled ? 0.5 : (highlight ? 1 : 0.85);
        const strokeWidth = highlight ? 3 : 2;
        
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
                className="transition-all duration-300 ease-in-out"
            />
        );
    };
    
    return (
        <SvgFrame
            width={width}
            height={height}
            title={title}
            ref={svgRef}
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
        >
            {/* 绘制背景环 */}
            <g stroke={grayColor} strokeWidth="1">
                {rings.map((ring, ringIdx) => (
                    <circle
                        key={`ring-${ringIdx}`}
                        cx={cx}
                        cy={cy}
                        r={ring.radius}
                        fill="none"
                        strokeOpacity={0.4}
                        strokeDasharray="3,3"
                    />
                ))}
            </g>
        
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
            {segments.map((segment, index) => (
                <foreignObject
                    key={`label-${index}`}
                    x={labelPositions[index].x - 50}
                    y={labelPositions[index].y - 14}
                    width={100}
                    height={28}
                    style={{ overflow: 'visible' }}
                >
                    <div 
                        style={{
                            position: 'absolute',
                            transform: 'translate(-50%, -50%)',
                            padding: '2px 6px',
                            fontSize: '11px',
                            fontWeight: selectedId === segment.id || hoverIndex === index ? 'bold' : 'normal',
                            background: selectedId === segment.id ? segment.color : 'rgba(255, 255, 255, 0.95)',
                            color: selectedId === segment.id ? '#fff' : segment.color,
                            borderRadius: '10px',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: `1px solid ${segment.color}`,
                            whiteSpace: 'nowrap',
                            zIndex: selectedId === segment.id ? 10 : 5
                        }}
                        onClick={() => handleLabelClick(index)}
                        onMouseEnter={() => highlightAt(index)}
                        onMouseLeave={cancelHighlight}
                    >
                        {segment.label}
                        {segment.isAdvanced && <span style={{ color: '#ff6b6b', marginLeft: '2px' }}>*</span>}
                    </div>
                </foreignObject>
            ))}
        </SvgFrame>
    );
} 