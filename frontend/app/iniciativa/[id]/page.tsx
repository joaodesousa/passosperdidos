"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarIcon, FileText, Download, Users, Paperclip, Clock, Vote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

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

  const sortedPhases = [...proposal.phases].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

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
                    {sortedPhases.length - index}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{phase.name}</h3>
                    <time className="text-sm text-gray-500 dark:text-gray-400">{phase.date}</time>
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
        {proposal.votes.length > 1 ? (
          <Card className="dark:bg-[#09090B]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Vote className="mr-2 h-5 w-5" />
                Votações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposal.votes.map((vote, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <h3 className="font-semibold mb-2">Votação</h3>
                  <p>
                    <strong>Data:</strong> {vote.date || "Não disponível"}
                  </p>
                  <p>
                    <strong>Resultado:</strong> {vote.result === "Unknown" ? "Nenhuma votação ainda." : vote.result}
                  </p>
                  {vote.details && vote.result !== "Unknown" && (
                    <p>
                      <strong>Detalhes:</strong> {vote.details}
                    </p>
                  )}
                  {index < proposal.votes.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="dark:bg-[#09090B]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Vote className="mr-2 h-5 w-5" />
              Votações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Brevemente</p>
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
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        {attachment.name}
                      </a>
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