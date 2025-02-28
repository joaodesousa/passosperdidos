"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MultiSelect } from "./multiselect"
import { useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface SidebarProps {
  isLoading: boolean
  allTypes: string[]
  selectedTypes: string[]
  onTypesChange: (types: string[]) => void
  allPhases: string[]
  selectedPhases: string[]
  onPhasesChange: (phases: string[]) => void
  allAuthors: string[]
  selectedAuthors: string[]
  onAuthorsChange: (authors: string[]) => void
  onDateChange: (dateRange: DateRange | undefined) => void
  onClearDate: () => void
  date: DateRange | undefined
  onClearAllFilters: () => void
}

export function Sidebar({
  allTypes,
  selectedTypes,
  onTypesChange,
  allPhases,
  selectedPhases,
  onPhasesChange,
  isLoading = false,
  date,
  onDateChange,
  onClearDate,
  allAuthors,
  selectedAuthors,
  onAuthorsChange,
  onClearAllFilters,
}: SidebarProps) {
  const [open, setOpen] = useState(false)
  const [authorValue, setAuthorValue] = useState("")

  const handleClearFilters = () => {
    setAuthorValue(""); // Reset local state
    onClearAllFilters(); // Call the function from the parent
  };
  

  return (
    <div className="w-full md:w-64 dark:bg-[#09090B] md:dark:border md:dark:border-blue md:dark:border-opacity-20 p-4 rounded-lg shadow">
      <div className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-sm font-medium mb-2">Tipo</h3>
              <MultiSelect
                options={allTypes.map((type) => ({ label: type, value: type }))}
                selected={selectedTypes}
                onChange={onTypesChange}
                placeholder="Selecione tipos..."
              />
            </div>

            <div className="dark:bg-[#09090B]">
              <h3 className="text-sm font-medium mb-2">Fase</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between dark:bg-[#09090B]">
                    {selectedPhases[0] || "Selecione fases..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 dark:bg-[#09090B]" align="start">
                  <Command className="w-full dark:bg-[#09090B]">
                    <CommandInput placeholder="Pesquisar fases..." className="dark:bg-[#09090B]" />
                    <CommandList className="dark:bg-[#09090B]">
                      <CommandEmpty>Nenhuma fase encontrada.</CommandEmpty>
                      <CommandGroup>
                        {allPhases.map((phase) => (
                          <CommandItem
                            key={phase}
                            onSelect={() => {
                              onPhasesChange([phase])
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", selectedPhases[0] === phase ? "opacity-100" : "opacity-0")}
                            />
                            {phase}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="dark:bg-[#09090B]">
              <h3 className="text-sm font-medium mb-2">Autor</h3>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between dark:bg-[#09090B]">
                    {authorValue ? allAuthors.find((author) => author === authorValue) : "Selecione autores..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 dark:bg-[#09090B]" align="start">
                  <Command className="w-full dark:bg-[#09090B]">
                    <CommandInput placeholder="Pesquisar autores..." className="dark:bg-[#09090B]" />
                    <CommandList>
                      <CommandEmpty>Nenhum autor encontrado.</CommandEmpty>
                      <CommandGroup className="dark:bg-[#09090B]">
                        {allAuthors.map((author) => (
                          <CommandItem
                            key={author}
                            onSelect={() => {
                              setAuthorValue(author === authorValue ? "" : author)
                              onAuthorsChange([author])
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", authorValue === author ? "opacity-100" : "opacity-0")}
                            />
                            {author}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="md:hidden">
              <h3 className="text-sm font-medium mb-2">Data</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "dark:bg-[#09090B] w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
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
                      <span>Selecione um período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="dark:bg-[#09090B] p-3 border-b border-border flex justify-between items-center">
                    <h4 className="dark:bg-[#09090B] font-medium text-sm">Data</h4>
                    {date?.from && (
                      <Button variant="ghost" className="h-8 px-2 text-sm" onClick={onClearDate}>
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
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button variant="outline" onClick={handleClearFilters} className="w-full mt-4 dark:bg-[#09090B]">
              Limpar Filtros
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
