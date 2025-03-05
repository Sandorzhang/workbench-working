import { Params, Point, Ring, Sector } from './types';

// 渲染扇区
export function renderSectors(params: Params) {
    const { cx, cy, segmentCount, layerCount, layerSpacing, sectorSpacing, radius } = params;
    
    // 计算环
    const rings = renderRings(params);
    
    // 变换环为扇区
    const sectors = transformRingsToSectors(rings);
    
    // 计算扇区之间的分隔线
    const separateLines: Array<[Point, Point]> = [];
    for (let i = 0; i < segmentCount; i++) {
        const angle = (360 / segmentCount) * i + sectorSpacing / 2;
        separateLines.push(getSeparateLines(cx, cy, angle, radius));
    }
    
    return { sectors, separateLines, rings };
}

// 获取标签位置列表
export function getLabelPosList(cx: number, cy: number, segmentCount: number, radius: number, offset: number = 20) {
    const positions: Point[] = [];
    for (let i = 0; i < segmentCount; i++) {
        const angle = (360 / segmentCount) * i + (360 / segmentCount) / 2;
        const radians = angle * (Math.PI / 180);
        positions.push({
            x: cx + (radius + offset) * Math.cos(radians),
            y: cy + (radius + offset) * Math.sin(radians)
        });
    }
    return positions;
}

// 渲染环
export function renderRings(params: Params): Ring[] {
    const { cx, cy, segmentCount, layerCount, layerSpacing, sectorSpacing, radius } = params;
    
    const rings: Ring[] = [];
    const anglePerSegment = 360 / segmentCount;
    
    console.log('renderRings:', { layerCount, segmentCount, layerSpacing, radius });
    
    // 计算内环半径 - 以总半径的30%作为内环基础，更贴近圆心
    const innerRadius = radius * 0.3;
    
    // 生成每个层级的环，从内向外扩展
    for (let layerIndex = 0; layerCount > 0 && layerIndex < layerCount; layerIndex++) {
        // 修改计算方式，使环从内向外扩展
        // 从innerRadius开始，向外扩展layerSpacing
        const layerRadius = innerRadius + layerIndex * layerSpacing;
        const paths: [Point, Point][] = [];
        
        // 每个扇区都有一个环上的路径
        for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
            const startAngle = anglePerSegment * segmentIndex + sectorSpacing / 2;
            const endAngle = anglePerSegment * (segmentIndex + 1) - sectorSpacing / 2;
            
            const startRadians = startAngle * (Math.PI / 180);
            const endRadians = endAngle * (Math.PI / 180);
            
            const start: Point = {
                x: cx + layerRadius * Math.cos(startRadians),
                y: cy + layerRadius * Math.sin(startRadians)
            };
            
            const end: Point = {
                x: cx + layerRadius * Math.cos(endRadians),
                y: cy + layerRadius * Math.sin(endRadians)
            };
            
            paths.push([start, end]);
        }
        
        rings.push({ radius: layerRadius, paths });
    }
    
    return rings;
}

// 将环转换为扇区，每个扇区有多个环
export function transformRingsToSectors(rings: Ring[]): Sector[] {
    if (rings.length === 0 || rings[0].paths.length === 0) {
        return [];
    }
    
    const segmentCount = rings[0].paths.length;
    
    // 为每个扇区创建一个空数组
    const sectors: Sector[] = Array(segmentCount).fill(0).map(() => []);
    
    // 遍历所有环，将弧段添加到对应的扇区中
    rings.forEach((ring, ringIndex) => {
        ring.paths.forEach((path, pathIndex) => {
            // 添加弧段到对应扇区
            sectors[pathIndex].push({
                start: path[0],
                end: path[1],
                radius: ring.radius
            });
        });
    });
    
    console.log('环转换为扇区:', {
        ringCount: rings.length,
        segmentCount: segmentCount,
        sectorLengths: sectors.map(s => s.length)
    });
    
    return sectors;
}

// 获取扇区分隔线
export function getSeparateLines(cx: number, cy: number, angle: number, length: number): [Point, Point] {
    const radians = angle * (Math.PI / 180);
    
    // 计算起点和终点，距离圆心 spacing 距离
    const start: Point = {
        x: cx,
        y: cy
    };
    
    const end: Point = {
        x: cx + length * Math.cos(radians),
        y: cy + length * Math.sin(radians)
    };
    
    return [start, end];
}

// 获取扇区分隔点
export function getSeparatePoints(cx: number, cy: number, angle: number, length: number, spacing: number): Point[] {
    const radians = angle * (Math.PI / 180);
    
    // 计算起点和终点，距离圆心 spacing 距离
    const points: Point[] = [];
    
    for (let i = 1; i <= length; i += spacing) {
        points.push({
            x: cx + i * Math.cos(radians),
            y: cy + i * Math.sin(radians)
        });
    }
    
    return points;
}

// 创建扇形路径
export function createArcPath(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
}

// 极坐标转换为笛卡尔坐标
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): Point {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
} 