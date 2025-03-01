// frontend/app/iniciativa/[external_id]/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import Loading from '../../loading';
import { DetailContent } from './detail-content';
import { getProposalForId } from '../../../lib/server-api';

// Generate metadata
export async function generateMetadata(
  { params }: { params: { external_id: string } }
): Promise<Metadata> {
  try {
    // Try to fetch the proposal data
    const proposal = await getProposalForId(params.external_id);
    
    if (proposal) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://passosperdidos.pt';
      const title = `${proposal.type}: ${proposal.title}`;
      const description = proposal.description || `Detalhes da iniciativa legislativa ${params.external_id}`;
      
      // Create OG image URL with encoded parameters
      const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(proposal.title)}&subtitle=${encodeURIComponent(proposal.type)}`;
      
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: 'article',
          url: `${baseUrl}/iniciativa/${params.external_id}`,
          images: [{
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: title,
          }],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [ogImageUrl],
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  // Fallback metadata
  return {
    title: 'Iniciativa Legislativa | Passos Perdidos',
    description: 'Detalhes da iniciativa legislativa',
  };
}

// Main page component
export default function ProposalDetails({ params }: { 
  params: { external_id: string } 
}) {
  return (
    <Suspense fallback={<Loading />}>
      <DetailContent externalId={params.external_id} />
    </Suspense>
  );
}