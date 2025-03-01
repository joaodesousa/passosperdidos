import React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CalendarIcon, BookType, LetterText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PartyBadge } from "./party-badge"
import { Item } from "@/lib/types"

interface ItemCardProps {
  item: Item
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const searchParams = useSearchParams()
  
  // Find the most recent phase
  const mostRecentPhase = item.phases.length > 0
    ? item.phases.reduce((prev, current) => 
        new Date(prev.date) > new Date(current.date) ? prev : current
      )
    : null

  // Create URLSearchParams for preserving pagination state
  const currentUrlParams = new URLSearchParams(searchParams.toString())
  
  // Build the detail link with preserved state
  const detailLink = `/iniciativa/${item.id}?returnTo=${encodeURIComponent(
    window.location.pathname + "?" + currentUrlParams.toString()
  )}`

  // Get party names for badges
  const partyNames = item.authors
    .filter(author => author.author_type === "Grupo")
    .map(author => author.name)

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
        <div className="flex flex-wrap gap-2 mb-2">
          {partyNames.map(party => (
            <PartyBadge key={party} partyName={party} />
          ))}
        </div>
        <h3 className="text-lg font-semibold leading-tight tracking-tight mb-2 mt-2">
          {item.title}
        </h3>
      </CardHeader>
      <CardContent className="pt-0 mt-auto flex space-x-4">
      <Link href={detailLink}>
        <Button variant="link" className="text-blue-600 outline-blue-600 outline p-0 px-3 py-2 hover:no-underline hover:text-white rounded-full hover:bg-blue-600 dark:outline-white dark:text-white hover:dark:bg-white hover:dark:text-black"> 
            <LetterText className="mr-1" /> <p className="no-underline">Detalhes</p>
        </Button>
        </Link>
      <Link href={item.link} target="_blank">
        <Button variant="link" className="text-blue-600 outline-blue-600 outline p-0 px-3 py-2 hover:no-underline hover:text-white rounded-full hover:bg-blue-600 dark:outline-white dark:text-white hover:dark:bg-white hover:dark:text-black"> 
            <BookType className="mr-1" /> <p className="no-underline">Proposta</p>
        </Button>
        </Link>
      </CardContent>
    </Card>
  )
}