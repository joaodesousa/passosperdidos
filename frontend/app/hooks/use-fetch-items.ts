import { useState, useEffect, useCallback } from "react"
import { FilterState, Item } from "@/lib/types"
import { fetchItems, fetchTypes, fetchPhases, fetchAuthors } from "@/lib/api"

export function useFetchItems(page: number, searchTerm: string, filters: FilterState) {
  const [items, setItems] = useState<Item[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allTypes, setAllTypes] = useState<string[]>([])
  const [allPhases, setAllPhases] = useState<string[]>(["Todas"])
  const [allAuthors, setAllAuthors] = useState<string[]>([])
  const [isMetadataLoading, setIsMetadataLoading] = useState(true)

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

  // Fetch items based on page, search and filters
  const fetchItemsData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await fetchItems({
        page,
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
  }, [page, searchTerm, filters])

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
    allAuthors,
    isMetadataLoading,
    refetch: fetchItemsData
  }
}