import React from "react"
import { Button } from "@/components/ui/button"

interface FilterSectionProps {
  title: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  showClear?: boolean
  onClear?: () => void
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  options,
  selected,
  onChange,
  showClear = false,
  onClear,
}) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {title}
      </h3>
      {showClear && selected.length > 0 && onClear && (
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