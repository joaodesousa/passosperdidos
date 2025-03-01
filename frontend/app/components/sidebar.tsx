"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown, User, Users, Building } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MultiSelect } from "./multiselect"
import { useState, useEffect, useRef, useMemo } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Author } from "@/lib/types" // Make sure to import the Author type

// Helper function to get party color
const getPartyColor = (party: string | null): string => {
  switch(party) {
    case "PS":
      return "bg-pink-400 text-white";
    case "PSD":
      return "bg-orange-500 text-white";
    case "CH":
      return "bg-blue-950 text-white";
    case "IL":
      return "bg-cyan-400 text-white";
    case "PCP":
      return "bg-red-800 text-white";
    case "BE":
      return "bg-red-600 text-white";
    case "CDS-PP":
      return "bg-blue-500 text-white";
    case "L":
      return "bg-green-500 text-white";
    case "PAN":
      return "bg-green-800 text-white";
    case "V":
      return "bg-violet-500 text-white"; // Governo
    case "A":
      return "bg-blue-300 text-white"; // Açores
    case "M": 
      return "bg-yellow-500 text-white"; // Madeira
    default:
      return "bg-gray-500 text-white";
  }
};

// Helper function to get author type icon
const getAuthorTypeIcon = (type: string) => {
  switch(type) {
    case "Deputado":
      return <User className="mr-1 h-4 w-4" />;
    case "Grupo":
      return <Users className="mr-1 h-4 w-4" />;
    default:
      return <Building className="mr-1 h-4 w-4" />;
  }
};

// Helper function to get friendly names for author types
const getAuthorTypeName = (type: string): string => {
  switch(type) {
    case "Deputado":
      return "Deputados";
    case "Grupo":
      return "Grupos Parlamentares";
    case "Outro":
      return "Outras Entidades";
    default:
      return type;
  }
};

