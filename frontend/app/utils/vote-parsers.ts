// utils/vote-parsers.ts
import { Vote, PartyVote, VoteParties } from "../../lib/types";

// Function to get vote icon information (instead of returning JSX)
export const getVoteIconInfo = (vote: string): { color: string, type: 'check' | 'x' | 'minus' | null } => {
  switch (vote) {
    case "A Favor":
      return { color: "text-green-500", type: 'check' };
    case "Contra":
      return { color: "text-red-500", type: 'x' };
    case "Abstenção":
      return { color: "text-yellow-500", type: 'minus' };
    default:
      return { color: "", type: null };
  }
};

// Function to parse HTML vote details (backward compatibility)
export function parseVoteDetails(details: string): PartyVote[] {
  const votesByType: PartyVote[] = [];
  
  // Split by <BR> to get each vote type section
  const sections = details.split("<BR>");
  
  sections.forEach(section => {
    // Extract vote type and parties
    const [voteType, partiesStr] = section.split(":");
    if (!partiesStr) return;
    
    // Clean up vote type
    const vote = voteType.trim() as "A Favor" | "Contra" | "Abstenção";
    
    // Extract parties from <I> tags
    const partyMatches = partiesStr.match(/<I>[^<]+<\/I>/g) || [];
    
    partyMatches.forEach(match => {
      // Clean up party name
      const party = match.replace(/<\/?I>/g, '').trim();
      votesByType.push({ party, vote });
    });
  });
  
  return votesByType;
}

// Function to convert the votes object to PartyVote array format
export function convertVotesToPartyVotes(votes: VoteParties): PartyVote[] {
  const partyVotes: PartyVote[] = [];
  
  // Process "a_favor" votes
  votes.a_favor?.forEach(party => {
    partyVotes.push({ party, vote: "A Favor" });
  });
  
  // Process "contra" votes
  votes.contra?.forEach(party => {
    partyVotes.push({ party, vote: "Contra" });
  });
  
  // Process "abstencao" votes
  votes.abstencao?.forEach(party => {
    partyVotes.push({ party, vote: "Abstenção" });
  });
  
  return partyVotes;
}

// Function to get vote counts
export function getVoteCounts(vote: Vote) {
  let votesByType: PartyVote[] = [];
  
  if (vote.votes) {
    votesByType = convertVotesToPartyVotes(vote.votes);
  } else if (vote.details) {
    votesByType = parseVoteDetails(vote.details);
  }
  
  const counts = {
    "A Favor": 0,
    "Contra": 0,
    "Abstenção": 0
  };
  
  votesByType.forEach(partyVote => {
    counts[partyVote.vote]++;
  });
  
  return counts;
}