import { Skeleton } from "@/components/ui/skeleton";

export function ApplicationsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border border-gray-100/60 dark:border-gray-800/40 rounded-xl overflow-hidden h-full flex flex-col shadow-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm backdrop-filter hover:shadow-md transition-all duration-300">
          <div className="p-5 flex-grow">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-12 w-12 rounded-xl shadow-sm" />
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-5 w-14 rounded-full" />
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
  );
} 