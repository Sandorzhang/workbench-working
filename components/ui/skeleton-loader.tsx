import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

// 通用加载样式
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// 标题骨架
export function TitleSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("h-8 w-[250px] rounded-md bg-muted animate-pulse", className)}
      {...props}
    />
  );
}

// 卡片骨架
export function CardSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("rounded-lg border bg-card shadow-sm animate-pulse", className)}
      {...props}
    />
  );
}

// 多卡片网格骨架
export function CardGridSkeleton({ className, count = 6 }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn("grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array(count)
        .fill(null)
        .map((_, i) => (
          <CardSkeleton key={i} />
        ))}
    </div>
  );
}

// 表格骨架
export function TableSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("space-y-3", className)}
      {...props}
    >
      <div className="flex space-x-4 overflow-hidden">
        <div className="h-8 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-8 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-8 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-8 w-full rounded-md bg-muted animate-pulse" />
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex space-x-4 overflow-hidden">
          <div className="h-6 w-full rounded-sm bg-muted/70 animate-pulse" />
          <div className="h-6 w-full rounded-sm bg-muted/70 animate-pulse" />
          <div className="h-6 w-full rounded-sm bg-muted/70 animate-pulse" />
          <div className="h-6 w-full rounded-sm bg-muted/70 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// 详情页骨架
export function DetailSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex justify-between items-start">
        <TitleSkeleton />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <CardSkeleton className="h-64" />
    </div>
  );
}

// 表单骨架
export function FormSkeleton({ className, fields = 6 }: SkeletonProps & { fields?: number }) {
  return (
    <div className={cn("space-y-4 rounded-xl border p-6 bg-white shadow-sm", className)}>
      <Skeleton className="h-7 w-1/3 mb-6" />
      {Array(fields)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      <div className="pt-4 flex justify-end space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// 统计卡片骨架
export function StatCardsSkeleton({ className, count = 4 }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn("grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4", className)}>
      {Array(count)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="rounded-xl border bg-white shadow-sm p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        ))}
    </div>
  );
}

// 列表项骨架
export function ListItemSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center space-x-4 rounded-md border p-4", className)}>
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
  );
}

// 列表骨架
export function ListSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("space-y-3", className)}
      {...props}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 rounded-md bg-muted animate-pulse w-[60%]" />
            <div className="h-3 rounded-md bg-muted animate-pulse w-[80%]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 带Tabs的面板骨架
export function TabsSkeleton({ className, tabCount = 3 }: SkeletonProps & { tabCount?: number }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex space-x-2 border-b">
        {Array(tabCount)
          .fill(null)
          .map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
      </div>
      <CardSkeleton className="h-[300px]" />
    </div>
  );
}

// 内容区骨架
export function ContentSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("space-y-2", className)}
      {...props}
    >
      <div className="h-4 rounded-md bg-muted animate-pulse" />
      <div className="h-4 rounded-md bg-muted animate-pulse w-[90%]" />
      <div className="h-4 rounded-md bg-muted animate-pulse w-[85%]" />
      <div className="h-4 rounded-md bg-muted animate-pulse w-[80%]" />
    </div>
  );
}

// 个人资料骨架
export function ProfileSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

// 导航栏骨架
export function NavSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center justify-between p-4 border-b", className)}>
      <Skeleton className="h-8 w-32" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
} 