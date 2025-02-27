import React from "react";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

// 通用标题和内容骨架
export function TitleSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-4 w-[350px]" />
    </div>
  );
}

// 卡片骨架
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border bg-white shadow-sm p-6", className)}>
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <div className="pt-2 space-y-2">
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
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
export function TableSkeleton({ className, rowCount = 5, columnCount = 4 }: SkeletonProps & { rowCount?: number; columnCount?: number }) {
  return (
    <div className={cn("w-full overflow-hidden border rounded-md", className)}>
      <div className="bg-gray-50 p-4">
        <Skeleton className="h-6 w-1/4" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="border rounded-md overflow-hidden">
          <div className="grid grid-cols-[repeat(var(--column-count),1fr)] border-b bg-gray-50">
            {Array(columnCount)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="p-3">
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
          </div>
          {Array(rowCount)
            .fill(null)
            .map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[repeat(var(--column-count),1fr)] border-b last:border-0"
                style={{ "--column-count": columnCount } as React.CSSProperties}
              >
                {Array(columnCount)
                  .fill(null)
                  .map((_, colIndex) => (
                    <div key={colIndex} className="p-3">
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
              </div>
            ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
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
export function ListSkeleton({ className, count = 5 }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array(count)
        .fill(null)
        .map((_, i) => (
          <ListItemSkeleton key={i} />
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

// 帖子/文章骨架
export function ContentSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <TitleSkeleton />
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
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