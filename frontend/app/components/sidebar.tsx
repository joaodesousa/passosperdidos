import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SidebarProps {
  allTypes: string[]
  selectedType: string
  onTypeChange: (type: string) => void
  allPhases: string[]
  selectedPhase: string
  onPhaseChange: (phase: string) => void
  isLoading?: boolean
  date?: DateRange
  onDateChange: (date: DateRange | undefined) => void
  onClearDate: () => void
}

export function Sidebar({ 
  allTypes, 
  selectedType, 
  onTypeChange,
  allPhases,
  selectedPhase,
  onPhaseChange,
  isLoading = false,
  date,
  onDateChange,
  onClearDate,
}: SidebarProps) {
  return (
    <div className="w-full md:w-64 bg-[#09090B] dark:bg-[#09090B] md:dark:border md:dark:border-blue md:dark:border-opacity-20 p-4 rounded-lg shadow">

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Tipo</h3>
          <div className="space-y-2">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div 
                  key={i}
                  className="h-10 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md"
                />
              ))
            ) : (
              allTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "ghost" : "ghost"}
                  className={`w-full justify-start ${selectedType === type ? "bg-slate-400 bg-opacity-20 dark:bg-gray-100 dark:hover:bg-opacity-20 dark:bg-opacity-10 dark:text-white" : ""}`}
                  onClick={() => onTypeChange(type)}
                >
                  {type}
                </Button>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Fase</h3>
          <div className="space-y-2">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div 
                  key={i}
                  className="h-10 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md"
                />
              ))
            ) : (
              allPhases.map((phase) => (
                <Button
                  key={phase}
                  variant={selectedPhase === phase ? "ghost" : "ghost"}
                  className={`w-full justify-start ${selectedPhase === phase ? "bg-slate-400 bg-opacity-20 dark:bg-gray-100 dark:hover:bg-opacity-20 dark:bg-opacity-10 dark:text-white" : ""}`}
                  onClick={() => onPhaseChange(phase)}
                >
                  {phase}
                </Button>
              ))
            )}
          </div>
        </div>

        {/* Add date filter in mobile view */}
        <div className="md:hidden">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal dark:bg-[#09090B]",
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
                    onClick={onClearDate}
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
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}

