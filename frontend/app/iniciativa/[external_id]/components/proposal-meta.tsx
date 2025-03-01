import { Metadata } from 'next';
import { Proposal } from '../../../../lib/types';

interface ProposalMetaProps {
  proposal: Proposal;
}

export function generateProposalMeta(proposal: Proposal): Metadata {
  const title = `${proposal.type}: ${proposal.title}`;
  const description = proposal.description || 
    `Detalhes da iniciativa legislativa ${proposal.external_id} no Passos Perdidos`;
  
  // Get the base URL without query parameters
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'https://passosperdidos.pt');

  // Create the canonical URL
  const canonicalUrl = `${baseUrl}/iniciativa/${proposal.external_id}`;
  
  // Create the OG image URL
  const ogImageUrl = `${baseUrl}/api/og/${proposal.external_id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export function ProposalMeta({ proposal }: ProposalMetaProps) {
  // This is a client component that doesn't render anything
  // It's just for TypeScript type checking
  return null;
}