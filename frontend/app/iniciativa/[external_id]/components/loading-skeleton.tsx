// components/loading-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
      
      {/* Page title and metadata skeletons */}
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>
      
      {/* Main card skeleton */}
      <div className="mb-8 border-t-4 border-t-blue-300 bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="w-full md:w-3/4">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </div>
          <div className="mt-4 md:mt-0">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
      
      {/* Grid layout skeletons */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Authors panel skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Timeline panel skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-6 relative pl-8">
            <div className="absolute left-3 top-0 bottom-0 w-0.5">
              <Skeleton className="h-full w-full" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start">
                <Skeleton className="absolute left-0 h-7 w-7 rounded-full" />
                <div className="w-full">
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Votes panel skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <Skeleton className="h-6 w-44 mb-4" />
          <Skeleton className="h-4 w-64 mb-6" />
          
          <div className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 dark:bg-gray-900">
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="p-4">
                <Skeleton className="h-5 w-full mb-4" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Attachments panel skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <Skeleton className="h-6 w-44 mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}