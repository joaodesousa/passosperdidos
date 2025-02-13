"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarIcon, FileText, Check, Download, Users, Paperclip, Clock, Vote, Minus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Author {
  name: string
  party: string | null
  author_type: string
}

interface Phase {
  id: number
  name: string
  date: string
}

interface Vote {
  date: string | null
  result: string
  details: string | null
}

interface Attachment {
  url: string
  name: string
  file_url: string
}

interface Proposal {
  id: number
  title: string
  type: string
  legislature: number
  date: string
  link: string
  authors: Author[]
  description: string
  external_id: string
  phases: Phase[]
  votes: Vote[]
  attachments: Attachment[]
  publication_url: string | null
  publication_date: string | null
}

interface ApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: Proposal[]
}

interface GroupedAuthors {
  [key: string]: Author[]
}

interface PartyVote {
  party: string;
  vote: "A Favor" | "Contra" | "Abstenção";
}


export default function ProposalDetails() {
  const params = useParams()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchToken = async () => {
      const response = await fetch('/api/token', { method: 'POST' })
      const data = await response.json()
      setToken(data.access)
    }
    fetchToken()
  }, [])

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        if (!token) return

        const response = await fetch(`https://legis.passosperdidos.pt/projetoslei?id=${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data: ApiResponse = await response.json()
        setProposal(data.results[0])
      } catch (error) {
        console.error('Error fetching proposal:', error)
      } finally {
        setLoading(false)
      }
    }
    if (token) {
      fetchProposal()
    }
  }, [params.id, token])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 mb-4" />
        <Skeleton className="h-6 mb-2" />
        <Skeleton className="h-4 mb-2" />
        <Skeleton className="h-4 mb-2" />
      </div>
    )
  }

  if (!proposal) {
    return <div>Proposal not found</div>
  }

  const groupedAuthors: GroupedAuthors = proposal.authors.reduce((acc: GroupedAuthors, author) => {
    if (!acc[author.author_type]) {
      acc[author.author_type] = []
    }
    acc[author.author_type].push(author)
    return acc
  }, {})

  const sortedPhases = [...proposal.phases].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    // Sort by date ascending
    return dateA - dateB; 
  });

  const renderVoteIcon = (vote: string) => {
    switch (vote) {
      case "A Favor":
        return <Check className="h-4 w-4 text-green-500" />
      case "Contra":
        return <X className="h-4 w-4 text-red-500" />
      case "Abstenção":
        return <Minus className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  function parseVoteDetails(details: string): PartyVote[] {
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

  const VoteTable = ({ details }: { details: string }) => {
    const votesByType = parseVoteDetails(details);
    
    const renderVoteIcon = (vote: string) => {
      switch (vote) {
        case "A Favor":
          return <Check className="h-4 w-4 text-green-500" />;
        case "Contra":
          return <X className="h-4 w-4 text-red-500" />;
        case "Abstenção":
          return <Minus className="h-4 w-4 text-yellow-500" />;
        default:
          return null;
      }
    };
  
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Partido</TableHead>
            <TableHead>Voto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {votesByType.map((vote, index) => (
            <TableRow key={index}>
              <TableCell>{vote.party}</TableCell>
              <TableCell className="flex items-center">
                {renderVoteIcon(vote.vote)}
                <span className="ml-2">{vote.vote}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para a lista
      </Link>

      <Card className="mb-8 dark:bg-[#09090B]">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                {proposal.type}
              </Badge>
              <CardTitle className="text-2xl font-bold">{proposal.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {proposal.link && (
            <Button variant="outline" size="sm" asChild>
              <a href={proposal.link} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4" />
                Ver texto completo
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Timeline Card */}
        <Card className="dark:bg-[#09090B]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Linha do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedPhases.map((phase, index) => (
                <div key={phase.id} className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{phase.name}</h3>
                    <time className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(phase.date).toLocaleDateString('pt-PT')}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Authors Card */}
        <Card className="dark:bg-[#09090B]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Autoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(groupedAuthors).map(([authorType, authors], index, array) => (
                <div key={authorType}>
                  <h3 className="font-semibold mb-2">{authorType}s:</h3>
                  <div className="flex flex-wrap gap-2">
                    {authors.map((author, idx) => (
                      <Badge key={idx} variant="secondary">
                        {author.name} {author.party && `(${author.party})`}
                      </Badge>
                    ))}
                  </div>
                  {index < array.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Votes Card */}
        {proposal.votes.length > 0 && (
          <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">Resultados das Votações</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {proposal.votes.map((result, index) => (
                <AccordionItem key={index} value={`item-${index}`} >
                  <AccordionTrigger>
                    {result.date ? new Date(result.date).toLocaleDateString('pt-PT') : 'Data não disponível'} - {result.result}
                  </AccordionTrigger>
                  <AccordionContent>
                  {result.details && <VoteTable details={result.details} />}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        )}

        {/* Attachments Card */}
        <Card className="dark:bg-[#09090B]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Paperclip className="mr-2 h-5 w-5" />
              Anexos e Publicações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proposal.attachments.length > 0 ? (
              <ul className="space-y-2">
                {proposal.attachments.map((attachment, index) => (
                  <li key={index}>
                    <Button variant="link" asChild>
                      <Link href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        {attachment.name}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum anexo disponível.</p>
            )}
            {proposal.publication_url && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Publicação:</h3>
                <Button variant="link" asChild>
                  <a href={proposal.publication_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    Ver publicação
                  </a>
                </Button>
                {proposal.publication_date && (
                  <p className="text-sm text-gray-500 mt-1">Data: {proposal.publication_date}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div> 
    </div>
  )
}