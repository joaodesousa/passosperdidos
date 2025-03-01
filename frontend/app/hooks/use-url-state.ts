"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { DateRange } from "react-day-picker"
import { FilterState } from "@/lib/types"

export function useUrlState() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get initial values from URL
  const getInitialPage = useCallback((): number => {
    return parseInt(searchParams.get('page') || '1')
  }, [searchParams])
  
  const getInitialSearch = useCallback((): string => {
    return searchParams.get('search') || ""
  }, [searchParams])
  
  const getInitialFilters = useCallback((): FilterState => {
    const initialTypes = searchParams.get('types')?.split(',') || []
    const initialPhases = searchParams.get('phases')?.split(',') || []
    const initialAuthors = searchParams.get('authors')?.split(',') || []
    
    // Parse date range if present
    let initialDateRange: DateRange | undefined = undefined
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    if (startDate) {
      initialDateRange = {
        from: new Date(startDate),
        to: endDate ? new Date(endDate) : undefined
      }
    }
    
    return {
      types: initialTypes,
      phases: initialPhases,
      authors: initialAuthors,
      dateRange: initialDateRange,
    }
  }, [searchParams])
  
  // Check if we're returning from details page
  const getReturnPath = useCallback((): string | null => {
    return searchParams.get('returnTo')
  }, [searchParams])
  
  // Update URL based on current state
  const updateUrl = useCallback((params: {
    page: number,
    search: string,
    filters: FilterState
  }) => {
    const urlParams = new URLSearchParams()
    
    // Only add parameters that have values
    if (params.page > 1) urlParams.set('page', params.page.toString())
    if (params.search) urlParams.set('search', params.search)
    if (params.filters.types.length > 0) urlParams.set('types', params.filters.types.join(','))
    if (params.filters.phases.length > 0) urlParams.set('phases', params.filters.phases.join(','))
    if (params.filters.authors.length > 0) urlParams.set('authors', params.filters.authors.join(','))
    
    if (params.filters.dateRange?.from) {
      urlParams.set('startDate', params.filters.dateRange.from.toISOString().split('T')[0])
      if (params.filters.dateRange.to) {
        urlParams.set('endDate', params.filters.dateRange.to.toISOString().split('T')[0])
      }
    }
    
    // Update URL without refreshing the page
    const url = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '')
    router.push(url, { scroll: false })
  }, [router])
  
  // Remove returnTo parameter
  const clearReturnTo = useCallback(() => {
    const currentParams = new URLSearchParams(searchParams.toString())
    currentParams.delete('returnTo')
    router.replace(
      window.location.pathname + (currentParams.toString() ? `?${currentParams.toString()}` : ''), 
      { scroll: false }
    )
  }, [router, searchParams])
  
  return {
    getInitialPage,
    getInitialSearch,
    getInitialFilters,
    getReturnPath,
    updateUrl,
    clearReturnTo
  }
}