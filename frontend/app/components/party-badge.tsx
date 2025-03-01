import React from "react"
import { Badge } from "@/components/ui/badge"

interface PartyBadgeProps {
  partyName: string
}

export const PartyBadge: React.FC<PartyBadgeProps> = ({ partyName }) => {
  const getPartyColorClass = (party: string): string => {
    switch (party) {
      case "PS":
        return "bg-pink-400 text-white"
      case "CH":
        return "bg-blue-950 text-white"
      case "IL":
        return "bg-cyan-400 text-white"
      case "PCP":
        return "bg-red-800 text-white"
      case "BE":
        return "bg-red-600 text-white"
      case "CDS-PP":
        return "bg-blue-500 text-white"
      case "L":
        return "bg-green-500 text-white"
      case "PAN":
        return "bg-green-800 text-white"
      case "PSD":
        return "bg-orange-500 text-white"
      default:
        return "bg-slate-500 text-white"
    }
  }

  return (
    <Badge className={`${getPartyColorClass(partyName)} w-fit`}>
      {partyName}
    </Badge>
  )
}