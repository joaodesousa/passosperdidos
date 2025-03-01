// Updated useFetchItems.ts hook

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Item, Author } from "@/lib/types"
import { fetchItems, fetchTypes, fetchPhases, fetchAuthors } from "@/lib/api"
import type { DateRange } from "react-day-picker"

// Define the filter structure here to match what's used in the app
type FiltersType = {
  types: string[];
  phases: string[];
  authors: string[];
  dateRange: DateRange | undefined;
}

export function useFetchItems(page: number, searchTerm: string, filters: FiltersType) {
  const [items, setItems] = useState<Item[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allTypes, setAllTypes] = useState<string[]>([])
  const [allPhases, setAllPhases] = useState<string[]>(["Todas"])
  const [allAuthors, setAllAuthors] = useState<Author[]>([])
  const [isMetadataLoading, setIsMetadataLoading] = useState(true)
  
  // Keep track of previous search term to detect changes
  const prevSearchTermRef = useRef(searchTerm)
  // Store safe page number that gets reset when search changes
  const [safePage, setSafePage] = useState(page)

  // Update safe page when search term changes
  useEffect(() => {
    if (prevSearchTermRef.current !== searchTerm) {
      // Search term has changed, reset to page 1
      setSafePage(1)
      prevSearchTermRef.current = searchTerm
    } else {
      // No search term change, use the provided page
      setSafePage(page)
    }
  }, [page, searchTerm])

  // Extract unique author names for the filter UI
  const authorNames = useMemo(() => {
    const names = allAuthors.map(author => author.name);
    // Remove duplicates
    return [...new Set(names)];
  }, [allAuthors]);

  // Fetch metadata (types, phases, authors)
  const fetchMetadata = useCallback(async () => {
    setIsMetadataLoading(true)
    try {
      const [typesData, phasesData, authorsData] = await Promise.all([
        fetchTypes(),
        fetchPhases(),
        fetchAuthors(),
      ])
      
      setAllTypes(typesData.filter((type: string) => type !== "Todos"))
      setAllPhases(phasesData)
      setAllAuthors(authorsData)
    } catch (err) {
      setError("Failed to load filter options")
      console.error("Error fetching metadata:", err)
    } finally {
      setIsMetadataLoading(false)
    }
  }, [])

  // Fetch items based on safePage (not direct page), search and filters
  const fetchItemsData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await fetchItems({
        page: safePage, // Use the safe page number here
        search: searchTerm,
        types: filters.types,
        phases: filters.phases,
        dateRange: filters.dateRange,
        authors: filters.authors
      })
      
      setItems(data.results)
      setTotalPages(Math.ceil(data.count / 10))
    } catch (err) {
      setError("Failed to load items")
      console.error("Error fetching items:", err)
    } finally {
      setIsLoading(false)
    }
  }, [safePage, searchTerm, filters]) // Use safePage in the dependency array

  // Load metadata on initial render
  useEffect(() => {
    fetchMetadata()
  }, [fetchMetadata])

  // Load items when dependencies change
  useEffect(() => {
    fetchItemsData()
  }, [fetchItemsData])

  return {
    items,
    isLoading,
    error,
    totalPages,
    allTypes,
    allPhases,
    authorNames, 
    allAuthors, 
    isMetadataLoading,
    refetch: fetchItemsData,
    currentPage: safePage // Return the safePage rather than the original page
  }
}