"use client"

import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex gap-4">
        {/* Sidebar skeleton */}
        <div className="hidden md:block w-64">
          <div className="w-full dark:bg-[#09090B] md:dark:border md:dark:border-blue md:dark:border-opacity-20 p-4 rounded-lg shadow">
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-10 bg-gray-700 rounded mb-4"></div>
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-10 bg-gray-700 rounded mb-4"></div>
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-10 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Search and filters skeleton */}
          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-gray-700 rounded animate-pulse w-full"></div>
            <div className="h-10 bg-gray-700 rounded animate-pulse w-24"></div>
          </div>
          
          {/* Grid skeleton */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 w-full">
            {Array.from({ length: 6 }, (_, index) => (
              <Card key={`skeleton-${index}`} className="dark:bg-[#09090B]">
                <div className="p-6">
                  <div className="h-5 bg-gray-700 rounded w-3/4 animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded w-full animate-pulse mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded w-full animate-pulse"></div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="mt-8 flex justify-center">
            <div className="h-10 bg-gray-700 rounded animate-pulse w-64"></div>
          </div>
        </div>
      </div>
    </main>
  )
}