"use client"

import { Calendar, Check, X, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"
import { Vote } from "../../../../lib/types"
import { convertVotesToPartyVotes, parseVoteDetails } from "../../../utils/vote-parsers"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface VotesPanelProps {
  votes: Vote[];
}

export function VotesPanel({ votes }: VotesPanelProps) {
  // Track open state for each vote
  const [openVotes, setOpenVotes] = useState<Record<number, boolean>>({});

  const toggleVote = (index: number) => {
    setOpenVotes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Get result color based on vote result
  const getResultColor = (result: string): string => {
    if (result.toLowerCase().includes('aprovad')) return 'bg-green-500';
    if (result.toLowerCase().includes('rejeitad')) return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-4">
      {votes.map((vote, index) => {
        const isOpen = openVotes[index] || false;
        
        // Process vote data
        let votesByType: Array<{ party: string; vote: "A Favor" | "Contra" | "Abstenção" }> = [];
        if (vote.votes) {
          votesByType = convertVotesToPartyVotes(vote.votes);
        } else if (vote.details) {
          votesByType = parseVoteDetails(vote.details);
        }
        
        // Count votes by type
        const voteCounts = {
          "A Favor": votesByType.filter(v => v.vote === "A Favor").length,
          "Contra": votesByType.filter(v => v.vote === "Contra").length,
          "Abstenção": votesByType.filter(v => v.vote === "Abstenção").length,
        };
        
        // Group votes by type
        const voteGroups: Record<string, string[]> = {
          "A Favor": votesByType.filter(v => v.vote === "A Favor").map(v => v.party),
          "Contra": votesByType.filter(v => v.vote === "Contra").map(v => v.party),
          "Abstenção": votesByType.filter(v => v.vote === "Abstenção").map(v => v.party),
        };

        return (
          <div key={index} className="bg-white dark:bg-[#09090B] rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className={`h-4 w-4 rounded-full ${getResultColor(vote.result)}`}></div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{vote.result}</h3>
              </div>
              
              {vote.date && (
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{new Date(vote.date).toLocaleDateString('pt-PT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                </div>
              )}
            </div>
            
            {vote.description && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">{vote.description}</p>
            )}

            <div className="flex flex-col md:flex-row gap-6 mb-4">
              <div className="flex items-center">
                <Check className="text-green-500 dark:text-green-400 h-5 w-5 mr-2" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">A Favor: {voteCounts["A Favor"]}</span>
              </div>
              
              <div className="flex items-center">
                <X className="text-red-500 dark:text-red-400 h-5 w-5 mr-2" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">Contra: {voteCounts["Contra"]}</span>
              </div>
              
              <div className="flex items-center">
                <div className="h-5 w-5 flex items-center justify-center mr-2">
                  <div className="h-0.5 w-3 bg-amber-500 dark:bg-amber-400"></div>
                </div>
                <span className="text-gray-800 dark:text-gray-200 font-medium">Abstenção: {voteCounts["Abstenção"]}</span>
              </div>
            </div>

            <Collapsible open={isOpen} onOpenChange={() => toggleVote(index)}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#09090B] px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0d0d0f]">
                Ver registo detalhado da votação
                <ChevronDown className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#09090B] p-4 mt-2">
                  {/* A Favor section */}
                  {voteGroups["A Favor"].length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Check className="h-5 w-5 text-green-500 dark:text-green-400" />
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">A Favor ({voteGroups["A Favor"].length})</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {voteGroups["A Favor"].map((party, idx) => (
                          <PartyBadge key={`favor-${idx}`} party={party} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contra section */}
                  {voteGroups["Contra"].length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <X className="h-5 w-5 text-red-500 dark:text-red-400" />
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">Contra ({voteGroups["Contra"].length})</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {voteGroups["Contra"].map((party, idx) => (
                          <PartyBadge key={`contra-${idx}`} party={party} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show separator only if needed */}
                  {(voteGroups["A Favor"].length > 0 || voteGroups["Contra"].length > 0) && 
                   voteGroups["Abstenção"].length > 0 && (
                    <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />
                  )}

                  {/* Abstenção section */}
                  {voteGroups["Abstenção"].length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-5 w-5 flex items-center justify-center">
                          <div className="h-0.5 w-3 bg-amber-500 dark:bg-amber-400"></div>
                        </div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">Abstenção ({voteGroups["Abstenção"].length})</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {voteGroups["Abstenção"].map((party, idx) => (
                          <PartyBadge key={`abstencao-${idx}`} party={party} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        );
      })}
    </div>
  );
}

// Helper component for party badges with dark mode support
function PartyBadge({ party }: { party: string }) {
  // Map parties to their respective colors
  const getPartyColorClasses = (party: string): string => {
    switch (party) {
      case "PS":
        return "bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700";
      case "PSD":
        return "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700";
      case "CH":
        return "bg-blue-800 hover:bg-blue-900 dark:bg-blue-700 dark:hover:bg-blue-800";
      case "IL":
        return "bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700";
      case "BE":
        return "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600";
      case "PCP":
        return "bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700";
      case "CDS-PP":
        return "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700";
      case "L":
        return "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700";
      case "PAN":
        return "bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700";
      default:
        return "bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700";
    }
  };

  return (
    <Badge className={cn("py-1.5 px-4 rounded-full text-white", getPartyColorClasses(party))}>
      {party}
    </Badge>
  );
}