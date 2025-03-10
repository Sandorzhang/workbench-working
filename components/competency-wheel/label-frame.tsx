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
                            stroke={isHighlighted ? "#999" : "#ccc"}
                            strokeWidth={isHighlighted ? "1.5" : "1"}
                            strokeDasharray={isHighlighted ? "" : "3,2"}
                        />
                        
                        {/* 标签文本 */}
                        <text
                            x={xPos}
                            y={item.y + 4} // 微调使文本垂直居中
                            textAnchor={textAnchor}
                            fontSize="13"
                            fontWeight={isHighlighted ? "600" : "normal"}
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

interface LabelItemProps {
    text: ReactNode;
    x: number;
    y: number;
    labelRotation: number;
    labelStyle?: React.CSSProperties;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: () => void;
    isSelected?: boolean;
    color?: string;
}

const LabelItem = ({ 
    text, 
    x, 
    y, 
    labelRotation, 
    labelStyle,
    onMouseEnter,
    onMouseLeave,
    onClick,
    isSelected,
    color
}: LabelItemProps) => {
    // 计算标签样式
    const finalStyle: React.CSSProperties = {
        position: 'absolute',
        transform: `translate(-50%, -50%) rotate(${labelRotation}deg)`,
        left: x,
        top: y,
        padding: '4px 8px',
        fontSize: '12px',
        fontWeight: isSelected ? 'bold' : 'normal',
        background: isSelected ? color || '#fff' : 'rgba(255, 255, 255, 0.9)',
        color: isSelected ? '#fff' : (color || '#333'),
        borderRadius: '12px',
        boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: isSelected ? 'none' : `1px solid ${color || '#e0e0e0'}`,
        whiteSpace: 'nowrap',
        zIndex: isSelected ? 10 : 5,
        ...labelStyle
    };

    return (
        <div style={finalStyle} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {text}
        </div>
    );
}; 