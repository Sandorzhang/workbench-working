"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  /**
   * 网格内容
   */
  children: React.ReactNode;
  /**
   * XS断点下的列数 (<640px)
   */
  xs?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * SM断点下的列数 (≥640px)
   */
  sm?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * MD断点下的列数 (≥768px)
   */
  md?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * LG断点下的列数 (≥1024px)
   */
  lg?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * XL断点下的列数 (≥1280px)
   */
  xl?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * 2XL断点下的列数 (≥1536px)
   */
  xl2?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * 网格间距尺寸
   */
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * 是否平均分配每列的宽度
   */
  equalWidth?: boolean;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 其他属性
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * 响应式网格组件 - 用于灵活布局，支持不同断点下的列数设置
 */
export function ResponsiveGrid({
  children,
  xs = 1,
  sm,
  md,
  lg,
  xl,
  xl2,
  gap = "md",
  equalWidth = true,
  className,
  ...props
}: ResponsiveGridProps) {
  // 列数映射到对应的Tailwind类名
  const getColsClassName = (
    cols: number | undefined,
    breakpoint: string = ""
  ) => {
    if (cols === undefined) return "";

    const prefix = breakpoint ? `${breakpoint}:` : "";

    // 如果需要平均分配宽度
    if (equalWidth) {
      return `${prefix}grid-cols-${cols}`;
    }

    // 否则使用自动填充
    switch (cols) {
      case 1:
        return `${prefix}grid-cols-1`;
      case 2:
        return `${prefix}grid-cols-2`;
      case 3:
        return `${prefix}grid-cols-3`;
      case 4:
        return `${prefix}grid-cols-4`;
      case 5:
        return `${prefix}grid-cols-5`;
      case 6:
        return `${prefix}grid-cols-6`;
      default:
        return `${prefix}grid-cols-1`;
    }
  };

  // 间距映射
  const gapMap = {
    none: "gap-0",
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  return (
    <div
      className={cn(
        "grid w-full",
        getColsClassName(xs),
        getColsClassName(sm, "sm"),
        getColsClassName(md, "md"),
        getColsClassName(lg, "lg"),
        getColsClassName(xl, "xl"),
        getColsClassName(xl2, "2xl"),
        gapMap[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
