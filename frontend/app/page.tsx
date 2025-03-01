"use client"

import { Suspense } from 'react'
import Loading from './loading'
import { useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { PaginationControls } from "./components/pagination"
import { Sidebar } from "./components/sidebar"
import { ItemCard } from "./components/item-card"
import { DateRangeSelector } from "./components/date-range-selector"
import { LoadingSkeleton, LoadingCardsSkeleton, LoadingPaginationSkeleton } from "./components/loading-skeletons"
import { useUrlState } from "./hooks/use-url-state"
import { useFetchItems } from "./hooks/use-fetch-items"
import { useDebounce } from "./hooks/use-debounce"
import { FilterState } from "../lib/types"
import type { DateRange } from "react-day-picker"

// Main component that uses search params
function HomeContent() {
  // Handler functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleFilterChange = (
    types: string[],
    phases: string[],
    authors: string[],
    dateRange: DateRange | undefined
  ) => {
    setFilters({ types, phases, authors, dateRange })
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setFilters({
      types: [],
      phases: [],
      authors: [],
      dateRange: undefined
    })
    setCurrentPage(1)
    setSearchTerm("")
  }

  // Get initial state from URL parameters
  const urlState = useUrlState()
  const initialPage = urlState.getInitialPage()
  const initialSearch = urlState.getInitialSearch()
  const initialFilters = urlState.getInitialFilters()
  const router = useRouter()

  // State
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  
  // Apply debouncing to search to prevent excessive API calls
  const debouncedSearch = useDebounce(searchTerm, 300)
  
  // Fetch data
  const { 
    items, 
    isLoading, 
    error, 
    totalPages, 
    allTypes, 
    allPhases, 
    allAuthors, 
    isMetadataLoading 
  } = useFetchItems(currentPage, debouncedSearch, filters)
  
  // Memoize whether there are active items to improve performance
  const hasItems = useMemo(() => items.length > 0, [items])
  
  // Update URL when state changes
  useEffect(() => {
    if (!isFirstLoad) {
      urlState.updateUrl({
        page: currentPage,
        search: searchTerm,
        filters: filters
      })
    }
  }, [currentPage, searchTerm, filters, urlState, isFirstLoad])
  
  // Update isFirstLoad after initial render
  useEffect(() => {
    if (isFirstLoad && !isLoading) {
      setIsFirstLoad(false)
    }
  }, [isLoading, isFirstLoad])

  // Check for returnTo parameter (when returning from details page)
  useEffect(() => {
    const returnPath = urlState.getReturnPath()
    if (returnPath) {
      try {
        const returnUrl = new URL(window.location.origin + decodeURIComponent(returnPath))
        const returnParams = new URLSearchParams(returnUrl.search)
        
        // Restore previous state
        const page = parseInt(returnParams.get('page') || '1')
        setCurrentPage(page)
        
        // Clear returnTo from URL
        urlState.clearReturnTo()
      } catch (e) {
        console.error("Error parsing return URL:", e)
      }
    }
  }, [urlState])

  // Render main component
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex gap-4">
        {/* Sidebar for larger screens */}
        <div className="hidden md:block">
        <Sidebar
          isLoading={isMetadataLoading}
          allTypes={allTypes}
          selectedTypes={filters.types}
          onTypesChange={(types) => handleFilterChange(types, filters.phases, filters.authors, filters.dateRange)}
          allPhases={allPhases}
          selectedPhases={filters.phases}
          onPhasesChange={(phases) => handleFilterChange(filters.types, phases, filters.authors, filters.dateRange)}
          allAuthors={allAuthors} 
          selectedAuthors={filters.authors}
          onAuthorsChange={(authors) => handleFilterChange(filters.types, filters.phases, authors, filters.dateRange)}
          date={filters.dateRange}
          onDateChange={(dateRange) => handleFilterChange(filters.types, filters.phases, filters.authors, dateRange)}
          onClearDate={() => handleFilterChange(filters.types, filters.phases, filters.authors, undefined)}
          onClearAllFilters={clearAllFilters}
          isMobile={false} 
        />
      </div>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Search and filter controls */}
          <div className="flex gap-4 mb-6">
            {isMetadataLoading ? (
              <LoadingSkeleton />
            ) : (
              <Input
                type="search"
                placeholder="Pesquisar..."
                className="dark:bg-[#09090B] flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Pesquisar iniciativas legislativas"
              />
            )}

            {/* Mobile filter sheet */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" className="dark:bg-[#09090B]">
                  Filtro
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[340px] dark:bg-[#09090B]">
                <div className="py-4">
                  <Sidebar
                    isLoading={isMetadataLoading}
                    allTypes={allTypes}
                    selectedTypes={filters.types}
                    onTypesChange={(types) => handleFilterChange(types, filters.phases, filters.authors, filters.dateRange)}
                    allPhases={allPhases}
                    selectedPhases={filters.phases}
                    onPhasesChange={(phases) => handleFilterChange(filters.types, phases, filters.authors, filters.dateRange)}
                    allAuthors={allAuthors}
                    selectedAuthors={filters.authors}
                    onAuthorsChange={(authors) => handleFilterChange(filters.types, filters.phases, authors, filters.dateRange)}
                    date={filters.dateRange}
                    onDateChange={(dateRange) => handleFilterChange(filters.types, filters.phases, filters.authors, dateRange)}
                    onClearDate={() => handleFilterChange(filters.types, filters.phases, filters.authors, undefined)}
                    onClearAllFilters={clearAllFilters}
                    isMobile={true}
                  />
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Date range selector for desktop */}
            {isMetadataLoading ? (
              <LoadingSkeleton />
            ) : (
              <DateRangeSelector
                date={filters.dateRange}
                onDateChange={(dateRange) => handleFilterChange(filters.types, filters.phases, filters.authors, dateRange)}
              />
            )}
          </div>
          
          {/* Error message display */}
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {/* Items grid */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 w-full">
            {isLoading ? (
              <LoadingCardsSkeleton count={6} />
            ) : !hasItems ? (
              <Card className="flex justify-center col-span-full dark:bg-[#09090B] text-center">
                <CardContent className="py-8">
                  <h3 className="text-lg text-[#94A3B8]">Nada Encontrado</h3>
                  <p className="text-[#94A3B8] mt-2">Tente ajustar seus filtros ou termo de pesquisa</p>
                </CardContent>
              </Card>
            ) : (
              items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))
            )}
          </div>

          {/* Pagination */}
          {isLoading ? (
            <LoadingPaginationSkeleton />
          ) : hasItems ? (
            <div className="mt-8 flex justify-center">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

// Wrapper component with Suspense
export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  )
}