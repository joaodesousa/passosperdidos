"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"

type Option = {
  label: string
  value: string
}

type MultiSelectProps = {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  preventAutoOpen?: boolean // New prop to prevent auto-opening on mobile
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ options, selected, onChange, placeholder = "Select options...", preventAutoOpen = false }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    const handleUnselect = (option: string) => {
      onChange(selected.filter((s) => s !== option))
    }

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current
        if (input) {
          if (e.key === "Delete" || e.key === "Backspace") {
            if (input.value === "") {
              const newSelected = [...selected]
              newSelected.pop()
              onChange(newSelected)
            }
          }
          if (e.key === "Escape") {
            input.blur()
          }
        }
      },
      [selected, onChange],
    )

    // Modified to support preventAutoOpen
    const handleFocus = React.useCallback(() => {
      if (!preventAutoOpen) {
        setOpen(true)
      }
    }, [preventAutoOpen])

    const selectables = options.filter((option) => !selected.includes(option.value))

    return (
      <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
        <div 
          className="dark:bg-[#09090B] bg-white group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          ref={ref}
          onClick={() => {
            // Always allow explicit clicks to open the dropdown
            setOpen(true)
            inputRef.current?.focus()
          }}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.map((option) => {
              return (
                <Badge key={option} variant="secondary" className="hover:bg-secondary">
                  {options.find((o) => o.value === option)?.label}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(option)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={() => handleUnselect(option)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              )
            })}
            <CommandPrimitive.Input
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              onBlur={() => setOpen(false)}
              onFocus={handleFocus} // Use our custom handler
              placeholder={placeholder}
              className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
            />
          </div>
        </div>
        <div className="relative mt-2">
          {open && selectables.length > 0 ? (
            <div className="dark:bg-[#09090B] absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup className="h-full overflow-auto">
                {selectables.map((option) => {
                  return (
                    <CommandItem
                      key={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onSelect={() => {
                        setInputValue("")
                        onChange([...selected, option.value])
                      }}
                      className={"cursor-pointer"}
                    >
                      {option.label}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </div>
          ) : null}
        </div>
      </Command>
    )
  }
)

MultiSelect.displayName = "MultiSelect"