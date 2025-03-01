// components/proposal-header.tsx
import { CalendarIcon, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Proposal, Phase } from "../../../../lib/types";
import { getStatusColor } from "../../../utils/colors";

interface ProposalHeaderProps {
  proposal: Proposal;
  currentPhase: Phase | null;
}

export function ProposalHeader({ proposal, currentPhase }: ProposalHeaderProps) {
  const formattedDate = proposal.date 
    ? new Date(proposal.date).toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) 
    : 'Data desconhecida';

  return (
    <div>

      {/* Main Proposal Card with Current Status */}
      <Card className="mb-8 dark:bg-[#09090B] border-t-4 border-t-blue-500">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary" className="font-medium">
                  {proposal.type}
                </Badge>
                {currentPhase && (
                  <Badge variant="outline" className={`${getStatusColor(currentPhase.name)}`}>
                    {currentPhase.name}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl font-bold">{proposal.title}</CardTitle>
            </div>
            
            {proposal.link && (
              <Button variant="default" size="sm" asChild className="mt-2 md:mt-0 print:hidden text-white">
                <a href={proposal.link} target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 h-4 w-4 text-white" />
                  Ver Texto Completo
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {proposal.description && (
            <div className="mt-2">
              <p className="text-gray-700 dark:text-gray-300"></p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}