interface SidebarProps {
  isLoading: boolean
  allTypes: string[]
  selectedTypes: string[]
  onTypesChange: (types: string[]) => void
  allPhases: string[]
  selectedPhases: string[]
  onPhasesChange: (phases: string[]) => void
  allAuthors: Author[] // Changed to accept Author[] type
  selectedAuthors: string[]
  onAuthorsChange: (authors: string[]) => void
  onDateChange: (dateRange: DateRange | undefined) => void
  onClearDate: () => void
  date: DateRange | undefined
  onClearAllFilters: () => void
  isMobile?: boolean
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
  isMobile = false
}: SidebarProps) {
  const [phaseOpen, setPhaseOpen] = useState(false)
  const [authorOpen, setAuthorOpen] = useState(false)
  const [authorValue, setAuthorValue] = useState("")
  const [authorSearch, setAuthorSearch] = useState("")
  
  // Reference to the MultiSelect component
  const multiSelectRef = useRef<HTMLDivElement>(null)
  
  // Sync authorValue with selectedAuthors from props
  useEffect(() => {
    if (selectedAuthors.length > 0) {
      setAuthorValue(selectedAuthors[0])
    } else {
      setAuthorValue("")
    }
  }, [selectedAuthors])

  const handleClearFilters = () => {
    setAuthorValue("") 
    setAuthorSearch("")
    onClearAllFilters() 
  }
  
  // Group authors by author_type
  const groupedAuthors = useMemo(() => {
    if (!allAuthors || !Array.isArray(allAuthors)) return {};

    return allAuthors.reduce((acc, author) => {
      const authorType = author.author_type || "Outro";
      if (!acc[authorType]) {
        acc[authorType] = [];
      }
      acc[authorType].push(author);
      return acc;
    }, {} as Record<string, Author[]>);
  }, [allAuthors]);

  // Filter authors based on search
  const filteredGroups = useMemo(() => {
    if (!authorSearch.trim()) return groupedAuthors;
    
    const result: Record<string, Author[]> = {};
    
    Object.entries(groupedAuthors).forEach(([type, authors]) => {
      const filtered = authors.filter(author => 
        author.name.toLowerCase().includes(authorSearch.toLowerCase())
      );
      
      if (filtered.length > 0) {
        result[type] = filtered;
      }
    });
    
    return result;
  }, [groupedAuthors, authorSearch]);
  
  // Determine if any filters are active
  const hasActiveFilters = 
    selectedTypes.length > 0 || 
    selectedPhases.length > 0 || 
    selectedAuthors.length > 0 || 
    date?.from != null

  // Helper function to truncate text with ellipsis if too long
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }

  // Find the selected author's full data
  const selectedAuthorData = useMemo(() => {
    if (!authorValue) return null;
    return allAuthors.find(author => author.name === authorValue) || null;
  }, [authorValue, allAuthors]);

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
                ref={multiSelectRef}
                options={allTypes.map((type) => ({ label: type, value: type }))}
                selected={selectedTypes}
                onChange={onTypesChange}
                placeholder="Selecione tipos..."
                preventAutoOpen={isMobile}
              />
            </div>

            <div className="dark:bg-[#09090B]">
              <h3 className="text-sm font-medium mb-2">Fase</h3>
              <Popover open={phaseOpen} onOpenChange={setPhaseOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={phaseOpen} className="w-full justify-between dark:bg-[#09090B]">
                    <span className="truncate block mr-2">
                      {selectedPhases.length > 0 ? truncateText(selectedPhases[0], 20) : "Selecione fases..."}
                    </span>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50 flex-none" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0 dark:bg-[#09090B]" align="start">
                  <Command className="w-full dark:bg-[#09090B]">
                    <CommandInput placeholder="Pesquisar fases..." className="dark:bg-[#09090B]" />
                    <CommandList className="dark:bg-[#09090B] max-h-60">
                      <CommandEmpty>Nenhuma fase encontrada.</CommandEmpty>
                      <CommandGroup>
                        {allPhases.map((phase) => (
                          <CommandItem
                            key={phase}
                            onSelect={() => {
                              onPhasesChange(selectedPhases.includes(phase) ? [] : [phase])
                              setPhaseOpen(false)
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", selectedPhases.includes(phase) ? "opacity-100" : "opacity-0")}
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
              <Popover open={authorOpen} onOpenChange={setAuthorOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={authorOpen} className="w-full justify-between dark:bg-[#09090B]">
                    <div className="flex items-center truncate">
                      {selectedAuthorData ? (
                        <>
                          {getAuthorTypeIcon(selectedAuthorData.author_type)}
                          <span className="truncate mr-2">
                            {truncateText(selectedAuthorData.name, 16)}
                          </span>
                          {selectedAuthorData.party && (
                            <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${getPartyColor(selectedAuthorData.party)}`}>
                              {selectedAuthorData.party}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">Selecione autores...</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50 flex-none" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0 dark:bg-[#09090B]" align="start">
                  <Command className="w-full dark:bg-[#09090B]">
                    <CommandInput 
                      placeholder="Pesquisar autores..." 
                      className="dark:bg-[#09090B]"
                      value={authorSearch}
                      onValueChange={setAuthorSearch}
                    />
                    <CommandList className="max-h-[300px] overflow-auto">
                      <CommandEmpty>Nenhum autor encontrado.</CommandEmpty>
                      
                      {/* Group the authors by type */}
                      {Object.entries(filteredGroups).map(([type, authors]) => (
                        <CommandGroup heading={getAuthorTypeName(type)} key={type} className="dark:bg-[#09090B]">
                          {authors.map(author => (
                            <CommandItem
                              key={author.name}
                              onSelect={() => {
                                const newValue = author.name === authorValue ? "" : author.name;
                                setAuthorValue(newValue);
                                onAuthorsChange(newValue ? [newValue] : []);
                                setAuthorOpen(false);
                                setAuthorSearch("");
                              }}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center overflow-hidden">
                                <Check
                                  className={cn("mr-2 h-4 w-4 flex-shrink-0", authorValue === author.name ? "opacity-100" : "opacity-0")}
                                />
                                {getAuthorTypeIcon(author.author_type)}
                                <span className="truncate max-w-[170px]">{author.name}</span>
                              </div>
                              {author.party && (
                                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${getPartyColor(author.party)}`}>
                                  {author.party}
                                </span>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
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
                    <CalendarIcon className="mr-2 h-4 w-4 flex-none" />
                    <span className="truncate">
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
                    </span>
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

            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={handleClearFilters} 
                className="w-full mt-4 dark:bg-[#09090B]"
              >
                Limpar Todos os Filtros
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}