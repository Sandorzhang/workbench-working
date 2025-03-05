import { useState, useCallback, useEffect, useRef } from 'react';

// 高亮索引钩子，用于处理鼠标悬停和选择效果
export function useHighlightIndex(items: { id: string }[], selectedId?: string) {
    // 悬停索引
    const [hoverIndex, setHoverIndex] = useState<number | undefined>(undefined);
    
    // 当selectedId改变时，更新索引
    useEffect(() => {
        if (selectedId) {
            const index = items.findIndex(item => item.id === selectedId);
            if (index !== -1) {
                setHoverIndex(index);
            }
        }
    }, [items, selectedId]);
    
    // 高亮指定索引的项目
    const highlightAt = useCallback((index: number) => setHoverIndex(index), []);
    
    // 取消高亮
    const cancelHighlight = useCallback(() => setHoverIndex(undefined), []);
    
    return { hoverIndex, highlightAt, cancelHighlight };
}

// 计算层级值钩子
export function useLayerValue(items: { layers?: number }[], defaultLayers: number) {
    // 计算每个项目的最大层级数
    const getMaxLayers = useCallback(() => {
        // 如果没有项目，使用默认值
        if (!items || items.length === 0) {
            console.log('无项目，使用默认层级:', defaultLayers);
            return defaultLayers;
        }
        
        // 找出所有项目中最大的layers值
        let max = defaultLayers;
        items.forEach(item => {
            if (item.layers && item.layers > max) {
                max = item.layers;
            }
        });
        
        console.log('计算最大层数:', {
            项目数量: items.length,
            默认层级: defaultLayers,
            计算结果: max,
            各项目层级: items.map(item => item.layers || defaultLayers)
        });
        
        // 确保至少有一层
        return Math.max(1, max);
    }, [items, defaultLayers]);
    
    // 初始化状态
    const [layerCount, setLayerCount] = useState(() => getMaxLayers());
    
    // 当项目或默认层级变化时重新计算
    useEffect(() => {
        setLayerCount(getMaxLayers());
    }, [getMaxLayers, items, defaultLayers]);
    
    return layerCount;
}

// 响应式尺寸钩子
export function useResize(definedWidth = 0) {
    const [width, setWidth] = useState(definedWidth);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // 初始化宽度
    useEffect(() => {
        const initializeChart = () => {
            if (definedWidth) {
                setWidth(definedWidth);
            } else {
                // 计算容器宽度或使用默认值
                const containerWidth = containerRef.current ? 
                    containerRef.current.clientWidth : 
                    Math.min(window.innerWidth - 40, 600);
                
                setWidth(containerWidth);
            }
        };
        
        initializeChart();
        
        // 监听窗口大小变化
        window.addEventListener('resize', initializeChart);
        return () => window.removeEventListener('resize', initializeChart);
    }, [definedWidth]);
    
    return { width, containerRef };
} 