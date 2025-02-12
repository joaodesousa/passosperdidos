"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { BookType, CalendarIcon, File, LetterText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { PaginationControls } from "./components/pagination"
import { Sidebar } from "./components/sidebar"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { DateRange } from "react-day-picker"

// Types
interface Phase {
  name: string
  date: string
}

interface Item {
  id: number
  type: string
  title: string
  description: string
  link: string
  phases: Phase[]
  date: number
  authors: { author_type: string; name: string }[]
}

interface FilterState {
  types: string[]
  phases: string[]
  authors: string[]
  dateRange: DateRange | undefined
}

// API functions
async function getAuthToken() {
  const response = await fetch('/api/token', { method: 'POST' });
  const data = await response.json();
  return data.access;
}

async function fetchItems(params: {
  page: number
  search: string
  types: string[]
  phases: string[]
  authors: string[]
  dateRange: DateRange | undefined
}) {
  const token = await getAuthToken()
  
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    search: params.search,
  })

  if (params.types.length > 0) {
    queryParams.append('type', params.types.join(','))
  }

  const filteredPhases = params.phases.filter(phase => phase !== "Todas")
  if (filteredPhases.length > 0) {
    queryParams.append('phase', filteredPhases.join(','))
  }

  if (params.authors.length > 0) {
    queryParams.append('authors', params.authors.join(','))
  }

  if (params.dateRange?.from) {
    queryParams.append('start_date', format(params.dateRange.from, "yyyy-MM-dd"))
  }
  if (params.dateRange?.to) {
    queryParams.append('end_date', format(params.dateRange.to, "yyyy-MM-dd"))
  }

  const response = await fetch(`http://localhost:8000/projetoslei/?${queryParams}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  return response.json()
}

// Components
const ItemCard = ({ item }: { item: Item }) => {
  const mostRecentPhase = item.phases.length > 0
    ? item.phases.reduce((prev, current) => 
        new Date(prev.date) > new Date(current.date) ? prev : current
      )
    : null

    const FilterSection = ({
  title,
  options,
  selected,
  onChange,
  showClear = false,
  onClear,
}: {
  title: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  showClear?: boolean
  onClear?: () => void
}) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {title}
      </h3>
      {showClear && selected.length > 0 && (
        <Button
          variant="ghost"
          onClick={onClear}
          className="h-8 px-2 text-sm dark:border dark:border-white dark:border-opacity-20"
        >
          Limpar
        </Button>
      )}
    </div>
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option}
          className="flex items-center space-x-2"
        >
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...selected, option])
              } else {
                onChange(selected.filter((item) => item !== option))
              }
            }}
            className="form-checkbox h-4 w-4"
          />
          <span className="text-sm">{option}</span>
        </label>
      ))}
    </div>
  </div>
)

  return (
    <Card className="dark:bg-[#09090B] flex flex-col h-full">
      <CardHeader className="pb-4 flex-grow">
        <div className="flex flex-wrap justify-between items-center text-sm text-muted-foreground mb-3">
          <div className="flex space-x-2 text-xs">
            <span className="break-words">{item.type}</span>
            <span>•</span>
            <span className="break-words">{mostRecentPhase?.name ?? "N/A"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-3 w-3" />
            <time dateTime={item.date.toString()} className="text-xs">
              {new Date(item.date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </time>
          </div>
        </div>
        <Badge 
          className={item.authors.some(author => author.author_type === "Grupo" && author.name === "PS") ? "bg-pink-400 text-white w-fit" : 
            item.authors.some(author => author.author_type === "Grupo" && author.name === "CH") ? "bg-blue-950 text-white w-fit" : 
            item.authors.some(author => author.author_type === "Grupo" && author.name === "IL") ? "bg-cyan-400 text-white w-fit" : 
            item.authors.some(author => author.author_type === "Grupo" && author.name === "PCP") ? "bg-red-800 text-white w-fit" : 
            item.authors.some(author => author.author_type === "Grupo" && author.name === "BE") ? "bg-red-600 text-white w-fit" : 
            item.authors.some(author => author.author_type === "Grupo" && author.name === "CDS-PP") ? "bg-blue-500 text-white w-fit" : 
            item.authors.some(author => author.author_type === "Grupo" && author.name === "L") ? "bg-green-500 text-white w-fit" : 
            item.authors.some(author => author.author_type === "Grupo" && author.name === "PAN") ? "bg-green-800 text-white w-fit" : 
                      item.authors.some(author => author.author_type === "Grupo" && author.name === "PSD") ? "bg-orange-500 text-white w-fit" : "bg-default w-fit"} 
        >
            {item.authors
              .filter(author => author.author_type === "Grupo")
              .map(author => author.name)
              .join(', ')}
        </Badge>
        <h3 className="text-lg font-semibold leading-tight tracking-tight mb-2 mt-2">
          {item.title}
        </h3>
      </CardHeader>
      <CardContent className="pt-0 mt-auto flex space-x-4">
      <Link href={`/iniciativa/${item.id}`}>
        <Button variant="link" className="text-blue-600 outline-blue-600 outline p-0 px-3 py-2 hover:no-underline hover:text-white rounded-full hover:bg-blue-600 dark:outline-white dark:text-white hover:dark:bg-white hover:dark:text-black"> 
            <LetterText /> <p className="no-underline">Detalhes</p>
        </Button>
        </Link>
      <Link href={item.link} target="_blank">
        <Button variant="link" className="text-blue-600 outline-blue-600 outline p-0 px-3 py-2 hover:no-underline hover:text-white rounded-full hover:bg-blue-600 dark:outline-white dark:text-white hover:dark:bg-white hover:dark:text-black"> 
            <BookType /> <p className="no-underline">Proposta</p>
        </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

const DateRangeSelector = ({
  date,
  onDateChange,
}: {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "hidden md:flex justify-start text-left font-normal dark:bg-[#09090B]",
          !date && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date?.from ? (
          date.to ? (
            <>
              {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
            </>
          ) : (
            format(date.from, "dd/MM/yyyy")
          )
        ) : (
          <span>Data</span>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0 dark:bg-[#09090B]" align="start">
      <div className="p-3 border-b border-border flex justify-between items-center">
        <h4 className="font-medium text-sm">Data</h4>
        {date?.from && (
          <Button
            variant="ghost"
            className="h-8 px-2 text-sm dark:border dark:border-white dark:border-opacity-20"
            onClick={() => onDateChange(undefined)}
          >
            Limpar
          </Button>
        )}
      </div>
      <Calendar
        initialFocus
        mode="range"
        defaultMonth={date?.from}
        selected={date}
        onSelect={onDateChange}
        numberOfMonths={2}
      />
    </PopoverContent>
  </Popover>
)

const LoadingSkeleton = () => (
  <div className="h-10 bg-gray-700 rounded animate-pulse w-full"></div>
);

const LoadingPaginationSkeleton = () => (
  <div className="mt-5 flex justify-center">
    <LoadingSkeleton />
  </div>
);

// Main component
export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [allTypes, setAllTypes] = useState<string[]>([])
  const [allPhases, setAllPhases] = useState<string[]>(["Todas"])
  const [allAuthors, setAllAuthors] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    phases: [],
    authors: [],
    dateRange: undefined,
  })
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchItems({
        page: currentPage,
        search: searchTerm,
        types: filters.types,
        phases: filters.phases,
        dateRange: filters.dateRange,
        authors: filters.authors
      })
      setItems(data.results)
      setTotalPages(Math.ceil(data.count / 10))
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
      setIsFirstLoad(false)
    }
  }, [currentPage, filters, searchTerm])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [typesResponse, phasesResponse, authorsResponse] = await Promise.all([
          fetch(`https://legis.passosperdidos.pt/types/`),
          fetch(`https://legis.passosperdidos.pt/phases/`),
          fetch(`https://legis.passosperdidos.pt/authors/`),
        ])
        
        const typesData = await typesResponse.json()
        const phasesData = await phasesResponse.json()
        const authorsData = await authorsResponse.json()
        
        setAllTypes(typesData.filter((type: string) => type !== "Todos"))
        setAllPhases(phasesData)
        setAllAuthors(authorsData)
      } catch (error) {
        console.error("Error fetching initial data:", error)
      }
    }
    
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleFilterChange = (
    types: string[],
    phases: string[],
    authors: string[],
    dateRange: DateRange | undefined
  ) => {
    setFilters({ types, phases, authors, dateRange })
    setCurrentPage(1)
  }

  const clearAllFilters = useCallback(() => {
    setFilters({
      types: [],
      phases: [],
      authors: [],
      dateRange: undefined
    });
    setCurrentPage(1);
    setSearchTerm(""); 
  }, []);


  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex gap-4">
        <div className="hidden md:block">
          <Sidebar
            isLoading={isFirstLoad}
            allTypes={allTypes}
            selectedTypes={filters.types}
            onTypesChange={(types) => handleFilterChange(types, filters.phases, filters.authors, filters.dateRange)}
            allPhases={allPhases}
            selectedPhases={filters.phases}
            allAuthors={allAuthors}
            selectedAuthors={filters.authors}
            onPhasesChange={(phases) => handleFilterChange(filters.types, phases, filters.authors, filters.dateRange)}
            onAuthorsChange={(authors) => handleFilterChange(filters.types, filters.phases, authors, filters.dateRange)}
            onDateChange={(dateRange) => handleFilterChange(filters.types, filters.phases, filters.authors, dateRange)}
            onClearDate={() => handleFilterChange(filters.types, filters.phases, filters.authors, undefined)}
            date={filters.dateRange}
            onClearAllFilters={clearAllFilters}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex gap-4 mb-6">
            {isFirstLoad ? (
              <LoadingSkeleton />
            ) : (
              <Input
                type="search"
                placeholder="Pesquisar..."
                className="dark:bg-[#09090B] flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}

            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" className="dark:bg-[#09090B]">
                  Filtro
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[340px] dark:bg-[#09090B]">
                <div className="py-4">
                  <Sidebar
                    isLoading={isFirstLoad}
                    allTypes={allTypes}
                    selectedTypes={filters.types}
                    onTypesChange={(types) => handleFilterChange(types, filters.phases, filters.authors, filters.dateRange)}
                    allPhases={allPhases}
                    selectedPhases={filters.phases}
                    allAuthors={allAuthors}
                    selectedAuthors={filters.authors}
                    onAuthorsChange={(authors: string[]) => handleFilterChange(filters.types, filters.phases, authors, filters.dateRange)}
                    onDateChange={(dateRange) => handleFilterChange(filters.types, filters.phases, filters.authors, dateRange)}
                    onPhasesChange={(phases) => handleFilterChange(filters.types, phases, filters.authors, filters.dateRange)}
                    onClearDate={() => handleFilterChange(filters.types, filters.phases, filters.authors, undefined)}
                    date={filters.dateRange}
                    onClearAllFilters={clearAllFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
            
            {isFirstLoad ? (
              <LoadingSkeleton />
            ) : (
              <DateRangeSelector
                date={filters.dateRange}
                onDateChange={(dateRange) => handleFilterChange(filters.types, filters.phases, filters.authors, dateRange)}
              />
            )}
          </div>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 w-full">
            {isLoading
              ? Array.from({ length: 6 }, (_, index) => (
                  <Card key={`skeleton-${index}`} className="dark:bg-[#09090B]">
                    <CardHeader className="pb-4">
                      <div className="h-6 bg-gray-700 rounded w-full animate-pulse"></div>
                    </CardHeader>
                  </Card>
                ))
              : items.length === 0 ? (
                  <Card className="flex justify-center col-span-full dark:bg-[#09090B] text-center">
                    <CardContent>
                      <h3 className="text-lg text-[#94A3B8] pt-4">Nada Encontrado</h3>
                    </CardContent>
                  </Card>
                ) : (
                  items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))
                )}
          </div>

          {isLoading ? (
            <LoadingPaginationSkeleton />
          ) : (
            <div className="mt-8 flex justify-center">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}