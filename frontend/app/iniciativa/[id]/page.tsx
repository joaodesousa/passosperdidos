"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarIcon, FileText, Download, Check, X, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for the proposal
const proposalData = {
  id: "416/XVI/1",
  title:
    "Aprova a reposição de freguesias agregadas pela Lei n.º 11-A/2013, de 28 de janeiro, concluindo o procedimento especial, simplificado e transitório de criação de Freguesias aprovado pela Lei n.º 39/2021, de 24 de junho",
  type: "Projeto de Lei",
  documentLinks: [
    { name: "formato DOCX", url: "#" },
    { name: "formato PDF", url: "#" },
  ],
  lastUpdate: "2025-01-15",
  attachments: [{ name: "A.I.G.", format: "PDF", url: "#" }],
  versions: [{ name: "Texto da Iniciativa - Versão 1", formatDOCX: "#", formatPDF: "#" }],
  authors: [
    "Hugo Soares (PSD)",
    "Alexandra Leitão (PS)",
    "Fabian Figueiredo (BE)",
    "Paula Santos (PCP)",
    "Isabel Mendes Lopes (L)",
    "Inês de Sousa Real (PAN)",
    // ... (other authors)
  ],
  timeline: [
    { date: "2025-01-08", event: "Entrada" },
    {
      date: "2025-01-08",
      event: "Publicação",
      details: "DAR II série A n.º 155, 2025.01.08, da 1.ª SL da XVI Leg (pág. 8-19)",
    },
    { date: "2025-01-10", event: "Admissão" },
    {
      date: "2025-01-10",
      event: "Baixa comissão distribuição inicial generalidade",
      details: "Comissão de Poder Local e Coesão Territorial - Comissão competente",
    },
    { date: "2025-01-15", event: "Admissão Proposta de Alteração" },
    { date: "2025-01-15", event: "Anúncio" },
    { date: "2025-01-17", event: "Discussão generalidade" },
    { date: "2025-01-17", event: "Votação na generalidade" },
    { date: "2025-01-17", event: "Votação na especialidade" },
    { date: "2025-01-17", event: "Votação final global" },
    { date: "2025-01-23", event: "Envio à Comissão para fixação da Redação final" },
    { date: "2025-01-30", event: "Decreto (Publicação)" },
    { date: "2025-02-05", event: "Envio para promulgação" },
  ],
  votingResults: [
    {
      type: "Votação na generalidade",
      date: "2025-01-17",
      result: "Aprovado",
      votes: [
        { party: "PSD", vote: "A Favor" },
        { party: "PS", vote: "A Favor" },
        { party: "BE", vote: "A Favor" },
        { party: "PCP", vote: "A Favor" },
        { party: "L", vote: "A Favor" },
        { party: "CDS-PP", vote: "A Favor" },
        { party: "PAN", vote: "A Favor" },
        { party: "CH", vote: "Abstenção" },
        { party: "IL", vote: "Contra" },
      ],
    },
    {
      type: "Votação final global",
      date: "2025-01-17",
      result: "Aprovado",
      votes: [
        { party: "PSD", vote: "A Favor" },
        { party: "PS", vote: "A Favor" },
        { party: "BE", vote: "A Favor" },
        { party: "PCP", vote: "A Favor" },
        { party: "L", vote: "A Favor" },
        { party: "CDS-PP", vote: "A Favor" },
        { party: "PAN", vote: "A Favor" },
        { party: "CH", vote: "Abstenção" },
        { party: "IL", vote: "Contra" },
      ],
    },
  ],
}

export default function ProposalDetails() {
  
  const params = useParams()
  const [proposal, setProposal] = useState(proposalData)
  const [realProposal, setRealProposal] = useState(proposalData)

  useEffect(() => {
    const fetchRealProposalData = async () => {
      // Fetch the bearer token
      const tokenResponse = await fetch('/api/token', { method: 'POST' });
      const tokenData = await tokenResponse.json();
      const bearerToken = tokenData.access; // Adjust based on the actual token structure

      // Fetch the proposal data with the bearer token
      const response = await fetch(`http://localhost:8000/projetoslei?id=${params.id}`, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });
      const data = await response.json();
      console.log(data)
      setRealProposal(data);
    }

    fetchRealProposalData();
  }, [])

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

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para a lista
      </Link>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start mb-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                {proposal.type}
              </Badge>
              <CardTitle className="text-2xl font-bold">{proposal.title}</CardTitle>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Última atualização: {proposal.lastUpdate}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {proposal.documentLinks.map((link, index) => (
              <Button key={index} variant="outline" size="sm" asChild>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 h-4 w-4" />
                  {link.name}
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Anexos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {proposal.attachments.map((attachment, index) => (
                <li key={index}>
                  <Button variant="link" asChild>
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      {attachment.name} ({attachment.format})
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Versões</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {proposal.versions.map((version, index) => (
                <li key={index} className="flex flex-col">
                  <span>{version.name}</span>
                  <div className="flex gap-2 mt-1">
                    <Button variant="outline" size="sm" asChild>
                      <a href={version.formatDOCX} target="_blank" rel="noopener noreferrer">
                        DOCX
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={version.formatPDF} target="_blank" rel="noopener noreferrer">
                        PDF
                      </a>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Autoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {proposal.authors.map((author, index) => (
              <Badge key={index} variant="secondary">
                {author}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Linha do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {proposal.timeline.map((event, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{event.event}</h3>
                    <time className="text-sm text-gray-500 dark:text-gray-400">{event.date}</time>
                  </div>
                  {event.details && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{event.details}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Resultados das Votações</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {proposal.votingResults.map((result, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>
                  {result.type} - {result.date}
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partido</TableHead>
                        <TableHead>Voto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.votes.map((vote, vIndex) => (
                        <TableRow key={vIndex}>
                          <TableCell>{vote.party}</TableCell>
                          <TableCell className="flex items-center">
                            {renderVoteIcon(vote.vote)}
                            <span className="ml-2">{vote.vote}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 font-semibold">Resultado: {result.result}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}

