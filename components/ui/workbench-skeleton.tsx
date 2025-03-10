import { Skeleton } from "@/components/ui/skeleton";

export function WorkbenchSkeleton() {
  return (
    <div className="container mx-auto p-6 lg:p-8 animate-pulse">
      {/* 欢迎区域骨架屏 */}
      <div className="mb-8 backdrop-blur-sm backdrop-filter bg-white/80 dark:bg-gray-900/80 border border-gray-100/60 dark:border-gray-800/40 rounded-xl p-6 lg:p-8 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-6">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64 mb-1" />
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-14 w-14 rounded-full" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 shadow-sm border border-gray-100/60 dark:border-gray-800/40">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 应用列表区域骨架屏 */}
      <div className="mb-8 backdrop-blur-sm backdrop-filter bg-white/80 dark:bg-gray-900/80 border border-gray-100/60 dark:border-gray-800/40 rounded-xl p-6 lg:p-8 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-5 w-60" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border border-gray-100/60 dark:border-gray-800/40 rounded-xl overflow-hidden shadow-sm bg-white/90 dark:bg-gray-800/90 h-full flex flex-col">
              <div className="p-5 flex-grow">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-5 w-14" />
                    </div>
                    <Skeleton className="h-4 w-full mb-1.5" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50/80 dark:bg-gray-900/40 px-5 py-3.5 border-t border-gray-100/60 dark:border-gray-800/40">
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 