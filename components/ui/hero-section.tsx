import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  /**
   * 标题
   */
  title: string;
  /**
   * 描述文字
   */
  description: string;
  /**
   * 图标组件
   */
  icon: LucideIcon;
  /**
   * 渐变背景色
   */
  gradient?: string;
  /**
   * 图标颜色
   */
  iconColor?: string;
  /**
   * 图标背景色
   */
  iconBgColor?: string;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 按钮或操作区域
   */
  actions?: ReactNode;
  /**
   * 尺寸
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * 装饰性背景元素
   */
  decorative?: boolean;
  /**
   * 卡片阴影程度
   */
  shadow?: 'sm' | 'md' | 'lg';
  /**
   * 紧凑模式
   */
  compact?: boolean;
}

export function HeroSection({
  title,
  description,
  icon: Icon,
  gradient = "from-primary/5 via-primary/3 to-blue-50/30",
  iconColor = "text-primary",
  iconBgColor = "bg-white/80 dark:bg-gray-800/80",
  className = "",
  actions,
  size = 'sm',
  decorative = true,
  shadow = 'sm',
  compact = false,
}: HeroSectionProps) {
  // 尺寸映射
  const sizeMap = {
    xs: 'p-3 lg:p-4',
    sm: 'p-4 lg:p-5',
    md: 'p-5 lg:p-6',
    lg: 'p-6 lg:p-8',
  };

  // 阴影映射
  const shadowMap = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  // 图标尺寸映射
  const iconSizeMap = {
    xs: 'h-5 w-5',
    sm: 'h-6 w-6',
    md: 'h-7 w-7',
    lg: 'h-8 w-8',
  };

  // 图标容器尺寸映射
  const iconContainerSizeMap = {
    xs: 'p-2.5',
    sm: 'p-3',
    md: 'p-3.5',
    lg: 'p-4',
  };

  // 标题尺寸映射
  const titleSizeMap = {
    xs: 'text-lg',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  // 装饰性元素尺寸映射
  const decorativeSizeMap = {
    xs: 'w-48 h-48 -mr-16 -mt-16 -ml-16 -mb-16',
    sm: 'w-56 h-56 -mr-20 -mt-20 -ml-20 -mb-20',
    md: 'w-64 h-64 -mr-24 -mt-24 -ml-24 -mb-24',
    lg: 'w-72 h-72 -mr-28 -mt-28 -ml-28 -mb-28',
  };

  return (
    <div 
      className={cn(
        `relative overflow-hidden rounded-xl border border-gray-100/60 dark:border-gray-800/40`,
        `bg-gradient-to-r ${gradient}`,
        `backdrop-blur-sm backdrop-filter`,
        shadowMap[shadow],
        sizeMap[size],
        `mb-5 transition-all duration-300 ease-in-out`,
        className
      )}
    >
      {/* 装饰性背景元素 */}
      {decorative && (
        <>
          <div className={cn(
            "absolute top-0 right-0 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl opacity-60 dark:opacity-40",
            decorativeSizeMap[size]
          )}></div>
          <div className={cn(
            "absolute bottom-0 left-0 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl opacity-60 dark:opacity-40",
            decorativeSizeMap[size]
          )}></div>
          <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-[1px] backdrop-filter z-0"></div>
        </>
      )}

      <div className={cn(
        "flex relative z-10",
        compact ? "flex-row items-center" : "flex-col md:flex-row md:items-center",
        "justify-between",
        compact ? "gap-3" : "gap-4 md:gap-5"
      )}>
        <div className={cn(
          compact ? "flex items-center" : "flex flex-col md:flex-row md:items-center",
          compact ? "gap-3" : "gap-4 md:gap-5"
        )}>
          <div className={cn(
            `${iconBgColor} ${iconContainerSizeMap[size]} rounded-lg border border-gray-100/80 dark:border-gray-700/30`,
            compact ? "shadow" : "shadow-md",
            "transform transition-transform duration-300 hover:scale-105"
          )}>
            <Icon className={`${iconSizeMap[size]} ${iconColor}`} />
          </div>
          <div>
            <h1 className={cn(
              `${titleSizeMap[size]} font-bold tracking-tight text-gray-900 dark:text-gray-100`,
              compact ? "mb-0.5" : "mb-1.5 md:mb-1",
              "bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300"
            )}>
              {title}
            </h1>
            <p className={cn(
              "text-gray-600 dark:text-gray-300 leading-relaxed",
              compact ? "text-sm max-w-xl" : "max-w-3xl",
              size === 'xs' && "text-sm"
            )}>
              {description}
            </p>
          </div>
        </div>
        
        {actions && (
          <div className={cn(
            "flex items-center shrink-0",
            compact ? "gap-2 ml-2" : "gap-3 mt-2 md:mt-0"
          )}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
} 