'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PaginationControls } from "./components/pagination"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Sidebar } from "./components/sidebar"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface Item {
  id: number
  type: string
  title: string
  description: string
  link: string
  phase: string
  date: number
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [allTypes, setAllTypes] = useState<string[]>(['Todos'])
  const [allPhases, setAllPhases] = useState<string[]>(['Todas'])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedType, setSelectedType] = useState('Todos')
  const [selectedPhase, setSelectedPhase] = useState('Todas')
  const [searchTerm, setSearchTerm] = useState("")
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      let url = `http://localhost:8000/projetoslei/?page=${currentPage}&search=${searchTerm}`
      
      if (selectedType !== 'Todos') {
        url += `&type=${selectedType}`
      }
      
      if (selectedPhase !== 'Todas') {
        url += `&phase=${selectedPhase}`
      }

      if (date?.from) {
        url += `&start_date=${format(date.from, 'yyyy-MM-dd')}`
      }

      if (date?.to) {
        url += `&end_date=${format(date.to, 'yyyy-MM-dd')}`
      }

      const response = await fetch(url)
      const data = await response.json()

      setItems(data.results)
      setTotalPages(Math.ceil(data.count / 10))
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, selectedType, selectedPhase, searchTerm, date])

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch(`http://localhost:8000/types/`)
        const data = await response.json()
        setAllTypes(['Todos', ...data.filter((type: string) => type !== 'Todos')])
      } catch (error) {
        console.error('Error fetching types:', error)
      }
    }
    fetchTypes()

    const fetchPhases = async () => {
      try {
        const response = await fetch(`http://localhost:8000/phases/`)
        const data = await response.json()
        setAllPhases(['Todas', ...data])
      } catch (error) {
        console.error('Error fetching phases:', error)
      }
    }
    fetchPhases()
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onFilterChange = (type: string, phase: string, newDate: DateRange | undefined) => {
    setSelectedType(type)
    setSelectedPhase(phase)
    setDate(newDate)
    setCurrentPage(1)
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex gap-4">
        <div className="hidden md:block">
          <Sidebar 
            isLoading={isLoading}
            allTypes={allTypes}
            selectedType={selectedType}
            onTypeChange={(type) => onFilterChange(type, selectedPhase, date)}
            allPhases={allPhases}
            selectedPhase={selectedPhase}
            onPhaseChange={(phase) => onFilterChange(selectedType, phase, date)}
            onDateChange={(newDate) => onFilterChange(selectedType, selectedPhase, newDate)}
            onClearDate={() => onFilterChange(selectedType, selectedPhase, undefined)}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex gap-4 mb-6">
            <Input 
              type="search" 
              placeholder="Pesquisar..." 
              className="dark:bg-[#09090B] flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" className="dark:bg-[#09090B]">
                  Filtro
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[340px] dark:bg-[#09090B]">
                <Sidebar 
                  isLoading={isLoading}
                  allTypes={allTypes}
                  selectedType={selectedType}
                  onTypeChange={(type) => onFilterChange(type, selectedPhase, date)}
                  allPhases={allPhases}
                  selectedPhase={selectedPhase}
                  onPhaseChange={(phase) => onFilterChange(selectedType, phase, date)}
                  onDateChange={(newDate) => onFilterChange(selectedType, selectedPhase, newDate)}
                  onClearDate={() => onFilterChange(selectedType, selectedPhase, undefined)}
                />
              </SheetContent>
            </Sheet>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "hidden md:flex justify-start text-left font-normal dark:bg-[#09090B]",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "dd/MM/yyyy")} -{" "}
                        {format(date.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(date.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>Data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b border-border flex justify-between items-center">
                  <h4 className="font-medium text-sm">Data</h4>
                  {date?.from && (
                    <Button
                      variant="ghost"
                      className="h-8 px-2 text-sm"
                      onClick={() => onFilterChange(selectedType, selectedPhase, undefined)}
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
                  onSelect={(newDate) => onFilterChange(selectedType, selectedPhase, newDate)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 w-full">
            {isLoading ? (
              [...Array(6)].map((_, index) => (
                <Card key={`skeleton-${index}`} className="dark:bg-[#09090B]">
                  <CardHeader className="pb-4">
                    <div className="h-6 bg-gray-700 rounded w-full animate-pulse"></div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              items.map((item) => (
                <Card className="dark:bg-[#09090B]" key={item.id}>
                  <CardHeader className="pb-4">
                    <div className="flex flex-wrap justify-between items-center text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-3 w-3" />
                        <time dateTime={item.date.toString()} className="text-xs">
                          {new Date(item.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </time>
                      </div>
                      <div className="flex space-x-2 text-xs">
                        <span className="break-words">{item.type}</span>
                        <span>•</span>
                        <span className="break-words">{item.phase}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold leading-tight tracking-tight break-words hyphens-auto">{item.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <Button variant="link" className="text-blue-600 p-0 mt-2">
                      <Link href={item.link} target="_blank">Ler Mais</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <PaginationControls 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        </div>
      </div>
    </main>
  )
}
