"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// 移除对HTMLAttributes的继承，改为明确指定需要的属性
interface PageContainerProps {
  /**
   * 页面标题
   */
  title?: React.ReactNode;
  /**
   * 页面子标题或描述
   */
  description?: React.ReactNode;
  /**
   * 标题栏右侧的操作区域
   */
  actions?: React.ReactNode;
  /**
   * 页面内容
   */
  children: React.ReactNode;
  /**
   * 是否处于加载状态
   */
  loading?: boolean;
  /**
   * 加载状态下的元素，如果未提供则使用默认骨架屏
   */
  loadingComponent?: React.ReactNode;
  /**
   * 容器的外边距，默认为standard
   */
  spacing?: "none" | "compact" | "standard" | "relaxed";
  /**
   * 页面背景类名
   */
  backgroundClassName?: string;
  /**
   * 布局类型：grid使用网格布局
   */
  layout?: "stack" | "grid" | "split";
  /**
   * 内容列数（仅用于grid布局）
   */
  columns?: 1 | 2 | 3 | 4;
  /**
   * 网格间距（仅用于grid布局）
   */
  gridGap?: "sm" | "md" | "lg";
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
  /**
   * ID属性
   */
  id?: string;
  /**
   * 其他HTML div元素的属性
   */
  [key: string]: any;
}

/**
 * 页面容器组件 - 提供一致的页面布局和组织结构
 */
export function PageContainer({
  title,
  description,
  actions,
  children,
  loading = false,
  loadingComponent,
  spacing = "standard",
  className,
  backgroundClassName,
  layout = "stack",
  columns = 3,
  gridGap = "md",
  ...props
}: PageContainerProps) {
  // 页面容器间距映射
  const spacingMap = {
    none: "p-0",
    compact: "p-5",
    standard: "p-6 lg:p-8",
    relaxed: "p-8 lg:p-12",
  };

  // 网格间距映射
  const gridGapMap = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  // 网格列数映射
  const gridColumnsMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  // 布局类名
  const layoutClassName = {
    stack: "flex flex-col space-y-8",
    grid: cn("grid", gridColumnsMap[columns], gridGapMap[gridGap]),
    split: "flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0",
  };

  // 渲染加载状态
  if (loading) {
    return loadingComponent || (
      <div className={cn("animate-pulse", spacingMap[spacing], className)} {...props}>
        {/* 标题区域骨架屏 */}
        {(title || description) && (
          <div className="mb-8 flex flex-col space-y-3">
            {title && <Skeleton className="h-9 w-1/3" />}
            {description && <Skeleton className="h-5 w-2/3" />}
          </div>
        )}
        
        {/* 内容区域骨架屏 */}
        <div className={layoutClassName[layout]}>
          {layout === "grid" && (
            <>
              {Array.from({ length: Math.min(columns, 4) }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ))}
            </>
          )}
          
          {layout === "stack" && (
            <>
              <Skeleton className="h-56 w-full rounded-xl" />
              <div className="space-y-5">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </>
          )}
          
          {layout === "split" && (
            <>
              <Skeleton className="h-72 w-full md:w-1/3 rounded-xl" />
              <div className="space-y-5 flex-1">
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "rounded-2xl border border-gray-100/60 dark:border-gray-800/40",
        "bg-gradient-to-b from-white/80 to-white dark:from-gray-900/80 dark:to-gray-900",
        "backdrop-blur-sm backdrop-filter",
        "shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
        "dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]",
        spacingMap[spacing],
        "transition-all duration-300 ease-in-out",
        backgroundClassName,
        className
      )}
      {...props}
    >
      {/* 页面标题区域 */}
      {(title || description || actions) && (
        <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            {title && (
              <h1 className="text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400 max-w-3xl">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-4 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* 页面内容区域 */}
      <div className={cn(layoutClassName[layout])}>
        {children}
      </div>
    </div>
  );
} 