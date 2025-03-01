import React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

interface DateRangeSelectorProps {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  date,
  onDateChange,
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