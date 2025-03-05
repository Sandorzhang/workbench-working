import { ReactNode } from 'react';
import { ComponentType } from 'react';

export interface WaveGraphSegment {
    id: string;
    color: string;
    layers?: number;
    dash?: number[][] | number[];
    gray?: number[];
    visible?: number[];
    disabled?: boolean;
    label: ReactNode;
    content?: string;
    isAdvanced?: boolean;
}

export interface WaveGraphProps {
    width?: number;
    height: number;
    grayColor?: string;
    shortestRadius?: number;
    segments: WaveGraphSegment[];
    selectedId?: string;
    onSelect?: (id?: string) => void;
    title?: string;
    layers?: number;
    sectorSpacing?: number;
    layerSpacing?: number;
    labelRenderer?: ComponentType<WaveGraphSegment>;
}

export interface Point {
    x: number;
    y: number;
}

export interface Arc {
    start: Point;
    end: Point;
    radius: number;
}

export type Sector = Arc[];

export interface Ring {
    radius: number;
    paths: [Point, Point][];
}

export interface Params {
    cx: number;
    cy: number;
    segmentCount: number;
    layerCount: number;
    layerSpacing: number;
    sectorSpacing: number;
    radius: number;
    labelPosOffset: number;
}

// 扩展现有类型，添加支持CompetencyWheel所需的属性
export interface CompetencySegment extends WaveGraphSegment {
    // 添加素养维度特有属性
    progress?: number;
    status?: 'completed' | 'in-progress' | 'pending';
    parentId?: string;
    children?: CompetencySegment[];
    level?: number;
} 