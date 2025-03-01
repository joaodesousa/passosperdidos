import type { DateRange } from "react-day-picker"

export interface Phase {
  name: string
  date: string
}

export interface Item {
  id: number
  type: string
  title: string
  description: string
  link: string
  phases: Phase[]
  date: number
  authors: { author_type: string; name: string }[]
}

export interface FilterState {
  types: string[]
  phases: string[]
  authors: string[]
  dateRange: DateRange | undefined
}

export interface ApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: Item[]
}

export interface Author {
  name: string
  party: string | null
  author_type: "Grupo" | "Deputado" | "Outro"
}