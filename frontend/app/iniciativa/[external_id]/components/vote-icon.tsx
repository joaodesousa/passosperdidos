// components/vote-icon.tsx
import { Check, X, Minus } from "lucide-react";
import { getVoteIconInfo } from "../../../utils/vote-parsers";

interface VoteIconProps {
  vote: string;
  className?: string;
}

export function VoteIcon({ vote, className = "" }: VoteIconProps) {
  const { color, type } = getVoteIconInfo(vote);
  
  if (!type) return null;
  
  const iconClass = `h-4 w-4 ${color} ${className}`;
  
  switch (type) {
    case 'check':
      return <Check className={iconClass} />;
    case 'x':
      return <X className={iconClass} />;
    case 'minus':
      return <Minus className={iconClass} />;
    default:
      return null;
  }
}