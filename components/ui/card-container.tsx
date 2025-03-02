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
  [key: string]: any;
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
    compact: "p-3",
    standard: "p-4",
    relaxed: "p-5",
  };

  // 加载状态
  if (loading) {
    return (
      <div 
        className={cn(
          "rounded-lg border border-gray-100/80",
          elevated && "shadow-sm",
          backgroundClassName || "bg-white",
          paddingMap[padding],
          "animate-pulse",
          className
        )}
        id={id}
        {...props}
      >
        {/* 标题区域骨架屏 */}
        {(title || description) && (
          <div className="mb-3">
            {title && <Skeleton className="h-5 w-1/3 mb-1.5" />}
            {description && <Skeleton className="h-3.5 w-2/3" />}
          </div>
        )}
        
        {/* 内容区域骨架屏 */}
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </div>
        
        {/* 底部区域骨架屏 */}
        {footer && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Skeleton className="h-4 w-1/4" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "rounded-lg border border-gray-100/80",
        elevated && "shadow-sm",
        clickable && 
          "cursor-pointer hover:border-gray-200 hover:shadow-md transition-all duration-200",
        backgroundClassName || "bg-white",
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
          children && "pb-2"
        )}>
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h3 className="text-base font-medium text-gray-900">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2 shrink-0 ml-4">
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
            (!title && !description && !actions) ? paddingMap[padding] : "px-4"
          )}
        >
          {children}
        </div>
      )}
      
      {/* 卡片底部 */}
      {footer && (
        <div className={cn(
          "mt-3 pt-3 border-t border-gray-100",
          paddingMap[padding],
          "pt-3"
        )}>
          {footer}
        </div>
      )}
    </div>
  );
} 