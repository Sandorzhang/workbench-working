"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CardContainerProps {
  /**
   * 卡片标题
   */
  title?: React.ReactNode;
  /**
   * 卡片子标题或描述
   */
  description?: React.ReactNode;
  /**
   * 标题栏右侧的操作区域
   */
  actions?: React.ReactNode;
  /**
   * 卡片内容
   */
  children: React.ReactNode;
  /**
   * 卡片底部内容
   */
  footer?: React.ReactNode;
  /**
   * 是否处于加载状态
   */
  loading?: boolean;
  /**
   * 卡片的内边距，默认为standard
   */
  padding?: "none" | "compact" | "standard" | "relaxed";
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 背景颜色类名
   */
  backgroundClassName?: string;
  /**
   * 是否突出显示（增加阴影效果）
   */
  elevated?: boolean;
  /**
   * 是否可点击（添加悬停效果）
   */
  clickable?: boolean;
  /**
   * 点击事件处理函数
   */
  onClick?: () => void;
  /**
   * 卡片id
   */
  id?: string;
  /**
   * 其他属性
   */
  [key: string]: unknown;
}

/**
 * 卡片容器组件 - 作为页面区块内的基本展示单元
 */
export function CardContainer({
  title,
  description,
  actions,
  children,
  footer,
  loading = false,
  padding = "standard",
  className,
  backgroundClassName,
  elevated = false,
  clickable = false,
  onClick,
  id,
  ...props
}: CardContainerProps) {
  // 内边距映射
  const paddingMap = {
    none: "p-0",
    compact: "p-3.5",
    standard: "p-5",
    relaxed: "p-6",
  };

  // 加载状态
  if (loading) {
    return (
      <div 
        className={cn(
          "rounded-xl border border-gray-100/60 dark:border-gray-800/60",
          elevated && "shadow-md backdrop-blur-sm backdrop-filter",
          backgroundClassName || "bg-white/90 dark:bg-gray-900/90",
          paddingMap[padding],
          "animate-pulse",
          className
        )}
        id={id}
        {...props}
      >
        {/* 标题区域骨架屏 */}
        {(title || description) && (
          <div className="mb-4">
            {title && <Skeleton className="h-6 w-1/3 mb-2" />}
            {description && <Skeleton className="h-4 w-2/3" />}
          </div>
        )}
        
        {/* 内容区域骨架屏 */}
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        
        {/* 底部区域骨架屏 */}
        {footer && (
          <div className="mt-4 pt-4 border-t border-gray-100/60 dark:border-gray-800/60">
            <Skeleton className="h-5 w-1/4" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "rounded-xl border border-gray-100/60 dark:border-gray-800/60",
        "bg-gradient-to-b from-white/40 to-white/95 dark:from-gray-900/40 dark:to-gray-900/95",
        "backdrop-blur-sm backdrop-filter",
        elevated && "shadow-md",
        clickable && 
          "cursor-pointer hover:border-gray-200/80 dark:hover:border-gray-700/80 hover:shadow-lg transform transition-all duration-300 ease-out hover:-translate-y-0.5",
        backgroundClassName,
        className
      )}
      id={id}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {/* 卡片头部 */}
      {(title || description || actions) && (
        <div className={cn(
          "flex flex-col space-y-1.5",
          children && paddingMap[padding],
          children && "pb-3"
        )}>
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h3 className="text-base font-medium tracking-tight text-gray-900 dark:text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2.5 shrink-0 ml-4">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 卡片内容 */}
      {children && (
        <div 
          className={cn(
            (!title && !description && !actions) ? paddingMap[padding] : "px-5"
          )}
        >
          {children}
        </div>
      )}
      
      {/* 卡片底部 */}
      {footer && (
        <div className={cn(
          "mt-4 pt-4 border-t border-gray-100/60 dark:border-gray-800/60",
          paddingMap[padding],
          "bg-gray-50/50 dark:bg-gray-800/30 rounded-b-xl"
        )}>
          {footer}
        </div>
      )}
    </div>
  );
} 