import React, { useState, useEffect } from 'react';
import { WaveGraph } from './wave-graph';
import { WaveGraphSegment } from './types';
import { Skeleton } from '@/components/ui/skeleton';

// 状态对应的虚线样式
const STATUS_DASH_ARRAY = {
    'completed': [], // 实线表示完成
    'in-progress': [4, 2], // 虚线表示进行中
    'pending': [2, 4] // 较大间隔虚线表示未开始
};

interface CompetencyWheelProps {
    title?: string;
    description?: string;
    isLoading?: boolean;
    onDimensionClick?: (dimension: Record<string, unknown>) => void;
    competencies?: Record<string, unknown>[];
}

export function CompetencyWheel({
    isLoading = false,
    onDimensionClick,
    competencies: externalCompetencies
}: CompetencyWheelProps) {
    const [competencies, setCompetencies] = useState<Record<string, unknown>[]>([]);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    
    // 如果提供了外部数据，直接使用
    useEffect(() => {
        if (externalCompetencies) {
            setCompetencies(externalCompetencies);
            return;
        }
        
        // 否则从API获取数据
        const fetchCompetencies = async () => {
            try {
                const response = await fetch('/api/student/competencies');
                if (response.ok) {
                    const data = await response.json();
                    setCompetencies(data);
                }
            } catch (error) {
                console.error('Error fetching competencies:', error);
            }
        };
        
        fetchCompetencies();
    }, [externalCompetencies]);
    
    // 将原始能力数据转换为WaveGraph期望的格式
    const segments: WaveGraphSegment[] = competencies.map(comp => {
        // 计算每个一级维度下有多少二级维度
        const secondaryCount = (comp.children as Record<string, unknown>[])?.length || 0;
        
        // 获取二级维度对应的状态，用于设置虚线样式
        const dashStyles = (comp.children as Record<string, unknown>[])?.map((child: Record<string, unknown>) => 
            STATUS_DASH_ARRAY[(child.status as string) as keyof typeof STATUS_DASH_ARRAY] || []
        ) || [];
        
        // 每个一级维度的层数 = 二级维度数量（如果有的话）
        // 若没有二级维度，则只有一层
        const totalLayers = Math.max(1, secondaryCount);
        
        // 从内到外构建dash样式数组，每层一个样式
        // 如果没有二级维度，默认为实线(空数组)
        const finalDashStyles: number[][] = [];
        
        // 添加各二级维度的虚线样式 - 从内到外排列
        dashStyles.forEach((style: number[]) => finalDashStyles.push(style));
        
        // 如果没有二级维度，添加一个默认实线样式
        if (finalDashStyles.length === 0) {
            finalDashStyles.push([]);
        }
        
        // 创建段落
        return {
            id: comp.id as string,
            label: comp.name as string,
            color: comp.color as string,
            layers: totalLayers, // 设置正确的层数
            dash: finalDashStyles, // 从内到外的虚线样式数组
            content: `${comp.name as string} (${secondaryCount}个子维度)`,
            isAdvanced: comp.isAdvanced as boolean
        };
    });
    
    // 处理选择事件
    const handleSelect = (id?: string) => {
        setSelectedId(id);
        
        if (!id) {
            if (onDimensionClick) onDimensionClick(null as unknown as Record<string, unknown>);
            return;
        }
        
        // 查找选中的维度
        const dimension = competencies.find(comp => comp.id === id);
        if (dimension && onDimensionClick) {
            onDimensionClick(dimension);
        }
    };
    
    // 显示加载状态
    if (isLoading) {
        return (
            <div className="w-full flex justify-center items-center">
                <Skeleton className="h-[300px] w-[300px] rounded-full" />
            </div>
        );
    }
    
    // 如果没有数据
    if (competencies.length === 0) {
        return (
            <div className="w-full flex items-center justify-center h-[350px] text-gray-400">
                暂无素养数据
            </div>
        );
    }
    
    return (
        <div className="w-full flex justify-center">
            <WaveGraph
                height={400}
                segments={segments}
                selectedId={selectedId}
                onSelect={handleSelect}
                sectorSpacing={2}
                layerSpacing={20}
            />
        </div>
    );
} 