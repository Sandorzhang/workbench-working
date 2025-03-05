import React, { useState, useEffect } from 'react';
import { WaveGraph } from './wave-graph';
import { WaveGraphSegment, CompetencySegment } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    onDimensionClick?: (dimension: any) => void;
    competencies?: any[];
}

export function CompetencyWheel({
    title = '素养能力轮',
    description = '展示学生各维度素养发展情况',
    isLoading = false,
    onDimensionClick,
    competencies: externalCompetencies
}: CompetencyWheelProps) {
    const [competencies, setCompetencies] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [selectedDimension, setSelectedDimension] = useState<any>(null);
    
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
        const secondaryCount = comp.children.length;
        
        // 获取二级维度对应的状态，用于设置虚线样式
        const dashStyles = comp.children.map((child: any) => 
            STATUS_DASH_ARRAY[child.status as keyof typeof STATUS_DASH_ARRAY] || []
        );
        
        // 移除默认的二级维度那一层，只保留一级维度和已有的二级维度
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
        
        console.log(`维度 ${comp.name}:`, {
            层数: totalLayers,
            dash样式: finalDashStyles
        });
        
        // 创建段落
        return {
            id: comp.id,
            label: comp.name,
            color: comp.color,
            layers: totalLayers, // 设置正确的层数
            dash: finalDashStyles, // 从内到外的虚线样式数组
            content: `${comp.name} (${secondaryCount}个子维度)`,
            isAdvanced: comp.isAdvanced
        };
    });
    
    // 处理选择事件
    const handleSelect = (id?: string) => {
        setSelectedId(id);
        
        if (!id) {
            setSelectedDimension(null);
            if (onDimensionClick) onDimensionClick(null);
            return;
        }
        
        // 查找选中的维度
        const dimension = competencies.find(comp => comp.id === id);
        if (dimension) {
            setSelectedDimension(dimension);
            if (onDimensionClick) onDimensionClick(dimension);
        }
    };
    
    // 显示加载状态
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle><Skeleton className="h-8 w-2/3" /></CardTitle>
                    <CardDescription><Skeleton className="h-4 w-4/5" /></CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[400px]">
                        <Skeleton className="h-[300px] w-[300px] rounded-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    // 如果没有数据
    if (competencies.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[400px] text-gray-400">
                        暂无素养数据
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center py-8 px-4 relative">
                <div className="w-full flex justify-center">
                    <WaveGraph
                        height={600}
                        segments={segments}
                        selectedId={selectedId}
                        onSelect={handleSelect}
                        sectorSpacing={4}
                        layerSpacing={20}
                    />
                </div>

                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1">
                            <span className="inline-block w-8 h-[2px] bg-gray-500"></span>
                            <span>已完成</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="inline-block w-8 h-[2px] bg-gray-500" style={{ strokeDasharray: '4,2' }}></span>
                            <span>进行中</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="inline-block w-8 h-[2px] bg-gray-500" style={{ strokeDasharray: '2,4' }}></span>
                            <span>未开始</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            <span>高级项目</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 