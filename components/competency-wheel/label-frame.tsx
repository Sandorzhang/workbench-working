import React, { ReactNode } from 'react';

export interface LabelItem {
    x: number;
    y: number;
    label: ReactNode;
    content?: ReactNode;
    hidden?: boolean;
    isAdvanced?: boolean;
}

/**
 * 标签框架组件，用于显示环绕图表的标签
 */
interface LabelFrameProps {
    xAxis: number;
    labels: LabelItem[];
    highlightIndex?: number;
    handleLabelClick: (index: number) => void;
    onMouseEnter: (index: number) => void;
    onMouseLeave: () => void;
}

export function LabelFrame({
    xAxis,
    labels,
    highlightIndex,
    handleLabelClick,
    onMouseEnter,
    onMouseLeave
}: LabelFrameProps) {
    return (
        <>
            {labels.map((item, index) => {
                if (item.hidden) return null;
                
                const isHighlighted = highlightIndex === index;
                
                // 计算标签位置
                const isLeft = item.x < xAxis;
                const xPos = isLeft ? item.x - 5 : item.x + 5;
                const textAnchor = isLeft ? 'end' : 'start';
                
                return (
                    <g 
                        key={index}
                        className={`transition-opacity duration-200 ${isHighlighted ? 'opacity-100' : 'opacity-80'}`}
                        onClick={() => handleLabelClick(index)}
                        onMouseEnter={() => onMouseEnter(index)}
                        onMouseLeave={onMouseLeave}
                        style={{ cursor: 'pointer' }}
                    >
                        {/* 标签连接线 */}
                        <line
                            x1={xPos}
                            y1={item.y}
                            x2={item.x}
                            y2={item.y}
                            stroke="#ccc"
                            strokeWidth="1"
                        />
                        
                        {/* 标签文本 */}
                        <text
                            x={xPos}
                            y={item.y + 4} // 微调使文本垂直居中
                            textAnchor={textAnchor}
                            fontSize="12"
                            fill={isHighlighted ? '#333' : '#666'}
                            className={`transition-colors duration-200`}
                        >
                            {item.label}
                            {item.isAdvanced && <tspan fill="#ff6b6b">*</tspan>}
                        </text>
                    </g>
                );
            })}
        </>
    );
} 