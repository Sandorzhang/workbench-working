import { Skeleton } from "@/components/ui/skeleton";

export function ApplicationsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border border-gray-200/70 rounded-xl overflow-hidden h-full flex flex-col shadow-sm">
          <div className="p-5 flex-grow">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-14" />
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>
          <div className="bg-gray-50/80 px-5 py-3 border-t border-gray-100">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
} 