"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Proposal, ApiResponse } from "../../../lib/types"
import { PageHeader } from "./components/page-header"
import { ProposalHeader } from "./components/proposal-header"
import { AuthorsPanel } from "./components/authors-panel"
import { TimelinePanel } from "./components/timeline-panel"
import { VotesPanel } from "./components/votes-panel"
import { AttachmentsPanel } from "./components/attachments-panel"
import { LoadingSkeleton } from "./components/loading-skeleton"
import Head from "next/head"
import { AppTitle } from "./components/app-title"

interface DetailContentProps {
  externalId: string;
}

export function DetailContent({ externalId }: DetailContentProps) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch auth token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/token', { method: 'POST' });
        const data = await response.json();
        setToken(data.access);
      } catch (error) {
        console.error("Error fetching token:", error);
        setLoading(false);
      }
    };
    fetchToken();
  }, []);


  useEffect(() => {
    const fetchProposal = async () => {
      try {
        if (!token) return;


        const response = await fetch(`https://legis.passosperdidos.pt/projetoslei?external_id=${externalId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data: ApiResponse = await response.json();
        
        if (data.results && data.results.length > 0) {
          setProposal(data.results[0]);
          

          document.title = data.results[0].title;
        } else {
          console.error("No results found for external_id:", externalId);
        }
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


  if (loading) {
    return <LoadingSkeleton />;
  }


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


  const sortedPhases = [...proposal.phases].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  const currentPhase = sortedPhases.length > 0 ? sortedPhases[sortedPhases.length - 1] : null;

  return (
    <>

      <AppTitle title={proposal.title} />

      <div className="container mx-auto px-4 py-8">
       
        <PageHeader proposal={proposal} />

       
        <ProposalHeader 
          proposal={proposal} 
          currentPhase={currentPhase} 
        />

        <div className="grid gap-8 md:grid-cols-2">
       
          <AuthorsPanel authors={proposal.authors} />

          <TimelinePanel phases={sortedPhases} />


          {proposal.votes.length > 0 && (
            <VotesPanel votes={proposal.votes} />
          )}


          <AttachmentsPanel 
            attachments={proposal.attachments}
            publicationUrl={proposal.publication_url}
            publicationDate={proposal.publication_date}
          />
        </div>
        
  
        <div className="hidden print:block mt-8 text-sm text-gray-500 border-t pt-4">
        <p>Retirado de Passos Perdidos em {new Date().toLocaleDateString('pt-PT')}</p>
        <p>URL: {typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : ''}</p>
      </div>
      </div>
    </>
  );
}