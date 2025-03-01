// components/vote-table.tsx
import { Badge } from "@/components/ui/badge";
import { Vote, PartyVote } from "../../../../lib/types";
import { getPartyColor } from "../../../utils/colors";
import { parseVoteDetails, convertVotesToPartyVotes } from "../../../utils/vote-parsers";
import { VoteIcon } from "./vote-icon";

interface VoteTableProps {
  vote: Vote;
}

export const VoteTable = ({ vote }: VoteTableProps) => {
  // Determine which data source to use
  let votesByType: PartyVote[] = [];
  
  if (vote.votes) {
    // Use the new votes object
    votesByType = convertVotesToPartyVotes(vote.votes);
  } else if (vote.details) {
    // Fallback to parsing details
    votesByType = parseVoteDetails(vote.details);
  }
  
  if (votesByType.length === 0) {
    return <p>Detalhes da votação não disponíveis.</p>;
  }
  
  // Group votes by type for better display
  const voteGroups: Record<string, PartyVote[]> = {
    "A Favor": [],
    "Contra": [],
    "Abstenção": []
  };
  
  votesByType.forEach(vote => {
    voteGroups[vote.vote].push(vote);
  });

  // Only render tables that have votes
  return (
    <div className="space-y-4">
      {Object.entries(voteGroups).map(([voteType, parties]) => {
        if (parties.length === 0) return null;
        
        return (
          <div key={voteType} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className={`p-3 flex items-center 
              ${voteType === "A Favor" ? "bg-green-50 dark:bg-green-900/20" : 
                voteType === "Contra" ? "bg-red-50 dark:bg-red-900/20" : 
                "bg-yellow-50 dark:bg-yellow-900/20"}`
            }>
              <VoteIcon vote={voteType} />
              <span className="ml-2 font-medium">{voteType} ({parties.length})</span>
            </div>
            
            <div className="p-3 flex flex-wrap gap-2">
              {parties.map((partyVote, idx) => (
                <Badge key={idx} className={`${getPartyColor(partyVote.party)}`}>
                  {partyVote.party}
                </Badge>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};