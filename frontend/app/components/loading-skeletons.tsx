import React from "react"
import { Card, CardHeader } from "@/components/ui/card"

export const LoadingSkeleton: React.FC = () => (
  <div className="h-10 bg-gray-700 rounded animate-pulse w-full"></div>
)

export const LoadingPaginationSkeleton: React.FC = () => (
  <div className="mt-5 flex justify-center">
    <LoadingSkeleton />
  </div>
)

export const LoadingCardsSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <Card key={`skeleton-${index}`} className="dark:bg-[#09090B]">
        <CardHeader className="pb-4">
          <div className="h-5 bg-gray-700 rounded w-3/4 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse mb-2"></div>
          <div className="h-6 bg-gray-700 rounded w-full animate-pulse mb-2"></div>
          <div className="h-6 bg-gray-700 rounded w-full animate-pulse"></div>
        </CardHeader>
      </Card>
    ))}
  </>
)