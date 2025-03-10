"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SectionContainerProps {
  /**
   * 区块标题
   */
  title?: React.ReactNode;
  /**
   * 区块子标题或描述
   */
  description?: React.ReactNode;
  /**
   * 标题栏右侧的操作区域
   */
  actions?: React.ReactNode;
  /**
   * 区块内容
   */
  children: React.ReactNode;
  /**
   * 是否处于加载状态
   */
  loading?: boolean;
  /**
   * 容器的内边距，默认为standard
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
   * 是否分隔标题区域和内容区域
   */
  divider?: boolean;
  /**
   * 是否可折叠
   */
  collapsible?: boolean;
  /**
   * 默认是否展开（仅在collapsible为true时有效）
   */
  defaultOpen?: boolean;
  /**
   * 区块id
   */
  id?: string;
  /**
   * 其他属性
   */
  [key: string]: any;
}

/**
 * 区块容器组件 - 用于在页面中划分不同的内容区域
 */
export function SectionContainer({
  title,
  description,
  actions,
  children,
  loading = false,
  padding = "standard",
  className,
  backgroundClassName,
  divider = false,
  collapsible = false,
  defaultOpen = true,
  id,
  ...props
}: SectionContainerProps) {
  // 为支持折叠功能添加状态
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  // 内边距映射
  const paddingMap = {
    none: "p-0",
    compact: "p-5",
    standard: "p-6 lg:p-7",
    relaxed: "p-7 lg:p-8",
  };

  // 加载状态
  if (loading) {
    return (
      <div 
        className={cn(
          "rounded-xl border border-gray-100/60 dark:border-gray-800/40",
          "backdrop-blur-sm backdrop-filter",
          backgroundClassName || "bg-white/90 dark:bg-gray-900/90",
          paddingMap[padding],
          "animate-pulse",
          "shadow-sm",
          className
        )}
        id={id}
        {...props}
      >
        {/* 标题区域骨架屏 */}
        {(title || description) && (
          <div className="mb-5">
            {title && <Skeleton className="h-7 w-1/4 mb-3" />}
            {description && <Skeleton className="h-5 w-1/2" />}
          </div>
        )}
        
        {/* 分隔线骨架屏 */}
        {divider && <Skeleton className="h-px w-full my-5 bg-gray-100/80 dark:bg-gray-800/60" />}
        
        {/* 内容区域骨架屏 */}
        <div className="space-y-5">
          <Skeleton className="h-32 w-full rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "rounded-xl border border-gray-100/60 dark:border-gray-800/40",
        "bg-gradient-to-b from-white/60 to-white/95 dark:from-gray-900/60 dark:to-gray-900/95",
        "backdrop-blur-sm backdrop-filter",
        "shadow-sm hover:shadow-md transition-all duration-300 ease-in-out",
        backgroundClassName,
        className
      )}
      id={id}
      {...props}
    >
      {/* 区块标题区域 */}
      {(title || description || actions) && (
        <div className={cn(
          "flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0",
          paddingMap[padding],
          divider && "border-b border-gray-100/80 dark:border-gray-800/60 pb-5"
        )}>
          <div className="space-y-1.5">
            {title && (
              <h2 
                className={cn(
                  "text-lg font-medium tracking-tight text-gray-900 dark:text-gray-100",
                  "bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700",
                  "dark:from-gray-100 dark:via-gray-200 dark:to-gray-300",
                  collapsible && "flex items-center cursor-pointer select-none"
                )}
                onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
              >
                {collapsible && (
                  <svg
                    className={cn(
                      "mr-2 h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200", 
                      isOpen ? "transform rotate-0" : "transform rotate-180"
                    )}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                  </svg>
                )}
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-3 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* 区块内容区域 */}
      {(!collapsible || isOpen) && (
        <div 
          className={cn(
            (!title && !description && !actions) || !divider ? paddingMap[padding] : cn("px-6 lg:px-7 pb-6 lg:pb-7", divider && "pt-5")
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
} 