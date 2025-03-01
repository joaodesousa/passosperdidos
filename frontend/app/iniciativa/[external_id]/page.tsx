"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// Import interfaces
import { Proposal, ApiResponse } from "../../../lib/types"
// Import components
import { PageHeader } from "./components/page-header"
import { ProposalHeader } from "./components/proposal-header"
import { AuthorsPanel } from "./components/authors-panel"
import { TimelinePanel } from "./components/timeline-panel"
import { VotesPanel } from "./components/votes-panel"
import { AttachmentsPanel } from "./components/attachments-panel"
import { LoadingSkeleton } from "./components/loading-skeleton"

export default function ProposalDetails() {
  const params = useParams();
  const externalId = params.external_id
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch auth token
  useEffect(() => {
    const fetchToken = async () => {
      const response = await fetch('/api/token', { method: 'POST' });
      const data = await response.json();
      setToken(data.access);
    };
    fetchToken();
  }, []);

  // Fetch proposal data
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        if (!token) return;

        const response = await fetch(`http://localhost:8000/projetoslei?external_id=${params.external_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data: ApiResponse = await response.json();
        setProposal(data.results[0]);
      } catch (error) {
        console.error('Error fetching proposal:', error);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchProposal();
    }
  }, [externalId, token]);

  // Loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (!proposal) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Iniciativa Não Encontrada</h1>
        <p className="mb-4">A iniciativa legislativa que procura não foi encontrada.</p>
        <Button onClick={() => window.history.back()}>
          Voltar à Lista
        </Button>
      </div>
    );
  }

  // Prepare data
  const sortedPhases = [...proposal.phases].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  const currentPhase = sortedPhases.length > 0 ? sortedPhases[sortedPhases.length - 1] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation and Action Buttons */}
      <PageHeader />

      {/* Main Proposal Card with Current Status */}
      <ProposalHeader 
        proposal={proposal} 
        currentPhase={currentPhase} 
      />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Authors Card */}
        <AuthorsPanel authors={proposal.authors} />

        {/* Timeline Card */}
        <TimelinePanel phases={sortedPhases} />

        {/* Votes Card */}
        {proposal.votes.length > 0 && (
          <VotesPanel votes={proposal.votes} />
        )}

        {/* Attachments Card */}
        <AttachmentsPanel 
          attachments={proposal.attachments}
          publicationUrl={proposal.publication_url}
          publicationDate={proposal.publication_date}
        />
      </div>
      
      {/* Print-only metadata section */}
      <div className="hidden print:block mt-8 text-sm text-gray-500 border-t pt-4">
        <p>Gerado do Passos Perdidos em {new Date().toLocaleDateString('pt-PT')}</p>
      </div>
    </div>
  )
}