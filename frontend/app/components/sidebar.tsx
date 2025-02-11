import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MultiSelect } from "./multiselect"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SidebarProps {
  isLoading: boolean;
  allTypes: string[];
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  allPhases: string[];
  selectedPhases: string[];
  onPhasesChange: (phases: string[]) => void;
  allAuthors: string[];
  selectedAuthors: string[];
  onAuthorsChange: (authors: string[]) => void;
  onDateChange: (dateRange: DateRange | undefined) => void;
  onClearDate: () => void;
  date: DateRange | undefined;
  onClearAllFilters: () => void;
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
  const handleClearFilters = () => {
    onClearAllFilters();
  };

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
      {/* ... existing code ... */}
    </div>
  )

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

            <div className="dark:bg-[#09090B] ">
              <h3 className="text-sm font-medium mb-2">Fase</h3>
              <Select onValueChange={(value) => onPhasesChange([value])} value={selectedPhases[0]}>
                <SelectTrigger className=" dark:bg-[#09090B] ">
                  <SelectValue className=" dark:bg-[#09090B] " placeholder="Selecione fases..." />
                </SelectTrigger>
                <SelectContent className=" dark:bg-[#09090B] ">
                  {allPhases.map((phase) => (
                    <SelectItem key={phase} value={phase}>
                      {phase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="dark:bg-[#09090B] ">
              <h3 className="text-sm font-medium mb-2">Autor</h3>
              <Select onValueChange={(value) => onAuthorsChange([value])} value={selectedAuthors[0]}>
                <SelectTrigger className="dark:bg-[#09090B]">
                  <SelectValue className="dark:bg-[#09090B]" placeholder="Selecione autores..." />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#09090B]">
                  {allAuthors.map((author) => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:hidden">
              <h3 className="text-sm font-medium mb-2">Data</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("dark:bg-[#09090B] w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
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

